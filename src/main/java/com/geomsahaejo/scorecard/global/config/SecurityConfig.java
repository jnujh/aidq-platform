package com.geomsahaejo.scorecard.global.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.geomsahaejo.scorecard.global.util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil            jwtUtil;
    private final ObjectMapper       objectMapper;
    private final JwtAuthEntryPoint  jwtAuthEntryPoint;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // CSRF 비활성화 (JWT Stateless → 불필요)
            .csrf(AbstractHttpConfigurer::disable)

            // 폼 로그인 / HTTP Basic 비활성화
            .formLogin(AbstractHttpConfigurer::disable)
            .httpBasic(AbstractHttpConfigurer::disable)

            // 세션 비활성화 (Stateless)
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // 인증 실패 EntryPoint 등록
            .exceptionHandling(ex ->
                ex.authenticationEntryPoint(jwtAuthEntryPoint))

            // 화이트리스트 설정
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "POST", "/api/users/signup",
                    "POST", "/api/users/login"
                ).permitAll()
                .anyRequest().authenticated()
            )

            // JWT 필터 등록
            .addFilterBefore(
                new JwtAuthenticationFilter(jwtUtil, objectMapper),
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
