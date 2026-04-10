package com.geomsahaejo.scorecard.auth;

import com.geomsahaejo.scorecard.auth.dto.LoginRequest;
import com.geomsahaejo.scorecard.auth.dto.LoginResponse;
import com.geomsahaejo.scorecard.auth.dto.SignupRequest;
import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import com.geomsahaejo.scorecard.global.util.JwtUtil;
import com.geomsahaejo.scorecard.user.User;
import com.geomsahaejo.scorecard.user.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public void signup(SignupRequest request) {
        if (userService.existsByEmail(request.email())) {
            throw new CustomException(ErrorType.DUPLICATE_EMAIL);
        }

        String encodedPassword = passwordEncoder.encode(request.password());
        User user = User.create(request.email(), encodedPassword, request.nickname());
        userService.save(user);
    }

    public LoginResponse login(LoginRequest request) {
        // 1단계: 이메일 존재 여부 확인
        User user = userService.findByEmail(request.email()).orElseGet(() -> {
            log.warn("[LOGIN FAILED] 존재하지 않는 이메일: {}", request.email());
            throw new CustomException(ErrorType.LOGIN_FAILED);
        });

        // 2단계: 비밀번호 일치 여부 확인
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            log.warn("[LOGIN FAILED] 비밀번호 불일치, userId: {}", user.getId());
            throw new CustomException(ErrorType.LOGIN_FAILED);
        }

        String token = jwtUtil.generateToken(user.getId());
        return new LoginResponse(token);
    }
}
