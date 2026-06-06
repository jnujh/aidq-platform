import { jobsApi } from './jobs';

export interface JobUpdateEvent {
  jobId: number;
  status: string;
  dataType?: string;
}

const BASE_URL = import.meta.env.DEV ? 'http://localhost:8080' : '';
const MAX_RETRY = 6;

/**
 * 진단 작업 상태(job-update) SSE 구독.
 * - 구독 직전 단기 티켓(scope=sse, 60초)을 발급받아 그 티켓만 쿼리에 노출(전권 토큰 미노출).
 * - 연결이 끊기면(티켓 만료/네트워크) 지수 백오프로 재연결. MAX_RETRY 초과 시 onError로 폴백.
 * 반환값: 구독 해제 함수(동기).
 */
export function subscribeJobUpdates(
  onUpdate: (data: JobUpdateEvent) => void,
  onError?: () => void
): () => void {
  let closed = false;
  let es: EventSource | null = null;
  let retry = 0;
  let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

  const connect = async () => {
    if (closed) return;

    let ticket: string;
    try {
      ticket = await jobsApi.getSseTicket();
    } catch {
      // 티켓 발급 실패(인증 만료 등) → 폴링으로 폴백
      onError?.();
      return;
    }
    if (closed) return;

    es = new EventSource(`${BASE_URL}/api/jobs/subscribe?token=${encodeURIComponent(ticket)}`);

    es.addEventListener('connect', () => {
      retry = 0; // 연결 성공 → 백오프 리셋
    });

    es.addEventListener('job-update', ((event: MessageEvent) => {
      try {
        onUpdate(JSON.parse(event.data));
      } catch {
        // 파싱 실패 무시
      }
    }) as EventListener);

    es.onerror = () => {
      es?.close();
      es = null;
      if (closed) return;
      retry += 1;
      if (retry > MAX_RETRY) {
        onError?.();
        return;
      }
      const delay = Math.min(1000 * 2 ** retry, 30000);
      reconnectTimer = setTimeout(connect, delay);
    };
  };

  void connect();

  return () => {
    closed = true;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    es?.close();
  };
}
