package com.geomsahaejo.scorecard.global.exception;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ErrorDetail {

    private final String path;
    private final String type;
}
