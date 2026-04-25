package com.geomsahaejo.scorecard.jobresult;

import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import com.geomsahaejo.scorecard.job.Job;
import com.geomsahaejo.scorecard.job.JobRepository;
import com.geomsahaejo.scorecard.job.JobStatus;
import com.geomsahaejo.scorecard.jobresult.dto.JobResultResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final JobRepository jobRepository;
    private final JobResultRepository jobResultRepository;

    @Transactional(readOnly = true)
    public JobResultResponse getResult(Long userId, Long jobId) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomException(ErrorType.JOB_NOT_FOUND));

        if (!job.getUserId().equals(userId)) {
            throw new CustomException(ErrorType.FORBIDDEN);
        }

        if (job.getStatus() != JobStatus.DONE) {
            throw new CustomException(ErrorType.JOB_NOT_COMPLETED);
        }

        JobResult result = jobResultRepository.findByJobId(jobId)
                .orElseThrow(() -> new CustomException(ErrorType.RESULT_NOT_FOUND));

        return new JobResultResponse(
                result.getJobId(),
                result.getTotalScore(),
                result.getResultS3Key(),
                result.getReportS3Key(),
                result.getCreatedAt()
        );
    }
}
