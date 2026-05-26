package com.geomsahaejo.scorecard.jobresult;

import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import com.geomsahaejo.scorecard.infrastructure.s3.S3Uploader;
import com.geomsahaejo.scorecard.job.Job;
import com.geomsahaejo.scorecard.job.JobRepository;
import com.geomsahaejo.scorecard.job.JobStatus;
import com.geomsahaejo.scorecard.jobresult.dto.JobResultResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.BDDMockito.given;

@ExtendWith(MockitoExtension.class)
class ResultServiceTest {

    @Mock JobRepository jobRepository;
    @Mock JobResultRepository jobResultRepository;
    @Mock S3Uploader s3Uploader;
    @InjectMocks ResultService resultService;

    private Job createDoneJob(Long id, Long userId) {
        Job job = Job.create(userId, "테스트작업", "data.csv", "ML 학습용", "s3://key", null);
        ReflectionTestUtils.setField(job, "id", id);
        job.updateStatus(JobStatus.DONE);
        return job;
    }

    private JobResult createResult(Long jobId, String reportS3Key) {
        JobResult result = JobResult.create(jobId, new BigDecimal("85.50"), "s3://result");
        if (reportS3Key != null) {
            result.updateReportS3Key(reportS3Key);
        }
        return result;
    }

    @Test
    @DisplayName("결과 조회 성공")
    void getResult_success() {
        Job job = createDoneJob(1L, 1L);
        JobResult result = createResult(1L, "s3://report");

        given(jobRepository.findById(1L)).willReturn(Optional.of(job));
        given(jobResultRepository.findByJobId(1L)).willReturn(Optional.of(result));

        JobResultResponse response = resultService.getResult(1L, 1L);

        assertThat(response.jobId()).isEqualTo(1L);
        assertThat(response.totalScore()).isEqualByComparingTo(new BigDecimal("85.50"));
    }

    @Test
    @DisplayName("결과 조회 실패 - 존재하지 않는 작업")
    void getResult_jobNotFound() {
        given(jobRepository.findById(999L)).willReturn(Optional.empty());

        CustomException ex = assertThrows(CustomException.class,
                () -> resultService.getResult(1L, 999L));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.JOB_NOT_FOUND);
    }

    @Test
    @DisplayName("결과 조회 실패 - 다른 사용자의 작업")
    void getResult_forbidden() {
        Job job = createDoneJob(1L, 2L);
        given(jobRepository.findById(1L)).willReturn(Optional.of(job));

        CustomException ex = assertThrows(CustomException.class,
                () -> resultService.getResult(1L, 1L));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.FORBIDDEN);
    }

    @Test
    @DisplayName("결과 조회 실패 - 진단 미완료")
    void getResult_jobNotCompleted() {
        Job job = Job.create(1L, "테스트작업", "data.csv", "ML 학습용", "s3://key", null);
        ReflectionTestUtils.setField(job, "id", 1L);
        // status = PENDING (기본값)

        given(jobRepository.findById(1L)).willReturn(Optional.of(job));

        CustomException ex = assertThrows(CustomException.class,
                () -> resultService.getResult(1L, 1L));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.JOB_NOT_COMPLETED);
    }

    @Test
    @DisplayName("결과 조회 실패 - 결과 미존재")
    void getResult_resultNotFound() {
        Job job = createDoneJob(1L, 1L);
        given(jobRepository.findById(1L)).willReturn(Optional.of(job));
        given(jobResultRepository.findByJobId(1L)).willReturn(Optional.empty());

        CustomException ex = assertThrows(CustomException.class,
                () -> resultService.getResult(1L, 1L));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.RESULT_NOT_FOUND);
    }

    @Test
    @DisplayName("리포트 조회 성공")
    void getReport_success() {
        Job job = createDoneJob(1L, 1L);
        JobResult result = createResult(1L, "s3://reports/1/llm_report.md");

        given(jobRepository.findById(1L)).willReturn(Optional.of(job));
        given(jobResultRepository.findByJobId(1L)).willReturn(Optional.of(result));
        given(s3Uploader.downloadJson("s3://reports/1/llm_report.md")).willReturn("리포트 내용");

        String report = resultService.getReport(1L, 1L);

        assertThat(report).isEqualTo("리포트 내용");
    }

    @Test
    @DisplayName("리포트 조회 실패 - 리포트 미생성")
    void getReport_reportNotFound() {
        Job job = createDoneJob(1L, 1L);
        JobResult result = createResult(1L, null);

        given(jobRepository.findById(1L)).willReturn(Optional.of(job));
        given(jobResultRepository.findByJobId(1L)).willReturn(Optional.of(result));

        CustomException ex = assertThrows(CustomException.class,
                () -> resultService.getReport(1L, 1L));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.REPORT_NOT_FOUND);
    }
}
