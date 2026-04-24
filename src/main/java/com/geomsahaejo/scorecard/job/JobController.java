package com.geomsahaejo.scorecard.job;

import com.geomsahaejo.scorecard.global.response.ApiResponse;
import com.geomsahaejo.scorecard.job.dto.JobStatusResponse;
import com.geomsahaejo.scorecard.job.dto.JobSubmitResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping("/submit")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<JobSubmitResponse> submit(@RequestParam("file") MultipartFile file) {
        Long userId = getUserId();
        JobSubmitResponse response = jobService.submit(userId, file);
        return ApiResponse.success(response);
    }

    @GetMapping("/{jobId}/status")
    public ApiResponse<JobStatusResponse> getStatus(@PathVariable Long jobId) {
        Long userId = getUserId();
        JobStatusResponse response = jobService.getStatus(userId, jobId);
        return ApiResponse.success(response);
    }

    @GetMapping("/list")
    public ApiResponse<List<JobStatusResponse>> getList() {
        Long userId = getUserId();
        List<JobStatusResponse> response = jobService.getList(userId);
        return ApiResponse.success(response);
    }

    private Long getUserId() {
        return (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
