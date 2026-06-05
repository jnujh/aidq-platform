import { useEffect, useRef } from 'react';
import { IconX } from '@tabler/icons-react';

type Props = {
  src: string;
  open: boolean;
  onClose: () => void;
};

/**
 * 풀스크린 비디오 모달 — 시연 영상 재생용
 *
 * 사용성:
 * - 네이티브 <video controls>로 재생/일시정지/스크럽(타임라인 드래그)/볼륨/전체화면 모두 지원
 * - ESC 키 또는 백드롭 클릭 또는 X 버튼으로 닫기
 * - 열릴 때 body 스크롤 잠금, 자동 재생 시도
 */
export default function VideoModal({ src, open, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // ESC 키로 닫기
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  // 열릴 때 body 스크롤 잠금
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // 열릴 때 자동 재생 시도 + 닫힐 때 일시정지
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (open) {
      v.currentTime = 0;
      void v.play().catch(() => {
        // 자동 재생 실패(브라우저 정책)는 무시 — controls로 사용자가 재생 가능
      });
    } else {
      v.pause();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        cursor: 'pointer',
      }}
      role="dialog"
      aria-modal="true"
      aria-label="시연 영상"
    >
      {/* 비디오 컨테이너 — 클릭 이벤트 전파 차단 (비디오 컨트롤 클릭 시 모달이 닫히지 않게) */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 1280,
          maxHeight: '90vh',
          cursor: 'default',
        }}
      >
        {/* 닫기 버튼 */}
        <button
          type="button"
          onClick={onClose}
          aria-label="영상 닫기"
          style={{
            position: 'absolute',
            top: -44,
            right: 0,
            background: 'transparent',
            border: 'none',
            color: 'rgba(255, 255, 255, 0.85)',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <IconX size={28} stroke={2} />
        </button>

        {/* 비디오 본체 — controls 속성으로 네이티브 재생/스크럽/볼륨/전체화면 UI 제공 */}
        <video
          ref={videoRef}
          src={src}
          controls
          controlsList="nodownload"
          playsInline
          style={{
            width: '100%',
            height: 'auto',
            maxHeight: '90vh',
            display: 'block',
            borderRadius: 12,
            background: '#000',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
          }}
        >
          영상을 재생할 수 없는 브라우저입니다.
        </video>
      </div>
    </div>
  );
}
