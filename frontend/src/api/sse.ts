import { authStore } from '../stores/authStore';

export interface JobUpdateEvent {
  jobId: number;
  status: string;
  dataType?: string;
}

const BASE_URL = import.meta.env.DEV ? 'http://localhost:8080' : '';

export function subscribeJobUpdates(
  onUpdate: (data: JobUpdateEvent) => void,
  onError?: () => void
): () => void {
  const token = authStore.getToken();
  if (!token) {
    onError?.();
    return () => {};
  }

  const eventSource = new EventSource(
    `${BASE_URL}/api/jobs/subscribe?token=${encodeURIComponent(token)}`
  );

  eventSource.addEventListener('job-update', ((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data);
      onUpdate(data);
    } catch {
      // 파싱 실패 무시
    }
  }) as EventListener);

  eventSource.onerror = () => {
    eventSource.close();
    onError?.();
  };

  return () => eventSource.close();
}
