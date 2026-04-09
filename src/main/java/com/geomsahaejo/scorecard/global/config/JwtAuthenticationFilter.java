package com.geomsahaejo.scorecard.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorDetail;
import com.geomsahaejo.scorecard.global.response.ApiResponse;
import com.geomsahaejo.scorecard.global.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil       jwtUtil;
    private final ObjectMapper  objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String token = resolveToken(request);

        if (StringUtils.hasText(token)) {
            try {
                jwtUtil.validateToken(token);
                Long userId = jwtUtil.extractUserId(token);

                // SecurityContext에 인증 정보 등록
                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userId, null, List.of());

                SecurityContextHolder.getContext().setAuthentication(authentication);

            } catch (CustomException e) {
                // 토큰 위변조 / 만료 → 직접 응답 작성
                sendErrorResponse(response, request, e);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    // ── Authorization 헤더에서 토큰 추출 ───────────────────
    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }

    // ── 에러 응답 직접 작성 ────────────────────────────────
    private void sendErrorResponse(HttpServletResponse response,
                                   HttpServletRequest request,
                                   CustomException e) throws IOException {

        ApiResponse<Void> body = ApiResponse.fail(
                ErrorDetail.of(e.getErrorType(), request.getRequestURI())
        );

        response.setStatus(e.getErrorType().getHttpStatus().value());
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(objectMapper.writeValueAsString(body));
    }
}
