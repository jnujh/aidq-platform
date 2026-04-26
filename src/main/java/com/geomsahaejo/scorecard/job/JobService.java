package com.geomsahaejo.scorecard.job;

import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import com.geomsahaejo.scorecard.infrastructure.mq.JobMessagePublisher;
import com.geomsahaejo.scorecard.infrastructure.s3.S3Uploader;
import com.geomsahaejo.scorecard.job.dto.JobStatusResponse;
import com.geomsahaejo.scorecard.job.dto.JobSubmitResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final S3Uploader s3Uploader;
    private final JobMessagePublisher jobMessagePublisher;

    @Transactional
    public JobSubmitResponse submit(Long userId, String jobName, String purpose,
                                     MultipartFile file, Map<String, Double> weights) {
        String s3Key = s3Uploader.upload(userId, file);

        Job job = Job.create(userId, jobName, file.getOriginalFilename(), purpose, s3Key);
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
                job.getUpdatedAt()
        );
    }
}
