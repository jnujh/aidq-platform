import { Flex } from 'antd';
import { BRAND } from '../../config/brand';
import isoLogo from '../../assets/iso1.png';

const facts: Array<{ code: string; name: string; sub: string }> = [
  {
    code: '435회',
    name: 'ML 실험으로 사후 검증',
    sub: '3개 공개 데이터셋 × 5종 모델 × 5종 오염 × 4단계 강도',
  },
  {
    code: 'r = 0.598',
    name: 'DSC ↔ F1 상관관계',
    sub: 'Pearson p < 1e-43 · Spearman ρ = 0.628',
  },
  {
    code: '5종 ML 모델',
    name: '다중 모델 일관성 확인',
    sub: 'Logistic · MLP · Random Forest · SVC · XGBoost',
  },
  {
    code: '3개 공개 데이터셋',
    name: '재현 가능한 벤치마크',
    sub: 'Letter · Adult Income · SouthGerman Credit',
  },
];

export default function PartnersSection() {
  return (
    <section
      style={{
        padding: '64px 40px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div
          style={{
            color: '#999',
            fontSize: 12,
            fontWeight: BRAND.fontWeight.semibold,
            letterSpacing: 0.5,
            textAlign: 'center',
            marginBottom: 28,
          }}
        >
          ISO 표준 기반 · 435회 ML 실험으로 사후 검증
        </div>

        {/* 상단 ISO 강조 카드 */}
        <div
          style={{
            background: BRAND.colors.surfaces.cardBlue,
            border: `1px solid ${BRAND.colors.primary}22`,
            borderRadius: 18,
            padding: '32px 40px',
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 40,
            flexWrap: 'wrap',
          }}
        >
          <img
            src={isoLogo}
            alt="ISO 로고"
            style={{
              height: 88,
              width: 'auto',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 280 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primary,
                letterSpacing: 0.4,
                marginBottom: 8,
              }}
            >
              REFERENCE STANDARD
            </div>
            <div
              style={{
                fontSize: BRAND.fontSize.titleMedium,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primaryDark,
                marginBottom: 10,
                lineHeight: 1.25,
              }}
            >
              ISO/IEC 25012 데이터 품질 모델
            </div>
            <div
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#444',
                lineHeight: 1.6,
              }}
            >
              국제 표준에서 정의한 15개 데이터 품질 차원 중 측정 가능한{' '}
              <strong style={{ color: BRAND.colors.primaryDark }}>
                8개 차원을 우리 플랫폼의 진단 지표로 구현
              </strong>
              했습니다.
            </div>
            <div
              style={{
                marginTop: 12,
                fontSize: BRAND.fontSize.bodySmall,
                color: '#555',
                lineHeight: 1.6,
              }}
            >
              완전성·일관성·정확성 등 핵심 차원이 그대로 매핑됩니다.
            </div>
          </div>
        </div>

        {/* 하단 2×2 그리드 */}
        <Flex gap={20} wrap="wrap">
          {facts.map((f) => (
            <div
              key={f.code}
              style={{
                flex: '1 1 calc(50% - 10px)',
                minWidth: 280,
                background: '#fff',
                border: '1px solid #E8EEF5',
                borderRadius: 14,
                padding: '24px 26px',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: BRAND.fontSize.titleSmall,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primaryDark,
                  lineHeight: 1.2,
                }}
              >
                {f.code}
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.body,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: '#333',
                }}
              >
                {f.name}
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#666',
                  lineHeight: 1.5,
                }}
              >
                {f.sub}
              </div>
            </div>
          ))}
        </Flex>
      </div>
    </section>
  );
}
