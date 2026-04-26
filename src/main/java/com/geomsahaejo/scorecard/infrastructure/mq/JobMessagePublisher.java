package com.geomsahaejo.scorecard.infrastructure.mq;

import com.geomsahaejo.scorecard.job.Job;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class JobMessagePublisher {

    private final RabbitTemplate rabbitTemplate;

    public void publish(Job job, Map<String, Double> weights) {
        DiagnosisMessage message = new DiagnosisMessage(
                job.getId(),
                job.getUserId(),
                job.getS3Key(),
                job.getOriginalFilename(),
                weights
        );

        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EXCHANGE,
                RabbitMQConfig.ROUTING_KEY,
                message
        );

        log.info("[MQ] 진단 요청 발행 완료 - jobId: {}, s3Key: {}", job.getId(), job.getS3Key());
    }
}
