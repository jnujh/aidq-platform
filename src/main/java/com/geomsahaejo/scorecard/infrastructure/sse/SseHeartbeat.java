package com.geomsahaejo.scorecard.infrastructure.sse;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;

/**
 * 30초 주기 SSE 하트비트. idle 커넥션이 nginx(keepalive ~75s)·ALB(~60s) 타임아웃에
 * 조용히 끊기는 것을 막는다. comment 라인(": ...")은 EventSource가 무시하므로
 * 클라이언트 핸들러에는 영향 없이 커넥션만 살려둔다. 전송 실패한 emitter는 정리한다.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class SseHeartbeat {

    private final SseEmitterRepository emitterRepository;

    @Scheduled(fixedDelay = 30_000L)
    public void ping() {
        Map<Long, SseEmitter> emitters = emitterRepository.getAll();
        for (Map.Entry<Long, SseEmitter> entry : emitters.entrySet()) {
            try {
                entry.getValue().send(SseEmitter.event().comment("heartbeat"));
            } catch (IOException | IllegalStateException e) {
                emitterRepository.remove(entry.getKey());
            }
        }
    }
}
