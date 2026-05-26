package com.geomsahaejo.scorecard.auth;

import com.geomsahaejo.scorecard.auth.dto.LoginRequest;
import com.geomsahaejo.scorecard.auth.dto.LoginResponse;
import com.geomsahaejo.scorecard.auth.dto.SignupRequest;
import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import com.geomsahaejo.scorecard.global.util.JwtUtil;
import com.geomsahaejo.scorecard.user.User;
import com.geomsahaejo.scorecard.user.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserService userService;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @InjectMocks AuthService authService;

    @Test
    @DisplayName("회원가입 성공")
    void signup_success() {
        given(userService.existsByEmail("test@email.com")).willReturn(false);
        given(passwordEncoder.encode("password123")).willReturn("encoded_pw");

        authService.signup(new SignupRequest("test@email.com", "password123", "테스터"));

        verify(passwordEncoder).encode("password123");
        verify(userService).save(any(User.class));
    }

    @Test
    @DisplayName("회원가입 실패 - 중복 이메일")
    void signup_duplicateEmail() {
        given(userService.existsByEmail("dup@email.com")).willReturn(true);

        CustomException ex = assertThrows(CustomException.class,
                () -> authService.signup(new SignupRequest("dup@email.com", "password123", "테스터")));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.DUPLICATE_EMAIL);
        verify(userService, never()).save(any());
    }

    @Test
    @DisplayName("로그인 성공")
    void login_success() {
        User user = User.create("test@email.com", "encoded_pw", "테스터");
        ReflectionTestUtils.setField(user, "id", 1L);

        given(userService.findByEmail("test@email.com")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("password123", "encoded_pw")).willReturn(true);
        given(jwtUtil.generateToken(1L)).willReturn("jwt_token");

        LoginResponse response = authService.login(new LoginRequest("test@email.com", "password123"));

        assertThat(response.accessToken()).isEqualTo("jwt_token");
    }

    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 이메일")
    void login_emailNotFound() {
        given(userService.findByEmail("none@email.com")).willReturn(Optional.empty());

        CustomException ex = assertThrows(CustomException.class,
                () -> authService.login(new LoginRequest("none@email.com", "password123")));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.LOGIN_FAILED);
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 불일치")
    void login_wrongPassword() {
        User user = User.create("test@email.com", "encoded_pw", "테스터");
        ReflectionTestUtils.setField(user, "id", 1L);

        given(userService.findByEmail("test@email.com")).willReturn(Optional.of(user));
        given(passwordEncoder.matches("wrong_pw", "encoded_pw")).willReturn(false);

        CustomException ex = assertThrows(CustomException.class,
                () -> authService.login(new LoginRequest("test@email.com", "wrong_pw")));

        assertThat(ex.getErrorType()).isEqualTo(ErrorType.LOGIN_FAILED);
        verify(jwtUtil, never()).generateToken(anyLong());
    }
}
