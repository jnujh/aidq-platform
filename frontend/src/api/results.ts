import client from './client';

export interface JobResultResponse {
  jobId: number;
  totalScore: number;
  resultS3Key: string;
  reportS3Key: string | null;
  createdAt: string;
}

export const resultsApi = {
  getResult(jobId: number) {
    return client.get<{ success: boolean; data: JobResultResponse }>(`/api/results/${jobId}`);
  },

  getReport(jobId: number) {
    return client.get<{ success: boolean; data: string }>(`/api/results/${jobId}/report`);
  },
};
