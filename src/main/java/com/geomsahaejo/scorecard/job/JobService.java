package com.geomsahaejo.scorecard.job;

import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import com.geomsahaejo.scorecard.infrastructure.mq.JobMessagePublisher;
import com.geomsahaejo.scorecard.infrastructure.s3.S3Uploader;
import com.geomsahaejo.scorecard.job.dto.JobRetryResponse;
import com.geomsahaejo.scorecard.job.dto.JobStatusResponse;
import com.geomsahaejo.scorecard.job.dto.JobSubmitResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final S3Uploader s3Uploader;
    private final JobMessagePublisher jobMessagePublisher;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public JobSubmitResponse submit(Long userId, String jobName, String purpose,
                                     MultipartFile file, Map<String, Double> weights) {
        String s3Key = s3Uploader.upload(userId, file);

        String weightsJson = serializeWeights(weights);
        Job job = Job.create(userId, jobName, file.getOriginalFilename(), purpose, s3Key, weightsJson);
        jobRepository.save(job);

        try {
            jobMessagePublisher.publish(job, weights);
        } catch (Exception e) {
            log.error("[MQ] 진단 요청 발행 실패 - jobId: {}", job.getId(), e);
            job.updateStatus(JobStatus.FAILED);
            jobRepository.save(job);
            throw new CustomException(ErrorType.MESSAGE_PUBLISH_FAILED);
        }

        return new JobSubmitResponse(job.getId(), job.getStatus().name());
    }

    private String serializeWeights(Map<String, Double> weights) {
        if (weights == null || weights.isEmpty()) return null;
        try {
            return objectMapper.writeValueAsString(weights);
        } catch (Exception e) {
            log.warn("[JOB] weights 직렬화 실패 - 값 무시", e);
            return null;
        }
    }

    Map<String, Double> deserializeWeights(String weightsJson) {
        if (weightsJson == null || weightsJson.isBlank()) return null;
        try {
            return objectMapper.readValue(weightsJson, new TypeReference<Map<String, Double>>() {});
        } catch (Exception e) {
            log.warn("[JOB] weights 역직렬화 실패 - jobId 의 weightsJson 손상 가능", e);
            return null;
        }
    }

    @Transactional
    public JobRetryResponse retryDiagnosis(Long userId, Long parentJobId,
                                            String jobName, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new CustomException(ErrorType.EMPTY_FILE);
        }

        Job parent = jobRepository.findById(parentJobId)
                .orElseThrow(() -> new CustomException(ErrorType.JOB_NOT_FOUND));

        if (!parent.getUserId().equals(userId)) {
            throw new CustomException(ErrorType.FORBIDDEN);
        }

        // 재진단은 완료(DONE) 된 부모에 대해서만 허용
        if (parent.getStatus() != JobStatus.DONE) {
            throw new CustomException(ErrorType.JOB_PARENT_NOT_COMPLETED);
        }

        String s3Key = s3Uploader.upload(userId, file);

        Job child = Job.createRetry(parent, userId, jobName,
                file.getOriginalFilename(), s3Key);
        jobRepository.save(child);

        // 부모의 weights 스냅샷을 동일하게 발행 (의미: 동일 평가지표로 비교)
        Map<String, Double> weights = deserializeWeights(child.getWeightsJson());

        try {
            jobMessagePublisher.publish(child, weights);
        } catch (Exception e) {
            log.error("[MQ] 재진단 요청 발행 실패 - jobId: {}, parentJobId: {}",
                    child.getId(), parentJobId, e);
            child.updateStatus(JobStatus.FAILED);
            jobRepository.save(child);
            throw new CustomException(ErrorType.MESSAGE_PUBLISH_FAILED);
        }

        return new JobRetryResponse(child.getId(), child.getParentJobId(),
                child.getStatus().name());
    }

    @Transactional
    public JobSubmitResponse startDiagnosis(Long userId, String s3Key, String originalFilename,
                                             String jobName, String purpose, Map<String, Double> weights) {
        String weightsJson = serializeWeights(weights);
        Job job = Job.create(userId, jobName, originalFilename, purpose, s3Key, weightsJson);
        jobRepository.save(job);

        try {
            jobMessagePublisher.publish(job, weights);
        } catch (Exception e) {
            log.error("[MQ] 진단 요청 발행 실패 - jobId: {}", job.getId(), e);
            job.updateStatus(JobStatus.FAILED);
            jobRepository.save(job);
            throw new CustomException(ErrorType.MESSAGE_PUBLISH_FAILED);
        }

        return new JobSubmitResponse(job.getId(), job.getStatus().name());
    }

    @Transactional
    public JobRetryResponse retryWithS3Key(Long userId, Long parentJobId,
                                            String s3Key, String originalFilename, String jobName) {
        Job parent = jobRepository.findById(parentJobId)
                .orElseThrow(() -> new CustomException(ErrorType.JOB_NOT_FOUND));

        if (!parent.getUserId().equals(userId)) {
            throw new CustomException(ErrorType.FORBIDDEN);
        }

        if (parent.getStatus() != JobStatus.DONE) {
            throw new CustomException(ErrorType.JOB_PARENT_NOT_COMPLETED);
        }

        Job child = Job.createRetry(parent, userId, jobName, originalFilename, s3Key);
        jobRepository.save(child);

        Map<String, Double> weights = deserializeWeights(child.getWeightsJson());

        try {
            jobMessagePublisher.publish(child, weights);
        } catch (Exception e) {
            log.error("[MQ] 재진단 요청 발행 실패 - jobId: {}, parentJobId: {}",
                    child.getId(), parentJobId, e);
            child.updateStatus(JobStatus.FAILED);
            jobRepository.save(child);
            throw new CustomException(ErrorType.MESSAGE_PUBLISH_FAILED);
        }

        return new JobRetryResponse(child.getId(), child.getParentJobId(),
                child.getStatus().name());
    }

    @Transactional(readOnly = true)
    public JobStatusResponse getStatus(Long userId, Long jobId) {
        Job job = getByIdAndUserId(jobId, userId);
        return toStatusResponse(job);
    }

    @Transactional(readOnly = true)
    public List<JobStatusResponse> getList(Long userId) {
        return jobRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toStatusResponse)
                .toList();
    }

    @Transactional
    public void delete(Long userId, Long jobId) {
        Job job = getByIdAndUserId(jobId, userId);
        jobRepository.delete(job);
        log.info("[JOB] 작업 삭제 - jobId: {}, userId: {}", jobId, userId);
    }

    private Job getByIdAndUserId(Long jobId, Long userId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomException(ErrorType.JOB_NOT_FOUND));

        if (!job.getUserId().equals(userId)) {
            throw new CustomException(ErrorType.FORBIDDEN);
        }
        return job;
    }

    private JobStatusResponse toStatusResponse(Job job) {
        return new JobStatusResponse(
                job.getId(),
                job.getJobName(),
                job.getOriginalFilename(),
                job.getDataType() != null ? job.getDataType().name() : null,
                job.getStatus().name(),
                job.getCreatedAt(),
                job.getUpdatedAt(),
                job.getParentJobId(),
                job.getPurpose(),
                deserializeWeights(job.getWeightsJson())
        );
    }
}
