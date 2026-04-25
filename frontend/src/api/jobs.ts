import client from './client';

export interface JobSubmitResponse {
  jobId: number;
  status: string;
}

export interface JobStatusResponse {
  jobId: number;
  originalFilename: string;
  dataType: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const jobsApi = {
  submit(file: File) {
    const formData = new FormData();
    formData.append('file', file);
    return client.post<{ success: boolean; data: JobSubmitResponse }>('/api/jobs/submit', formData);
  },

  getStatus(jobId: number) {
    return client.get<{ success: boolean; data: JobStatusResponse }>(`/api/jobs/${jobId}/status`);
  },

  getList() {
    return client.get<{ success: boolean; data: JobStatusResponse[] }>('/api/jobs/list');
  },
};
