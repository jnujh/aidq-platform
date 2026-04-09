package com.geomsahaejo.scorecard.global.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.geomsahaejo.scorecard.global.response.ApiResponse;

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
                        errorType.getHttpStatus().value(),
                        e.getMessage(),
                        ErrorDetail.builder()
                                .path(request.getMethod() + " " + request.getRequestURI())
                                .type(errorType.name())
                                .build()
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
                .status(400)
                .body(ApiResponse.fail(
                        400,
                        message,
                        ErrorDetail.builder()
                                .path(request.getMethod() + " " + request.getRequestURI())
                                .type(ErrorType.INVALID_INPUT.name())
                                .build()
                ));
    }

    // ── 예상치 못한 예외 처리 ──────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(
            Exception e,
            HttpServletRequest request
    ) {
        return ResponseEntity
                .status(500)
                .body(ApiResponse.fail(
                        500,
                        ErrorType.INTERNAL_SERVER_ERROR.getMessage(),
                        ErrorDetail.builder()
                                .path(request.getMethod() + " " + request.getRequestURI())
                                .type(ErrorType.INTERNAL_SERVER_ERROR.name())
                                .build()
                ));
    }
}
