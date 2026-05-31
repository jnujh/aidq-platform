package com.geomsahaejo.scorecard.infrastructure.sse;

import com.geomsahaejo.scorecard.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@Slf4j
@RestController
@RequiredArgsConstructor
public class SseController {

    private static final long TIMEOUT = 60L * 1000 * 60; // 1시간

    private final SseEmitterRepository emitterRepository;
    private final JwtUtil jwtUtil;

    @GetMapping(value = "/api/jobs/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@RequestParam("token") String token) {
        // 쿼리 파라미터로 받은 토큰 직접 검증
        jwtUtil.validateToken(token);
        Long userId = jwtUtil.extractUserId(token);

        SseEmitter emitter = new SseEmitter(TIMEOUT);
        emitterRepository.save(userId, emitter);

        // 503 에러 방지용 초기 이벤트
        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("connected"));
        } catch (IOException e) {
            emitterRepository.remove(userId);
            log.warn("[SSE] 초기 이벤트 전송 실패 - userId: {}", userId, e);
        }

        log.info("[SSE] 구독 연결 - userId: {}", userId);
        return emitter;
    }
}
