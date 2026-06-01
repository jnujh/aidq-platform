#!/bin/bash
awslocal s3 mb s3://scorecard-uploads
echo "Bucket scorecard-uploads created."

# CORS 설정 (브라우저 → S3 직접 업로드 허용)
awslocal s3api put-bucket-cors --bucket scorecard-uploads --cors-configuration '{
  "CORSRules": [{
    "AllowedOrigins": ["*"],
    "AllowedMethods": ["PUT", "GET"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }]
}'
echo "CORS configuration applied."

# Lifecycle (비용 안전망): uploads/ 접두사(원본+청크) 1일 후 만료 + 미완료 Multipart 1일 후 abort.
# 정상 경로는 수초~수분 내 즉시 삭제되므로 안전망은 크래시 등 예외 시에만 발동. results/·reports/는 미적용.
awslocal s3api put-bucket-lifecycle-configuration --bucket scorecard-uploads \
  --lifecycle-configuration '{
  "Rules": [{
    "ID": "expire-uploads-1d",
    "Status": "Enabled",
    "Filter": {"Prefix": "uploads/"},
    "Expiration": {"Days": 1},
    "AbortIncompleteMultipartUpload": {"DaysAfterInitiation": 1}
  }]
}'
echo "Lifecycle configuration applied."
