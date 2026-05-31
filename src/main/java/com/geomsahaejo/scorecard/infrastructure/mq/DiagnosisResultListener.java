package com.geomsahaejo.scorecard.infrastructure.mq;

import com.geomsahaejo.scorecard.infrastructure.llm.LlmService;
import com.geomsahaejo.scorecard.infrastructure.s3.S3Uploader;
import com.geomsahaejo.scorecard.infrastructure.sse.SseEmitterRepository;
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
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class DiagnosisResultListener {

    private final JobRepository jobRepository;
    private final JobResultRepository jobResultRepository;
    private final S3Uploader s3Uploader;
    private final LlmService llmService;
    private final SseEmitterRepository sseEmitterRepository;

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

        // 4) 원본 파일 S3에서 삭제 (비용 절감)
        try {
            s3Uploader.delete(job.getS3Key());
        } catch (Exception e) {
            log.warn("[S3] 원본 파일 삭제 실패 (진단 결과에는 영향 없음) - key: {}", job.getS3Key(), e);
        }

        // 5) LLM 리포트 자동 생성
        try {
            String report = llmService.generateReport(message.resultDetail(), job.getPurpose());
            if (report != null) {
                String reportS3Key = String.format("reports/%d/llm_report.md", job.getId());
                s3Uploader.uploadJson(reportS3Key, report);
                result.updateReportS3Key(reportS3Key);
                jobResultRepository.save(result);
                log.info("[LLM] 리포트 생성 완료 - jobId: {}", job.getId());
            }
        } catch (Exception e) {
            log.warn("[LLM] 리포트 생성 실패 (진단 결과는 정상 저장됨) - jobId: {}", job.getId(), e);
        }

        // 6) SSE로 사용자에게 작업 완료 알림 (모든 처리 완료 후 전송)
        notifyUser(job);
    }

    private void handleFailure(Job job, DiagnosisResultMessage message) {
        job.updateStatus(JobStatus.FAILED);
        jobRepository.save(job);

        log.warn("[MQ] 진단 실패 처리 - jobId: {}, reason: {}", job.getId(), message.errorMessage());

        notifyUser(job);
    }

    private void notifyUser(Job job) {
        sseEmitterRepository.get(job.getUserId()).ifPresent(emitter -> {
            try {
                Map<String, Object> eventData = new java.util.HashMap<>();
                eventData.put("jobId", job.getId());
                eventData.put("status", job.getStatus().name());
                if (job.getDataType() != null) {
                    eventData.put("dataType", job.getDataType().name());
                }
                emitter.send(SseEmitter.event()
                        .name("job-update")
                        .data(eventData));
                log.info("[SSE] 작업 상태 전송 - jobId: {}, status: {}", job.getId(), job.getStatus());
            } catch (IOException e) {
                sseEmitterRepository.remove(job.getUserId());
                log.warn("[SSE] 이벤트 전송 실패 - userId: {}", job.getUserId(), e);
            }
        });
    }
}
