package com.geomsahaejo.scorecard.job;

import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import com.geomsahaejo.scorecard.infrastructure.s3.S3Uploader;
import com.geomsahaejo.scorecard.job.dto.JobStatusResponse;
import com.geomsahaejo.scorecard.job.dto.JobSubmitResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class JobService {

    private final JobRepository jobRepository;
    private final S3Uploader s3Uploader;

    @Transactional
    public JobSubmitResponse submit(Long userId, MultipartFile file) {
        String s3Key = s3Uploader.upload(userId, file);

        Job job = Job.create(userId, file.getOriginalFilename(), s3Key);
        jobRepository.save(job);

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
                job.getOriginalFilename(),
                job.getDataType() != null ? job.getDataType().name() : null,
                job.getStatus().name(),
                job.getCreatedAt(),
                job.getUpdatedAt()
        );
    }
}
