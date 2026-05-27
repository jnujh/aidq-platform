import axios from 'axios';
import client from './client';
import type { JobSubmitResponse, JobRetryResponse } from './jobs';

export const uploadsApi = {
  /** Presigned URL 발급 */
  presign(filename: string, contentType: string) {
    return client.post<{ success: boolean; data: { uploadUrl: string; s3Key: string } }>(
      '/api/uploads/presign',
      { filename, contentType },
    );
  },

  /** Presigned URL로 S3에 직접 업로드 (진행률 콜백 지원) */
  uploadToS3(uploadUrl: string, file: File, onProgress?: (percent: number) => void) {
    return axios.put(uploadUrl, file, {
      headers: { 'Content-Type': file.type || 'application/octet-stream' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      },
    });
  },

  /** s3Key 기반 진단 시작 (파일 없음) */
  startJob(
    s3Key: string,
    originalFilename: string,
    jobName?: string,
    purpose?: string,
    weights?: Record<string, number>,
  ) {
    return client.post<{ success: boolean; data: JobSubmitResponse }>(
      '/api/jobs/start',
      { s3Key, originalFilename, jobName, purpose, weights },
    );
  },

  /** s3Key 기반 재진단 시작 (파일 없음) */
  retryStart(parentJobId: number, s3Key: string, originalFilename: string, jobName?: string) {
    return client.post<{ success: boolean; data: JobRetryResponse }>(
      `/api/jobs/${parentJobId}/retry-start`,
      { s3Key, originalFilename, jobName },
    );
  },
};
