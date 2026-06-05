import { BRAND } from '../../config/brand';
import isoLogo from '../../assets/iso1.png';

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
            background: BRAND.colors.surfaces.cardBlue,
            border: `1px solid ${BRAND.colors.primary}22`,
            borderRadius: 18,
            padding: '32px 40px',
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
      </div>
    </section>
  );
}
