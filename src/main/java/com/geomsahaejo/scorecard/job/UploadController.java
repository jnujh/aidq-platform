package com.geomsahaejo.scorecard.job;

import com.geomsahaejo.scorecard.global.response.ApiResponse;
import com.geomsahaejo.scorecard.infrastructure.s3.S3Uploader;
import com.geomsahaejo.scorecard.job.dto.JobRetryResponse;
import com.geomsahaejo.scorecard.job.dto.JobSubmitResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
public class UploadController {

    private final S3Uploader s3Uploader;
    private final JobService jobService;

    @PostMapping("/api/uploads/presign")
    public ApiResponse<S3Uploader.PresignedUploadResult> presign(@RequestBody PresignRequest request) {
        Long userId = getUserId();
        S3Uploader.PresignedUploadResult result = s3Uploader.generatePresignedUrl(
                userId, request.filename(), request.contentType());
        return ApiResponse.success(result);
    }

    @PostMapping("/api/jobs/start")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<JobSubmitResponse> start(@RequestBody StartJobRequest request) {
        Long userId = getUserId();
        JobSubmitResponse response = jobService.startDiagnosis(
                userId, request.s3Key(), request.originalFilename(),
                request.jobName(), request.purpose(), request.weights());
        return ApiResponse.success(response);
    }

    @PostMapping("/api/jobs/{parentJobId}/retry-start")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<JobRetryResponse> retryStart(
            @PathVariable Long parentJobId,
            @RequestBody RetryStartRequest request) {
        Long userId = getUserId();
        JobRetryResponse response = jobService.retryWithS3Key(
                userId, parentJobId, request.s3Key(),
                request.originalFilename(), request.jobName());
        return ApiResponse.success(response);
    }

    private Long getUserId() {
        return (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }

    public record PresignRequest(String filename, String contentType) {}

    public record StartJobRequest(
            String s3Key,
            String originalFilename,
            String jobName,
            String purpose,
            Map<String, Double> weights
    ) {}

    public record RetryStartRequest(
            String s3Key,
            String originalFilename,
            String jobName
    ) {}
}
