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
