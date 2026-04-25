package com.geomsahaejo.scorecard.infrastructure.s3;

import com.geomsahaejo.scorecard.global.exception.CustomException;
import com.geomsahaejo.scorecard.global.exception.ErrorType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class S3Uploader {

    private final S3Client s3Client;
    private final S3Properties s3Properties;

    public String upload(Long userId, MultipartFile file) {
        String key = generateKey(userId, file.getOriginalFilename());

        try {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(s3Properties.bucket())
                    .key(key)
                    .contentType(file.getContentType())
                    .contentLength(file.getSize())
                    .build();

            s3Client.putObject(request, RequestBody.fromInputStream(
                    file.getInputStream(), file.getSize()
            ));

            log.info("S3 업로드 완료: bucket={}, key={}", s3Properties.bucket(), key);
            return key;

        } catch (IOException e) {
            log.error("S3 업로드 실패: key={}", key, e);
            throw new CustomException(ErrorType.FILE_UPLOAD_FAILED);
        }
    }

    public String uploadJson(String key, String jsonContent) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(s3Properties.bucket())
                .key(key)
                .contentType("application/json")
                .build();

        s3Client.putObject(request, RequestBody.fromString(jsonContent));
        log.info("S3 JSON 업로드 완료: bucket={}, key={}", s3Properties.bucket(), key);
        return key;
    }

    private String generateKey(Long userId, String originalFilename) {
        String sanitized = (originalFilename != null) ? originalFilename : "unknown";
        String uuid = UUID.randomUUID().toString().substring(0, 8);
        return String.format("uploads/%d/%s_%s", userId, uuid, sanitized);
    }
}
