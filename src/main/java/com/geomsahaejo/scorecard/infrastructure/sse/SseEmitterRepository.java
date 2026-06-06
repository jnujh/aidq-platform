package com.geomsahaejo.scorecard.infrastructure.sse;

import org.springframework.stereotype.Repository;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class SseEmitterRepository {

    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();

    public SseEmitter save(Long userId, SseEmitter emitter) {
        emitters.put(userId, emitter);
        emitter.onCompletion(() -> emitters.remove(userId));
        // 타임아웃 시 complete()를 호출해야 내부 상태가 정리됨(좀비 emitter 방지)
        emitter.onTimeout(() -> {
            emitter.complete();
            emitters.remove(userId);
        });
        emitter.onError(e -> emitters.remove(userId));
        return emitter;
    }

    public Optional<SseEmitter> get(Long userId) {
        return Optional.ofNullable(emitters.get(userId));
    }

    public void remove(Long userId) {
        emitters.remove(userId);
    }

    // 하트비트 등 전체 순회용 (스냅샷 복사본 반환 — 순회 중 제거 안전)
    public Map<Long, SseEmitter> getAll() {
        return new HashMap<>(emitters);
    }
}
