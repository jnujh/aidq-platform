package com.geomsahaejo.scorecard.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.geomsahaejo.scorecard.global.exception.ErrorDetail;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final int status;
    private final String message;
    private final T data;
    private final ErrorDetail error;

    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .message("요청이 성공적으로 처리되었습니다.")
                .data(data)
                .build();
    }

    public static <T> ApiResponse<T> success(String message, T data) {
        return ApiResponse.<T>builder()
                .status(200)
                .message(message)
                .data(data)
                .build();
    }

    public static ApiResponse<Void> fail(int status, String message, ErrorDetail error) {
        return ApiResponse.<Void>builder()
                .status(status)
                .message(message)
                .error(error)
                .build();
    }
}
