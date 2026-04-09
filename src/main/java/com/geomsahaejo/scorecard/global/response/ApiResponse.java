package com.geomsahaejo.scorecard.global.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.geomsahaejo.scorecard.global.exception.ErrorDetail;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {

    private final boolean success;
    private final T data;
    private final ErrorDetail error;

    // 성공 - 데이터 있음
    public static <T> ApiResponse<T> success(T data) {
        return ApiResponse.<T>builder()
                .success(true)
                .data(data)
                .build();
    }

    // 성공 - 데이터 없음 (회원가입, 삭제 등)
    public static ApiResponse<Void> success() {
        return ApiResponse.<Void>builder()
                .success(true)
                .build();
    }

    // 실패
    public static ApiResponse<Void> fail(ErrorDetail error) {
        return ApiResponse.<Void>builder()
                .success(false)
                .error(error)
                .build();
    }
}
