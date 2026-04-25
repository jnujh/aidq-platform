package com.geomsahaejo.scorecard.jobresult;

import com.geomsahaejo.scorecard.global.response.ApiResponse;
import com.geomsahaejo.scorecard.jobresult.dto.JobResultResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultController {

    private final ResultService resultService;

    @GetMapping("/{jobId}")
    public ApiResponse<JobResultResponse> getResult(@PathVariable Long jobId) {
        Long userId = getUserId();
        JobResultResponse response = resultService.getResult(userId, jobId);
        return ApiResponse.success(response);
    }

    @GetMapping("/{jobId}/report")
    public ApiResponse<String> getReport(@PathVariable Long jobId) {
        Long userId = getUserId();
        String report = resultService.getReport(userId, jobId);
        return ApiResponse.success(report);
    }

    private Long getUserId() {
        return (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
