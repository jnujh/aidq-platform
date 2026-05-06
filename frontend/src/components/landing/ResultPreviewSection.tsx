import { Flex } from 'antd';
import { BRAND } from '../../config/brand';
import Donut from './Donut';

type BarColor = 'blue' | 'gray' | 'yellow';

const bars: Array<{ label: string; weight: string; score: number; color: BarColor }> = [
  { label: '클래스 균형', weight: '30%', score: 92, color: 'blue' },
  { label: '라벨 정확도', weight: '25%', score: 88, color: 'blue' },
  { label: '이미지 다양성', weight: '20%', score: 85, color: 'blue' },
  { label: '완전성', weight: '10%', score: 90, color: 'gray' },
  { label: '중복 제거', weight: '8%', score: 68, color: 'yellow' },
];

function barFillColor(c: BarColor): string {
  if (c === 'blue') return BRAND.colors.primary;
  if (c === 'yellow') return BRAND.colors.highlights.warning.icon;
  return '#888';
}

export default function ResultPreviewSection() {
  return (
    <section style={{ padding: '80px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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
            RESULT PREVIEW
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            진단 결과는 이렇게 보입니다
          </h2>
        </div>

        <div
          style={{
            background: BRAND.colors.surfaces.subtle,
            borderRadius: 16,
            padding: 24,
          }}
        >
          <Flex gap={20} align="stretch">
            {/* 좌측: 총점 카드 */}
            <div
              style={{
                flex: 1,
                background: '#fff',
                borderRadius: 12,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  color: '#999',
                  fontSize: 11,
                  fontWeight: BRAND.fontWeight.semibold,
                  letterSpacing: 0.5,
                }}
              >
                TOTAL SCORE
              </div>

              <Donut
                size={140}
                percent={85}
                trackColor={BRAND.colors.badges.purposeA.bg}
                progressColor={BRAND.colors.primary}
                strokeWidth={12}
              >
                <div
                  style={{
                    fontSize: 30,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.primaryDark,
                    lineHeight: 1,
                  }}
                >
                  85.2
                </div>
                <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                  / 100
                </div>
              </Donut>

              <span
                style={{
                  background: BRAND.colors.highlights.success.bg,
                  color: BRAND.colors.highlights.success.text,
                  fontSize: BRAND.fontSize.bodySmall,
                  fontWeight: BRAND.fontWeight.semibold,
                  padding: '4px 14px',
                  borderRadius: 999,
                }}
              >
                우수
              </span>
            </div>

            {/* 우측: 항목별 점수 */}
            <div
              style={{
                flex: 1.6,
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              <Flex align="center" justify="space-between">
                <div
                  style={{
                    fontSize: BRAND.fontSize.subtitleSmall,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.primaryDark,
                  }}
                >
                  8개 항목별 점수
                </div>
                <span
                  style={{
                    background: BRAND.colors.badges.purposeA.bg,
                    color: BRAND.colors.badges.purposeA.text,
                    fontSize: 12,
                    fontWeight: BRAND.fontWeight.semibold,
                    padding: '4px 10px',
                    borderRadius: 999,
                  }}
                >
                  분류 모델용
                </span>
              </Flex>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {bars.map((b) => (
                  <div key={b.label}>
                    <Flex
                      justify="space-between"
                      align="center"
                      style={{ marginBottom: 6 }}
                    >
                      <span
                        style={{
                          fontSize: BRAND.fontSize.bodySmall,
                          color: '#444',
                        }}
                      >
                        {b.label}{' '}
                        <span style={{ color: '#999' }}>({b.weight})</span>
                      </span>
                      <span
                        style={{
                          fontSize: BRAND.fontSize.body,
                          fontWeight: BRAND.fontWeight.semibold,
                          color:
                            b.color === 'yellow'
                              ? BRAND.colors.highlights.warning.icon
                              : BRAND.colors.primaryDark,
                        }}
                      >
                        {b.score}
                      </span>
                    </Flex>
                    <div
                      style={{
                        height: 5,
                        background: BRAND.colors.surfaces.subtle,
                        borderRadius: 3,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${b.score}%`,
                          background: barFillColor(b.color),
                          borderRadius: 3,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Flex>
        </div>
      </div>
    </section>
  );
}
