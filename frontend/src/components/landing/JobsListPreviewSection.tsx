import { Flex } from 'antd';
import { IconListCheck, IconClockHour4, IconDatabase, IconFile } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';
import jobsImg from '../../assets/jobs11.png';

const FEATURES = [
  {
    Icon: IconFile,
    label: '파일명·작업 이름 동시 표시',
    body: '같은 데이터로 여러 번 시도해도 작업 이름으로 구분',
  },
  {
    Icon: IconDatabase,
    label: '데이터 유형 자동 라벨',
    body: '정형 CSV / 비정형(이미지·텍스트) 한눈에 구분',
  },
  {
    Icon: IconClockHour4,
    label: 'KST 생성일시 + 상태',
    body: '완료·진행 중·실패를 색상으로 즉시 인지',
  },
  {
    Icon: IconListCheck,
    label: '재진단·삭제 액션',
    body: '한 줄에서 결과 열기·재진단·삭제까지',
  },
];

export default function JobsListPreviewSection() {
  return (
    <section
      style={{
        padding: '80px 40px',
        background: BRAND.colors.surfaces.subtle,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              color: BRAND.colors.primary,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            JOBS DASHBOARD
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 10,
            }}
          >
            진단 작업은 이렇게 한 화면에서 관리합니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
              lineHeight: 1.6,
              maxWidth: 680,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            업로드한 모든 진단을 한 리스트에서 — 데이터 유형, 상태, 생성일시까지 즉시 보입니다.
            완료된 작업은 클릭으로 결과·LLM 리포트로 바로 이동.
          </p>
        </div>

        <Flex gap={28} wrap="wrap" align="center">
          <div
            style={{
              flex: '2 1 520px',
              minWidth: 320,
              background: '#fff',
              border: '1px solid #E8EEF5',
              borderRadius: 14,
              padding: 14,
              boxShadow: '0 8px 24px rgba(4, 44, 83, 0.06)',
            }}
          >
            <img
              src={jobsImg}
              alt="플랫폼 작업 목록 화면"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                borderRadius: 8,
              }}
            />
          </div>

          <div
            style={{
              flex: '1 1 280px',
              minWidth: 260,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {FEATURES.map(({ Icon, label, body }) => (
              <div
                key={label}
                style={{
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: BRAND.colors.surfaces.cardBlue,
                    color: BRAND.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '0 0 auto',
                  }}
                >
                  <Icon size={18} stroke={2} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.bodySmall,
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primaryDark,
                      marginBottom: 4,
                      lineHeight: 1.4,
                    }}
                  >
                    {label}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#5A6678',
                      lineHeight: 1.6,
                    }}
                  >
                    {body}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Flex>
      </div>
    </section>
  );
}
