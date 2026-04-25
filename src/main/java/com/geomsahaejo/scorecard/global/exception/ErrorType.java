package com.geomsahaejo.scorecard.global.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum ErrorType {

    // ── Common ──────────────────────────────────────────
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),
    INVALID_INPUT(HttpStatus.BAD_REQUEST, "입력값이 올바르지 않습니다."),

    // ── Auth / User ──────────────────────────────────────
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "인증이 필요합니다."),
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 존재하는 이메일입니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 사용자입니다."),
    INVALID_PASSWORD(HttpStatus.UNAUTHORIZED, "비밀번호가 올바르지 않습니다."),
    INVALID_TOKEN(HttpStatus.UNAUTHORIZED, "유효하지 않은 토큰입니다."),
    EXPIRED_TOKEN(HttpStatus.UNAUTHORIZED, "만료된 토큰입니다."),
    LOGIN_FAILED(HttpStatus.UNAUTHORIZED, "이메일 또는 비밀번호를 확인해주세요."),

    // ── Job ──────────────────────────────────────────────
    JOB_NOT_FOUND(HttpStatus.NOT_FOUND, "존재하지 않는 작업입니다."),
    JOB_ALREADY_COMPLETED(HttpStatus.CONFLICT, "이미 완료된 작업입니다."),
    FILE_UPLOAD_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "파일 업로드에 실패했습니다."),
    MESSAGE_PUBLISH_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "진단 요청 발행에 실패했습니다."),
    JOB_NOT_COMPLETED(HttpStatus.CONFLICT, "아직 진단이 완료되지 않은 작업입니다."),
    RESULT_NOT_FOUND(HttpStatus.NOT_FOUND, "진단 결과가 존재하지 않습니다."),

    // ── Permission ───────────────────────────────────────
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다.");

    private final HttpStatus httpStatus;
    private final String message;
}
