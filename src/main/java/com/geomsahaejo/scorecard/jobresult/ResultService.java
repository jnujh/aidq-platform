package com.geomsahaejo.scorecard.jobresult;

import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import com.geomsahaejo.scorecard.infrastructure.s3.S3Uploader;
import com.geomsahaejo.scorecard.job.Job;
import com.geomsahaejo.scorecard.job.JobRepository;
import com.geomsahaejo.scorecard.job.JobStatus;
import com.geomsahaejo.scorecard.jobresult.dto.JobResultResponse;
import com.geomsahaejo.scorecard.jobresult.dto.ParentResultDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResultService {

    private final JobRepository jobRepository;
    private final JobResultRepository jobResultRepository;
    private final S3Uploader s3Uploader;

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

        String resultDetail = safeDownload(result.getResultS3Key());
        ParentResultDto parent = loadParentSummary(job.getParentJobId());

        return new JobResultResponse(
                result.getJobId(),
                result.getTotalScore(),
                result.getResultS3Key(),
                result.getReportS3Key(),
                result.getCreatedAt(),
                resultDetail,
                parent
        );
    }

    // 재진단인 경우만 호출. 부모가 삭제됐거나 결과가 없으면 null 반환(자식 조회는 계속 성공).
    private ParentResultDto loadParentSummary(Long parentJobId) {
        if (parentJobId == null) return null;

        Job parentJob = jobRepository.findById(parentJobId).orElse(null);
        if (parentJob == null || parentJob.getStatus() != JobStatus.DONE) {
            return null;
        }

        JobResult parentResult = jobResultRepository.findByJobId(parentJobId).orElse(null);
        if (parentResult == null) return null;

        String parentDetail = safeDownload(parentResult.getResultS3Key());
        return new ParentResultDto(
                parentResult.getJobId(),
                parentResult.getTotalScore(),
                parentDetail
        );
    }

    private String safeDownload(String s3Key) {
        if (s3Key == null || s3Key.isBlank()) return null;
        try {
            return s3Uploader.downloadJson(s3Key);
        } catch (Exception e) {
            // result JSON 다운로드 실패해도 totalScore 등 기본 정보는 응답.
            log.warn("[RESULT] S3 결과 다운로드 실패 - key: {}", s3Key, e);
            return null;
        }
    }

    @Transactional(readOnly = true)
    public String getReport(Long userId, Long jobId) {
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

        if (result.getReportS3Key() == null) {
            throw new CustomException(ErrorType.REPORT_NOT_FOUND);
        }

        return s3Uploader.downloadJson(result.getReportS3Key());
    }
}
