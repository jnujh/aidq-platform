import client from './client';

export interface ParentResultDto {
  jobId: number;
  totalScore: number;
  // 워커가 산출한 항목별 점수 JSON 원문(패스스루). 비교 UI 가 직접 파싱.
  resultDetail: string | null;
}

export interface JobResultResponse {
  jobId: number;
  totalScore: number;
  resultS3Key: string;
  reportS3Key: string | null;
  createdAt: string;
  // 항목별 점수 JSON 원문(패스스루). S3 다운로드 실패 시 null 가능.
  resultDetail: string | null;
  // 재진단(자식 Job) 인 경우 부모 결과 요약. 1차 진단이면 null.
  parent: ParentResultDto | null;
}

export const resultsApi = {
  getResult(jobId: number) {
    return client.get<{ success: boolean; data: JobResultResponse }>(`/api/results/${jobId}`);
  },

  getReport(jobId: number) {
    return client.get<{ success: boolean; data: string }>(`/api/results/${jobId}/report`);
  },
};
