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
        Long userId = (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
        JobResultResponse response = resultService.getResult(userId, jobId);
        return ApiResponse.success(response);
    }
}
