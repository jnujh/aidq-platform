import { Flex } from 'antd';
import { IconBrain, IconArrowDown } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

type WeightItem = { key: string; label: string; value: number };

const WEIGHTS: WeightItem[] = [
  { key: 'label_consistency', label: '라벨 일관성', value: 0.22 },
  { key: 'completeness', label: '완전성', value: 0.2 },
  { key: 'class_balance', label: '클래스 균형', value: 0.16 },
  { key: 'consistency', label: '일관성', value: 0.14 },
  { key: 'uniqueness', label: '중복도', value: 0.1 },
  { key: 'feature_correlation', label: '특성 상관', value: 0.08 },
  { key: 'outlier_rate', label: '이상치 비율', value: 0.06 },
  { key: 'sample_quality', label: '샘플 품질', value: 0.04 },
];

const MAX_W = Math.max(...WEIGHTS.map((w) => w.value));

export default function LLMWeightSection() {
  return (
    <section
      style={{
        padding: '80px 40px',
        background: BRAND.colors.surfaces.subtle,
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
            LLM-DRIVEN WEIGHTING
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
            목적을 입력하면 LLM이 가중치를 자동 산출합니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
            }}
          >
            8개 지표 비중을 사용자가 직접 정하지 않아도 됩니다 — LLM이 목적 문장에서 핵심 차원을 추론합니다
          </p>
        </div>

        <Flex gap={28} wrap="wrap" align="stretch">
          {/* 좌: 입력 카드 */}
          <div
            style={{
              flex: '1 1 360px',
              minWidth: 0,
              background: '#fff',
              border: '1px solid #E8EEF5',
              borderRadius: 16,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primary,
                letterSpacing: 0.5,
              }}
            >
              STEP 1 · 목적 입력
            </div>
            <div
              style={{
                background: BRAND.colors.surfaces.subtle,
                border: '1px solid #E8EEF5',
                borderRadius: 12,
                padding: 18,
                fontSize: 15,
                color: '#222',
                lineHeight: 1.55,
                fontFamily:
                  '"SF Mono", "Menlo", "Consolas", "DM Mono", monospace',
              }}
            >
              "온라인 쇼핑 고객의 행동 로그를 활용한
              <br />
              <strong style={{ color: BRAND.colors.primaryDark }}>
                구매 전환 분류
              </strong>
              모델"
            </div>
            <Flex align="center" gap={12} style={{ marginTop: 4 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: BRAND.colors.surfaces.cardBlue,
                  color: BRAND.colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <IconBrain size={20} stroke={2} />
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#444',
                  lineHeight: 1.55,
                }}
              >
                LLM이 문장에서 작업 유형(분류) · 라벨 신뢰성 · 클래스
                균형의 중요도를 추론합니다
              </div>
            </Flex>
            <div
              style={{
                alignSelf: 'center',
                color: '#B0B7BF',
                marginTop: 6,
              }}
            >
              <IconArrowDown size={28} stroke={1.8} />
            </div>
          </div>

          {/* 우: 가중치 결과 카드 */}
          <div
            style={{
              flex: '1 1 360px',
              minWidth: 0,
              background: '#fff',
              border: '1px solid #E8EEF5',
              borderRadius: 16,
              padding: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primary,
                letterSpacing: 0.5,
              }}
            >
              STEP 2 · 산출된 8지표 가중치
            </div>
            {WEIGHTS.map((w) => (
              <div
                key={w.key}
                style={{ display: 'flex', alignItems: 'center', gap: 12 }}
              >
                <div
                  style={{
                    width: 96,
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#444',
                    flexShrink: 0,
                  }}
                >
                  {w.label}
                </div>
                <div
                  style={{
                    flex: 1,
                    background: '#EEF2F7',
                    height: 12,
                    borderRadius: 6,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${(w.value / MAX_W) * 100}%`,
                      background: BRAND.colors.primary,
                      height: '100%',
                      borderRadius: 6,
                    }}
                  />
                </div>
                <div
                  style={{
                    width: 44,
                    textAlign: 'right',
                    fontSize: BRAND.fontSize.bodySmall,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primaryDark,
                    fontVariantNumeric: 'tabular-nums',
                    flexShrink: 0,
                  }}
                >
                  {w.value.toFixed(2)}
                </div>
              </div>
            ))}
            <div
              style={{
                marginTop: 6,
                fontSize: 11,
                color: '#888',
                lineHeight: 1.55,
              }}
            >
              ※ 가중치는 정규화되어 합이 1이 됩니다. 사용자가 수동으로 조정도 가능합니다.
            </div>
          </div>
        </Flex>
      </div>
    </section>
  );
}
