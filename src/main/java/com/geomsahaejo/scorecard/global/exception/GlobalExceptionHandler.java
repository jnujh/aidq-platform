package com.geomsahaejo.scorecard.global.exception;

import com.geomsahaejo.scorecard.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ── CustomException 처리 ──────────────────────────────
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<Void>> handleCustomException(
            CustomException e,
            HttpServletRequest request
    ) {
        ErrorType errorType = e.getErrorType();

        return ResponseEntity
                .status(errorType.getHttpStatus())
                .body(ApiResponse.fail(
                        ErrorDetail.of(errorType, request.getRequestURI())
                ));
    }

    // ── @Valid 검증 실패 처리 ─────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(
            MethodArgumentNotValidException e,
            HttpServletRequest request
    ) {
        String message = e.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining(", "));

        return ResponseEntity
                .status(ErrorType.INVALID_INPUT.getHttpStatus())
                .body(ApiResponse.fail(
                        ErrorDetail.builder()
                                .code(ErrorType.INVALID_INPUT.name())
                                .message(message)   // ← Validation 메시지는 동적이라 직접 주입
                                .path(request.getRequestURI())
                                .build()
                ));
    }

    // ── 예상치 못한 예외 처리 ─────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(
            Exception e,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(ErrorType.INTERNAL_SERVER_ERROR.getHttpStatus())
                .body(ApiResponse.fail(
                        ErrorDetail.of(ErrorType.INTERNAL_SERVER_ERROR, request.getRequestURI())
                ));
    }
}
