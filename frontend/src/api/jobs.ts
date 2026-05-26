import client from './client';

export interface JobSubmitResponse {
  jobId: number;
  status: string;
}

export interface JobStatusResponse {
  jobId: number;
  jobName: string | null;
  originalFilename: string;
  dataType: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  // 재진단(자식 Job) 인 경우 부모 Job 의 id. 1차 진단이면 null.
  parentJobId: number | null;
  // 사용자가 입력한 사용 목적.
  purpose: string | null;
  // 진단 요청 시점의 가중치 스냅샷.
  weights: Record<string, number> | null;
}

export interface JobRetryResponse {
  jobId: number;
  parentJobId: number;
  status: string;
}

export const jobsApi = {
  submit(file: File, jobName?: string, purpose?: string, weights?: Record<string, number>) {
    const formData = new FormData();
    formData.append('file', file);
    if (jobName) formData.append('jobName', jobName);
    if (purpose) formData.append('purpose', purpose);
    if (weights) formData.append('weights', JSON.stringify(weights));
    return client.post<{ success: boolean; data: JobSubmitResponse }>('/api/jobs/submit', formData);
  },

  getStatus(jobId: number) {
    return client.get<{ success: boolean; data: JobStatusResponse }>(`/api/jobs/${jobId}/status`);
  },

  getList() {
    return client.get<{ success: boolean; data: JobStatusResponse[] }>('/api/jobs/list');
  },

  delete(jobId: number) {
    return client.delete<{ success: boolean }>(`/api/jobs/${jobId}`);
  },

  retryJob(parentJobId: number, file: File, jobName?: string) {
    const formData = new FormData();
    formData.append('file', file);
    if (jobName) formData.append('jobName', jobName);
    return client.post<{ success: boolean; data: JobRetryResponse }>(
      `/api/jobs/${parentJobId}/retry`,
      formData
    );
  },
};
