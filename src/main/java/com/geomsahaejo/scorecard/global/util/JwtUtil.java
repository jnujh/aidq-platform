package com.geomsahaejo.scorecard.global.util;

import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtUtil(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.expiration-ms}") long expirationMs
    ) {
        this.secretKey   = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    // SSE 전용 단기 티켓 수명 (60초). EventSource는 헤더를 못 보내 토큰을 쿼리로 전달해야 하므로,
    // 전권 access token 대신 SSE 구독에만 유효한 짧은 scope 한정 티켓을 따로 발급한다.
    private static final long SSE_TICKET_TTL_MS = 60_000L;
    private static final String SSE_SCOPE = "sse";

    // ── 토큰 생성 ──────────────────────────────────────────
    public String generateToken(Long userId) {
        Date now    = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    // ── SSE 전용 단기 티켓 (scope=sse, 60초) ─────────────────
    public String generateSseTicket(Long userId) {
        Date now    = new Date();
        Date expiry = new Date(now.getTime() + SSE_TICKET_TTL_MS);

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("scope", SSE_SCOPE)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(secretKey)
                .compact();
    }

    // ── SSE 티켓 검증: scope=sse 가 아니면(전권 토큰 포함) 거부 ──
    public void validateSseTicket(String token) {
        if (!isSseTicket(token)) {
            throw new CustomException(ErrorType.INVALID_TOKEN);
        }
    }

    // ── SSE 전용 티켓 여부(scope=sse). 일반 인증 필터에서 SSE 티켓을 거부하는 데 사용 ──
    // (SSE 티켓이 일반 API 인증에도 통하면 노출 시 60초간 전권이 되어 scope 격리가 무의미해짐)
    public boolean isSseTicket(String token) {
        return SSE_SCOPE.equals(getClaims(token).get("scope"));
    }

    // ── userId 추출 ────────────────────────────────────────
    public Long extractUserId(String token) {
        return Long.parseLong(
                getClaims(token).getSubject()
        );
    }

    // ── 토큰 유효성 검증 ────────────────────────────────────
    public void validateToken(String token) {
        getClaims(token); // 예외 없으면 유효
    }

    // ── Claims 파싱 (내부) ──────────────────────────────────
    private Claims getClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

        } catch (ExpiredJwtException e) {
            throw new CustomException(ErrorType.EXPIRED_TOKEN);

        } catch (JwtException e) {
            throw new CustomException(ErrorType.INVALID_TOKEN);
        }
    }
}
