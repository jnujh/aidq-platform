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
