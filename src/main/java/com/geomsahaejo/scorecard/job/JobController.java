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
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping("/submit")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<JobSubmitResponse> submit(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "jobName", required = false) String jobName,
            @RequestParam(value = "purpose", required = false) String purpose,
            @RequestParam(value = "weights", required = false) String weightsJson) {
        Long userId = getUserId();
        Map<String, Double> weights = parseWeights(weightsJson);
        JobSubmitResponse response = jobService.submit(userId, jobName, purpose, file, weights);
        return ApiResponse.success(response);
    }

    private Map<String, Double> parseWeights(String weightsJson) {
        if (weightsJson == null || weightsJson.isBlank()) return null;
        try {
            var mapper = new tools.jackson.databind.ObjectMapper();
            var node = mapper.readTree(weightsJson);
            Map<String, Double> weights = new java.util.HashMap<>();
            for (String field : node.propertyNames()) {
                weights.put(field, node.path(field).asDouble());
            }
            return weights;
        } catch (Exception e) {
            return null;
        }
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

    @DeleteMapping("/{jobId}")
    public ApiResponse<Void> delete(@PathVariable Long jobId) {
        Long userId = getUserId();
        jobService.delete(userId, jobId);
        return ApiResponse.success(null);
    }

    private Long getUserId() {
        return (Long) SecurityContextHolder.getContext()
                .getAuthentication().getPrincipal();
    }
}
