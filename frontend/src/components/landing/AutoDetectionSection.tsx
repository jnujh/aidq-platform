import { Flex } from 'antd';
import {
  IconCategory,
  IconBraces,
  IconTargetArrow,
  IconArrowRight,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

type DetectStep = {
  num: string;
  Icon: typeof IconCategory;
  title: string;
  body: string;
  badges: string[];
};

const STEPS: DetectStep[] = [
  {
    num: '01',
    Icon: IconCategory,
    title: '데이터 타입 자동 감지',
    body: '파일 확장자·MIME·내용을 함께 분석해 정형·이미지·텍스트를 자동 식별합니다',
    badges: ['tabular', 'image', 'text'],
  },
  {
    num: '02',
    Icon: IconBraces,
    title: '작업 유형 자동 감지',
    body: 'target 컬럼의 분포·중복도·연속성을 보고 분류·회귀를 자동 결정합니다',
    badges: ['classification', 'regression'],
  },
  {
    num: '03',
    Icon: IconTargetArrow,
    title: 'target · 수치 · 범주형 컬럼 추론',
    body: '컬럼별 통계로 target 후보를 제안하고 수치형·범주형을 분리합니다',
    badges: ['target', 'numeric', 'categorical'],
  },
];

export default function AutoDetectionSection() {
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
            AUTO DETECTION
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
            업로드 직후 자동으로 식별합니다
          </h2>
          <p
            style={{ fontSize: BRAND.fontSize.body, color: '#666', margin: 0 }}
          >
            사용자가 직접 설정하지 않아도 데이터 종류·작업 유형·target 컬럼을 자동 추론
          </p>
        </div>

        <Flex gap={16} wrap="wrap" align="stretch">
          {STEPS.map((s, i) => (
            <Flex
              key={s.num}
              gap={12}
              align="stretch"
              style={{ flex: '1 1 280px', minWidth: 0 }}
            >
              <div
                style={{
                  flex: 1,
                  background: BRAND.colors.surfaces.subtle,
                  border: '1px solid #E8EEF5',
                  borderRadius: 16,
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 16,
                }}
              >
                <Flex align="center" gap={12}>
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: BRAND.colors.surfaces.cardBlue,
                      color: BRAND.colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <s.Icon size={22} stroke={2} />
                  </div>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primary,
                      letterSpacing: 0.5,
                    }}
                  >
                    STEP {s.num}
                  </span>
                </Flex>
                <div
                  style={{
                    fontSize: BRAND.fontSize.subtitleSmall,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.primaryDark,
                    lineHeight: 1.3,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#555',
                    lineHeight: 1.55,
                  }}
                >
                  {s.body}
                </div>
                <Flex gap={6} wrap="wrap" style={{ marginTop: 'auto' }}>
                  {s.badges.map((b) => (
                    <span
                      key={b}
                      style={{
                        background: '#fff',
                        border: '1px solid #E8EEF5',
                        color: BRAND.colors.primary,
                        fontSize: 11,
                        fontWeight: BRAND.fontWeight.bold,
                        padding: '3px 9px',
                        borderRadius: 6,
                        fontFamily:
                          '"SF Mono","Menlo","Consolas","DM Mono",monospace',
                      }}
                    >
                      {b}
                    </span>
                  ))}
                </Flex>
              </div>
              {i < STEPS.length - 1 && (
                <Flex
                  align="center"
                  justify="center"
                  style={{ flexShrink: 0, color: '#B0C0CF' }}
                >
                  <IconArrowRight size={28} stroke={2} />
                </Flex>
              )}
            </Flex>
          ))}
        </Flex>
      </div>
    </section>
  );
}
