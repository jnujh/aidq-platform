import { Flex } from 'antd';
import {
  IconChartLine,
  IconClock,
  IconCircleDot,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

const USE_CASES: Array<{
  Icon: typeof IconChartLine;
  title: string;
  body: string;
  focus: string;
}> = [
  {
    Icon: IconChartLine,
    title: '회귀 모델',
    body: '아파트 가격, 매출, 수율 같이 연속된 숫자를 맞히는 작업입니다.',
    focus: '이상치·노이즈·스케일 일관성 가중치 ↑',
  },
  {
    Icon: IconClock,
    title: '시계열 예측',
    body: '주가, 수요량, 트래픽처럼 시간 순서가 살아있어야 의미가 있는 작업입니다.',
    focus: '시간 누락·중복 타임스탬프·계절성 패턴 점검',
  },
  {
    Icon: IconCircleDot,
    title: '클러스터링·세분화',
    body: '고객 그룹화, 사용 패턴 묶기처럼 정답 라벨 없이 비슷한 것끼리 묶는 작업입니다.',
    focus: '특성 다양성·중복 행·차원별 분포 균형',
  },
  {
    Icon: IconAlertTriangle,
    title: '이상 탐지',
    body: '사기 거래, 설비 고장, 보안 이벤트처럼 드문 케이스를 찾아내는 작업입니다.',
    focus: '소수 클래스 보존·노이즈와 진짜 이상치 구분',
  },
];

export default function PurposeUseCasesSection() {
  return (
    <section
      style={{
        padding: '80px 40px',
        background: '#fff',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              color: BRAND.colors.primary,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            MORE USE CASES
          </div>
          <h2
            style={{
              fontSize: BRAND.fontSize.titleMedium,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 10,
            }}
          >
            분류 외에도, 데이터를 쓰는 방식은 다양합니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            회귀·시계열·군집·이상탐지 — 목적이 바뀌면 봐야 할 지표와 가중치도 함께 바뀝니다.
          </p>
        </div>

        <Flex gap={24} wrap="wrap" align="stretch">
          {USE_CASES.map(({ Icon, title, body, focus }) => (
            <div
              key={title}
              style={{
                flex: '1 1 calc(50% - 12px)',
                minWidth: 280,
                background: '#fff',
                border: '1px solid #E8EEF5',
                borderRadius: 18,
                padding: '32px 28px',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: BRAND.colors.surfaces.cardBlue,
                  color: BRAND.colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={30} stroke={2} />
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.titleSmall,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primaryDark,
                  lineHeight: 1.25,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.body,
                  color: '#444',
                  lineHeight: 1.6,
                }}
              >
                {body}
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 14,
                  borderTop: '1px dashed #E8EEF5',
                  fontSize: BRAND.fontSize.bodySmall,
                  color: BRAND.colors.primaryDark,
                  fontWeight: BRAND.fontWeight.semibold,
                }}
              >
                {focus}
              </div>
            </div>
          ))}
        </Flex>
      </div>
    </section>
  );
}
