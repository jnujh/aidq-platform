package com.geomsahaejo.scorecard.infrastructure.sse;

import com.geomsahaejo.scorecard.global.response.ApiResponse;
import com.geomsahaejo.scorecard.global.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;

@Slf4j
@RestController
@RequiredArgsConstructor
public class SseController {

    private static final long TIMEOUT = 60L * 1000 * 60; // 1시간

    private final SseEmitterRepository emitterRepository;
    private final JwtUtil jwtUtil;

    /**
     * SSE 전용 단기 티켓 발급 (Authorization 헤더로 인증됨 → permitAll 아님).
     * EventSource는 헤더를 못 보내므로 토큰을 쿼리로 전달해야 하는데, 전권 access token을
     * 그대로 노출하지 않도록 scope=sse·60초 티켓을 발급해 그 티켓만 쿼리로 쓰게 한다.
     */
    @PostMapping("/api/jobs/subscribe-ticket")
    public ApiResponse<Map<String, String>> issueTicket() {
        Long userId = (Long) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        String ticket = jwtUtil.generateSseTicket(userId);
        return ApiResponse.success(Map.of("ticket", ticket));
    }

    @GetMapping(value = "/api/jobs/subscribe", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@RequestParam("token") String token, HttpServletResponse response) {
        // 쿼리로 받은 토큰은 SSE 전용 티켓(scope=sse)만 허용 — 전권 access token은 거부
        // validateSseTicket이 서명·만료(getClaims)와 scope를 함께 검증한다
        jwtUtil.validateSseTicket(token);
        Long userId = jwtUtil.extractUserId(token);

        // nginx가 이 응답 스트림을 버퍼링하지 않도록(즉시 flush) 헤더 명시
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache");

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
