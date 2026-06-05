import { Flex } from 'antd';
import {
  IconChartScatter,
  IconBook,
  IconShieldCheck,
  IconRulerMeasure,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';
import isoLogo from '../../assets/iso1.png';

type BigNumber = {
  Icon: typeof IconChartScatter;
  value: string;
  unit: string;
  label: string;
  caption: string;
};

const NUMBERS: BigNumber[] = [
  {
    Icon: IconChartScatter,
    value: '435',
    unit: '회',
    label: 'ML 학습 검증',
    caption: '3개 데이터셋 × 5개 모델 × 4단계 오염 강도로 교차 검증한 결과',
  },
  {
    Icon: IconBook,
    value: '49',
    unit: '개',
    label: 'RAG 인덱스 문서',
    caption: '표준 7 + Kaggle 분석 34 + 정제 기법 8 — ChromaDB에 임베딩 완료',
  },
  {
    Icon: IconShieldCheck,
    value: '6',
    unit: '개',
    label: '권위 출처 매핑',
    caption: 'ISO/IEC 25012·5259·25024 + Google·Northcutt·Budach 등 학술 표준',
  },
  {
    Icon: IconRulerMeasure,
    value: '8',
    unit: '개',
    label: '품질 지표',
    caption: '모달리티별로 9~10개로 확장 — 정형·이미지·텍스트 × 분류·회귀로 분기',
  },
];

export default function BigNumbersSection() {
  return (
    <section
      style={{
        padding: '56px 40px',
        background: BRAND.colors.neutral.surface,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              color: BRAND.colors.inkSoft,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 2.5,
              marginBottom: 16,
              textTransform: 'uppercase',
            }}
          >
            By the numbers
          </div>
          <h2
            style={{
              fontSize: 32,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.ink,
              margin: 0,
              marginBottom: 14,
              letterSpacing: '-0.02em',
            }}
          >
            숫자로 보는 신뢰의 근거
          </h2>
          <p
            style={{
              fontSize: 15,
              color: BRAND.colors.inkMuted,
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 600,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            마케팅 카피가 아니라 실험·인덱스·표준 매핑으로 검증된 수치입니다.
          </p>
        </div>
        <Flex gap={20} wrap="wrap" align="stretch" style={{ marginBottom: 24 }}>
          {NUMBERS.map(({ Icon, value, unit, label, caption }) => (
            <div
              key={label}
              style={{
                flex: '1 1 220px',
                background: BRAND.colors.neutral.cardBg,
                border: `1px solid ${BRAND.colors.neutral.border}`,
                borderRadius: 12,
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: BRAND.colors.neutral.surface,
                  color: BRAND.colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${BRAND.colors.neutral.border}`,
                }}
              >
                <Icon size={18} stroke={1.6} />
              </div>
              <Flex align="baseline" gap={8}>
                <span
                  style={{
                    fontSize: 48,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.ink,
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  {value}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: BRAND.colors.inkMuted,
                    fontWeight: BRAND.fontWeight.regular,
                  }}
                >
                  {unit}
                </span>
              </Flex>
              <div
                style={{
                  fontSize: 15,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.ink,
                  letterSpacing: '-0.01em',
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: BRAND.colors.inkMuted,
                  lineHeight: 1.7,
                  marginTop: 'auto',
                  paddingTop: 14,
                  borderTop: `1px solid ${BRAND.colors.neutral.borderSoft}`,
                }}
              >
                {caption}
              </div>
            </div>
          ))}
        </Flex>

        {/* ISO 표준 강조 카드 — 신뢰 근거의 연장선 */}
        <div
          style={{
            background: BRAND.colors.surfaces.cardBlue,
            border: `1px solid ${BRAND.colors.primary}22`,
            borderRadius: 12,
            padding: '28px 36px',
            display: 'flex',
            alignItems: 'center',
            gap: 36,
            flexWrap: 'wrap',
          }}
        >
          <img
            src={isoLogo}
            alt="ISO 로고"
            style={{
              height: 76,
              width: 'auto',
              flexShrink: 0,
            }}
          />
          <div style={{ flex: 1, minWidth: 280 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primary,
                letterSpacing: 2.5,
                marginBottom: 8,
                textTransform: 'uppercase',
              }}
            >
              Reference Standard
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primaryDark,
                marginBottom: 10,
                lineHeight: 1.3,
                letterSpacing: '-0.01em',
              }}
            >
              ISO/IEC 25012 데이터 품질 모델
            </div>
            <div
              style={{
                fontSize: 14,
                color: BRAND.colors.inkMuted,
                lineHeight: 1.7,
              }}
            >
              국제 표준에서 정의한 15개 데이터 품질 차원 중 측정 가능한{' '}
              <strong style={{ color: BRAND.colors.ink }}>
                8개 차원을 진단 지표로 구현
              </strong>
              했습니다. 완전성·일관성·정확성 등 핵심 차원이 그대로 매핑됩니다.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
