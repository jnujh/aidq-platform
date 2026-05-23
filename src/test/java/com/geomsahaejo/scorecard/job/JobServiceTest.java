package com.geomsahaejo.scorecard.job;

import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import com.geomsahaejo.scorecard.infrastructure.mq.JobMessagePublisher;
import com.geomsahaejo.scorecard.infrastructure.s3.S3Uploader;
import com.geomsahaejo.scorecard.job.dto.JobStatusResponse;
import com.geomsahaejo.scorecard.job.dto.JobSubmitResponse;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.willThrow;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock JobRepository jobRepository;
    @Mock S3Uploader s3Uploader;
    @Mock JobMessagePublisher jobMessagePublisher;
    @InjectMocks JobService jobService;

    private Job createJob(Long id, Long userId) {
        Job job = Job.create(userId, "테스트작업", "data.csv", "ML 학습용", "s3://key");
        ReflectionTestUtils.setField(job, "id", id);
        return job;
    }

    @Test
    @DisplayName("작업 제출 성공")
    void submit_success() {
        MockMultipartFile file = new MockMultipartFile("file", "data.csv", "text/csv", "a,b\n1,2".getBytes());
        given(s3Uploader.upload(eq(1L), any())).willReturn("s3://uploaded-key");
        given(jobRepository.save(any(Job.class))).willAnswer(invocation -> {
            Job job = invocation.getArgument(0);
            ReflectionTestUtils.setField(job, "id", 100L);
            return job;
        });

        JobSubmitResponse response = jobService.submit(1L, "테스트작업", "ML 학습용", file, Map.of());

        assertThat(response.status()).isEqualTo("PENDING");
        verify(s3Uploader).upload(eq(1L), any());
        verify(jobMessagePublisher).publish(any(Job.class), any());
    }

    @Test
    @DisplayName("작업 제출 실패 - MQ 발행 실패")
    void submit_mqPublishFailed() {
        MockMultipartFile file = new MockMultipartFile("file", "data.csv", "text/csv", "a,b\n1,2".getBytes());
        given(s3Uploader.upload(eq(1L), any())).willReturn("s3://key");
        given(jobRepository.save(any(Job.class))).willAnswer(invocation -> {
            Job job = invocation.getArgument(0);
            ReflectionTestUtils.setField(job, "id", 100L);
            return job;
        });
        willThrow(new RuntimeException("MQ 연결 실패")).given(jobMessagePublisher).publish(any(), any());

        CustomException ex = assertThrows(CustomException.class,
                () -> jobService.submit(1L, "테스트작업", "ML 학습용", file, Map.of()));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.MESSAGE_PUBLISH_FAILED);

        // save()는 2번 호출: ① 최초 저장 ② 상태 FAILED로 변경 후 재저장
        ArgumentCaptor<Job> captor = ArgumentCaptor.forClass(Job.class);
        verify(jobRepository, org.mockito.Mockito.times(2)).save(captor.capture());
        Job failedJob = captor.getAllValues().get(1);
        assertThat(failedJob.getStatus()).isEqualTo(JobStatus.FAILED);
    }

    @Test
    @DisplayName("작업 상태 조회 성공")
    void getStatus_success() {
        Job job = createJob(1L, 1L);
        given(jobRepository.findById(1L)).willReturn(Optional.of(job));

        JobStatusResponse response = jobService.getStatus(1L, 1L);

        assertThat(response.jobId()).isEqualTo(1L);
        assertThat(response.status()).isEqualTo("PENDING");
    }

    @Test
    @DisplayName("작업 상태 조회 실패 - 존재하지 않는 작업")
    void getStatus_jobNotFound() {
        given(jobRepository.findById(999L)).willReturn(Optional.empty());

        CustomException ex = assertThrows(CustomException.class,
                () -> jobService.getStatus(1L, 999L));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.JOB_NOT_FOUND);
    }

    @Test
    @DisplayName("작업 상태 조회 실패 - 다른 사용자의 작업")
    void getStatus_forbidden() {
        Job job = createJob(1L, 2L);
        given(jobRepository.findById(1L)).willReturn(Optional.of(job));

        CustomException ex = assertThrows(CustomException.class,
                () -> jobService.getStatus(1L, 1L));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.FORBIDDEN);
    }

    @Test
    @DisplayName("작업 목록 조회")
    void getList_success() {
        Job job1 = createJob(1L, 1L);
        Job job2 = createJob(2L, 1L);
        given(jobRepository.findByUserIdOrderByCreatedAtDesc(1L)).willReturn(List.of(job1, job2));

        List<JobStatusResponse> responses = jobService.getList(1L);

        assertThat(responses).hasSize(2);
    }

    @Test
    @DisplayName("작업 삭제 성공")
    void delete_success() {
        Job job = createJob(1L, 1L);
        given(jobRepository.findById(1L)).willReturn(Optional.of(job));

        jobService.delete(1L, 1L);

        verify(jobRepository).delete(job);
    }

    @Test
    @DisplayName("작업 삭제 실패 - 다른 사용자의 작업")
    void delete_forbidden() {
        Job job = createJob(1L, 2L);
        given(jobRepository.findById(1L)).willReturn(Optional.of(job));

        CustomException ex = assertThrows(CustomException.class,
                () -> jobService.delete(1L, 1L));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.FORBIDDEN);
    }
}
