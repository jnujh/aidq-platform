package com.geomsahaejo.scorecard.global.exception;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ErrorDetail {

    private final String code;      // ErrorType.name()    → "USER_NOT_FOUND"
    private final String message;   // ErrorType.message() → "존재하지 않는 사용자입니다."
    private final String path;      // request.getRequestURI() → "/api/users/99"

    public static ErrorDetail of(ErrorType errorType, String path) {
        return ErrorDetail.builder()
                .code(errorType.name())
                .message(errorType.getMessage())
                .path(path)
                .build();
    }
}
