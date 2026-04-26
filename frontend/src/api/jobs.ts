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
};
