package com.geomsahaejo.scorecard.infrastructure.mq;

import com.geomsahaejo.scorecard.infrastructure.llm.GeminiService;
import com.geomsahaejo.scorecard.infrastructure.s3.S3Uploader;
import com.geomsahaejo.scorecard.job.DataType;
import com.geomsahaejo.scorecard.job.Job;
import com.geomsahaejo.scorecard.job.JobRepository;
import com.geomsahaejo.scorecard.job.JobStatus;
import com.geomsahaejo.scorecard.jobresult.JobResult;
import com.geomsahaejo.scorecard.jobresult.JobResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class DiagnosisResultListener {

    private final JobRepository jobRepository;
    private final JobResultRepository jobResultRepository;
    private final S3Uploader s3Uploader;
    private final GeminiService geminiService;

    @RabbitListener(queues = RabbitMQConfig.RESULT_QUEUE)
    @Transactional
    public void handleResult(DiagnosisResultMessage message) {
        log.info("[MQ] 진단 결과 수신 - jobId: {}, success: {}", message.jobId(), message.success());

        Job job = jobRepository.findById(message.jobId()).orElse(null);
        if (job == null) {
            log.error("[MQ] 존재하지 않는 jobId: {}", message.jobId());
            return;
        }

        if (message.success()) {
            handleSuccess(job, message);
        } else {
            handleFailure(job, message);
        }
    }

    private void handleSuccess(Job job, DiagnosisResultMessage message) {
        // 1) 결과 JSON을 S3에 저장
        String resultS3Key = String.format("results/%d/diagnosis_result.json", job.getId());
        s3Uploader.uploadJson(resultS3Key, message.resultDetail());

        // 2) JobResult 생성 + DB 저장
        JobResult result = JobResult.create(job.getId(), message.totalScore(), resultS3Key);
        jobResultRepository.save(result);

        // 3) Job 상태 업데이트
        if (message.dataType() != null) {
            job.updateDataType(DataType.valueOf(message.dataType()));
        }
        job.updateStatus(JobStatus.DONE);
        jobRepository.save(job);

        log.info("[MQ] 진단 완료 처리 - jobId: {}, score: {}", job.getId(), message.totalScore());

        // 4) LLM ��포트 자동 생성
        try {
            String report = geminiService.generateReport(message.resultDetail(), job.getPurpose());
            if (report != null) {
                String reportS3Key = String.format("reports/%d/llm_report.md", job.getId());
                s3Uploader.uploadJson(reportS3Key, report);
                result.updateReportS3Key(reportS3Key);
                jobResultRepository.save(result);
                log.info("[LLM] 리포트 생성 완료 - jobId: {}", job.getId());
            }
        } catch (Exception e) {
            log.warn("[LLM] ���포트 생성 실패 (진단 결과는 정상 저장됨) - jobId: {}", job.getId(), e);
        }
    }

    private void handleFailure(Job job, DiagnosisResultMessage message) {
        job.updateStatus(JobStatus.FAILED);
        jobRepository.save(job);

        log.warn("[MQ] 진단 실패 처리 - jobId: {}, reason: {}", job.getId(), message.errorMessage());
    }
}
