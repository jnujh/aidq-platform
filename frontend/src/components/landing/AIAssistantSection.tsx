import { Flex } from 'antd';
import { IconSparkles } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

function SparkleCircle({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: BRAND.colors.primary,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <IconSparkles size={size * 0.55} color="#fff" stroke={2} />
    </div>
  );
}

export default function AIAssistantSection() {
  return (
    <section style={{ padding: '80px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div
            style={{
              color: BRAND.colors.primary,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            AI ASSISTANT
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            물어보면 AI가 답해드립니다
          </h2>
        </div>

        <div
          style={{
            maxWidth: 540,
            margin: '0 auto',
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          {/* 헤더 */}
          <Flex align="center" gap={10}>
            <SparkleCircle size={28} />
            <span
              style={{
                fontSize: BRAND.fontSize.body,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primaryDark,
              }}
            >
              Scorecard AI
            </span>
            <span
              style={{
                marginLeft: 'auto',
                background: BRAND.colors.highlights.success.bg,
                color: BRAND.colors.highlights.success.text,
                fontSize: 12,
                fontWeight: BRAND.fontWeight.semibold,
                padding: '3px 10px',
                borderRadius: 999,
              }}
            >
              RAG 기반
            </span>
          </Flex>

          <div style={{ height: 1, background: '#f0f0f0' }} />

          {/* 사용자 메시지 (우측) */}
          <Flex justify="flex-end" align="flex-end" gap={8}>
            <div
              style={{
                background: BRAND.colors.primary,
                color: '#fff',
                fontSize: BRAND.fontSize.body,
                lineHeight: 1.5,
                padding: '10px 14px',
                borderRadius: 14,
                borderBottomRightRadius: 4,
                maxWidth: '80%',
              }}
            >
              이 데이터로 흠집 사과 분류 모델을 만들 거예요
            </div>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: BRAND.colors.primaryDark,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: BRAND.fontWeight.semibold,
                flexShrink: 0,
              }}
            >
              동훈
            </div>
          </Flex>

          {/* AI 답변 (좌측) */}
          <Flex justify="flex-start" align="flex-start" gap={8}>
            <SparkleCircle size={32} />
            <div
              style={{
                background: '#fff',
                border: '1px solid #f0f0f0',
                borderRadius: 14,
                borderBottomLeftRadius: 4,
                padding: 14,
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  fontSize: BRAND.fontSize.body,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primaryDark,
                  lineHeight: 1.5,
                }}
              >
                이미지 분류 모델 학습용으로 분석했어요 🍎
              </div>

              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#444',
                  lineHeight: 1.6,
                }}
              >
                현재{' '}
                <span
                  style={{
                    background: BRAND.colors.highlights.warning.bg,
                    color: BRAND.colors.highlights.warning.text,
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontWeight: BRAND.fontWeight.semibold,
                  }}
                >
                  흠집 사과가 17%
                </span>
                로 부족해요. 이대로 학습하면 흠집을 잘 못 잡아낼 가능성이 높아요.
              </div>

              <div
                style={{
                  background: BRAND.colors.surfaces.subtle,
                  borderRadius: 10,
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#333',
                }}
              >
                <div>1. SMOTE로 흠집 클래스 보강</div>
                <div>2. 중복 47장 제거</div>
                <div>3. 라벨 정확도 검증</div>
              </div>

              <div style={{ fontSize: 12, color: '#888' }}>
                적용 시{' '}
                <span
                  style={{
                    color: BRAND.colors.highlights.success.icon,
                    fontWeight: BRAND.fontWeight.semibold,
                  }}
                >
                  +30점
                </span>{' '}
                상승 예상
              </div>
            </div>
          </Flex>

          {/* 액션 칩 */}
          <Flex gap={8} justify="flex-start" style={{ marginLeft: 40 }}>
            <button
              type="button"
              style={{
                background: '#fff',
                border: `1px solid ${BRAND.colors.primary}`,
                color: BRAND.colors.primary,
                fontSize: BRAND.fontSize.bodySmall,
                fontWeight: BRAND.fontWeight.semibold,
                padding: '8px 14px',
                borderRadius: 999,
                cursor: 'pointer',
              }}
            >
              자동 개선 적용
            </button>
            <button
              type="button"
              style={{
                background: '#fff',
                border: '1px solid #d9d9d9',
                color: '#444',
                fontSize: BRAND.fontSize.bodySmall,
                fontWeight: BRAND.fontWeight.semibold,
                padding: '8px 14px',
                borderRadius: 999,
                cursor: 'pointer',
              }}
            >
              상세 리포트
            </button>
          </Flex>
        </div>
      </div>
    </section>
  );
}
