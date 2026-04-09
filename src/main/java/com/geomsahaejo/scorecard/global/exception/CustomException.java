package com.geomsahaejo.scorecard.global.exception;

import lombok.Getter;

@Getter
public class CustomException extends RuntimeException {

    private final ErrorType errorType;

    // 기본 메시지 사용 (ErrorType에 정의된 메시지)
    public CustomException(ErrorType errorType) {
        super(errorType.getMessage());
        this.errorType = errorType;
    }

    // 커스텀 메시지 사용 (동적 메시지가 필요할 때)
    public CustomException(ErrorType errorType, String message) {
        super(message);
        this.errorType = errorType;
    }
}
