import { Flex } from 'antd';
import {
  IconChecks,
  IconFingerprint,
  IconShieldCheck,
  IconEqual,
  IconAlertTriangle,
  IconChartPie,
  IconLink,
  IconTarget,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

type Metric = {
  Icon: typeof IconChecks;
  key: string;
  ko: string;
  oneLine: string;
  formula: string;
  threshold: string;
  source: string;
  damageIfLow: string;
};

const METRICS: Metric[] = [
  {
    Icon: IconChecks,
    key: 'completeness',
    ko: '완전성',
    oneLine: '얼마나 빠짐없이 채워져 있는가',
    formula: '1 − (null 셀 수 / 전체 셀 수)',
    threshold: '≥ 0.95 우수 · 0.80 임계',
    source: 'ISO/IEC 25012 Completeness · Budach 2022',
    damageIfLow: '학습 가능 표본 감소 · MNAR이면 모델 편향',
  },
  {
    Icon: IconFingerprint,
    key: 'uniqueness',
    ko: '고유성',
    oneLine: '중복 행이 얼마나 적은가',
    formula: 'unique 행 수 / 전체 행 수',
    threshold: '≥ 0.99 우수 · 0.90 임계',
    source: 'Northcutt 2021 (라벨 누수) · KDD99 사례',
    damageIfLow: 'train↔test 누수로 정확도 거짓 부풀림 (5~15%)',
  },
  {
    Icon: IconShieldCheck,
    key: 'validity',
    ko: '유효성',
    oneLine: '타입·형식·범위가 맞는가',
    formula: '타입/형식 부합 셀 / 전체 셀',
    threshold: '≥ 0.95 우수 · 0.85 임계',
    source: 'ISO/IEC 25012 Accuracy + Compliance',
    damageIfLow: '컬럼이 object로 캐스팅돼 분석 자체 실패',
  },
  {
    Icon: IconEqual,
    key: 'consistency',
    ko: '일관성',
    oneLine: '같은 의미가 같은 표기로 통일됐는가',
    formula: '정규화 후 distinct / 원본 distinct',
    threshold: '≥ 0.90 우수 · 0.80 임계',
    source: 'ISO/IEC 25012 Consistency',
    damageIfLow: '카테고리 학습 신호 분산 (3^5 = 243 가짜 조합)',
  },
  {
    Icon: IconAlertTriangle,
    key: 'outlier_ratio',
    ko: '이상치',
    oneLine: '극단값이 얼마나 섞여 있는가',
    formula: '1 − (1.5×IQR 밖 값의 비율)',
    threshold: '≥ 0.95 우수 · 0.85 임계',
    source: 'Tukey 1977 · sklearn IsolationForest',
    damageIfLow: '선형 모델 결정 경계 왜곡 (1개로도 회귀선 흔들림)',
  },
  {
    Icon: IconChartPie,
    key: 'class_balance',
    ko: '클래스 균형',
    oneLine: '타겟이 한쪽으로 쏠리진 않았나',
    formula: 'min(클래스 빈도) / max(클래스 빈도)',
    threshold: '≥ 0.80 우수 · 0.50 임계',
    source: 'ISO/IEC 5259-1 Balance (ML-특이)',
    damageIfLow: 'minority recall 0 수렴 — accuracy 무의미',
  },
  {
    Icon: IconLink,
    key: 'feature_correlation',
    ko: '피처 상관',
    oneLine: '피처들이 서로 너무 닮지 않았나',
    formula: '1 − (|r| > 0.95 피처 쌍 비율)',
    threshold: '≥ 0.85 우수 · 0.70 임계',
    source: 'ISO/IEC 5259-1 (해석가능성) · 다중공선성',
    damageIfLow: '선형 모델 계수 불안정·해석 어려움',
  },
  {
    Icon: IconTarget,
    key: 'value_accuracy',
    ko: '값 정확성',
    oneLine: '분포가 합리적인 모양인가',
    formula: '정상 분포 기대치 대비 KS 통과율',
    threshold: '≥ 0.90 우수 · 0.75 임계',
    source: 'ISO/IEC 25024 Accuracy 측정 표준',
    damageIfLow: '선형 모델 가정 위반 (정규성·등분산성)',
  },
];

export default function ResearchBackedSection() {
  return (
    <section style={{ padding: '80px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              color: BRAND.colors.primary,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            RESEARCH-BACKED
          </div>
          <h2
            style={{
              fontSize: 30,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 12,
            }}
          >
            8개 지표가 왜 이렇게 정의됐나
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 760,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            각 지표마다 <strong style={{ color: BRAND.colors.primaryDark }}>측정 공식 · 정상 임계값 · 학술 출처 · 낮을 때 모델에 미치는 손상</strong>까지
            명시 — 임계값 하나도 임의로 잡지 않았습니다.
          </p>
        </div>

        {/* 8개 지표 deep-dive 카드 */}
        <Flex gap={18} wrap="wrap" align="stretch">
          {METRICS.map(({ Icon, key, ko, oneLine, formula, threshold, source, damageIfLow }) => (
            <div
              key={key}
              style={{
                flex: '1 1 calc(50% - 9px)',
                minWidth: 320,
                background: '#fff',
                border: '1px solid #E8EEF5',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <Flex align="center" gap={14}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 11,
                    background: BRAND.colors.surfaces.cardBlue,
                    color: BRAND.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '0 0 auto',
                  }}
                >
                  <Icon size={24} stroke={2} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.subtitleSmall,
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primaryDark,
                      lineHeight: 1.25,
                    }}
                  >
                    {ko}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#7A8FA5',
                      fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                      marginTop: 2,
                    }}
                  >
                    {key}
                  </div>
                </div>
              </Flex>

              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#3F4A5C',
                  lineHeight: 1.6,
                  fontStyle: 'italic',
                }}
              >
                {oneLine}
              </div>

              <div
                style={{
                  background: BRAND.colors.surfaces.subtle,
                  padding: '10px 14px',
                  borderRadius: 8,
                  borderLeft: `3px solid ${BRAND.colors.primary}`,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: BRAND.colors.primary,
                    fontWeight: BRAND.fontWeight.bold,
                    letterSpacing: 0.4,
                    marginBottom: 4,
                  }}
                >
                  측정 공식
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: BRAND.colors.primaryDark,
                    fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                    fontWeight: BRAND.fontWeight.semibold,
                    lineHeight: 1.5,
                  }}
                >
                  {formula}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#7A8FA5',
                    fontWeight: BRAND.fontWeight.bold,
                    letterSpacing: 0.4,
                    marginBottom: 4,
                  }}
                >
                  정상 임계값
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: BRAND.colors.primaryDark,
                    fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                    fontWeight: BRAND.fontWeight.bold,
                  }}
                >
                  {threshold}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: '#7A8FA5',
                    fontWeight: BRAND.fontWeight.bold,
                    letterSpacing: 0.4,
                    marginBottom: 4,
                  }}
                >
                  학술 출처
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#5A6678',
                    lineHeight: 1.6,
                  }}
                >
                  {source}
                </div>
              </div>

              <div
                style={{
                  marginTop: 'auto',
                  paddingTop: 14,
                  borderTop: '1px dashed #E8EEF5',
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: '#D9396A',
                    fontWeight: BRAND.fontWeight.bold,
                    letterSpacing: 0.4,
                    marginBottom: 4,
                  }}
                >
                  낮을 때 모델 손상
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#5A6678',
                    lineHeight: 1.6,
                  }}
                >
                  {damageIfLow}
                </div>
              </div>
            </div>
          ))}
        </Flex>

        <div
          style={{
            marginTop: 32,
            padding: '16px 20px',
            background: BRAND.colors.surfaces.cardBlue,
            border: `1px dashed ${BRAND.colors.primary}55`,
            borderRadius: 10,
            fontSize: BRAND.fontSize.bodySmall,
            color: BRAND.colors.primaryDark,
            lineHeight: 1.7,
            textAlign: 'center',
          }}
        >
          <strong>출처 매핑이 곧 신뢰성:</strong> 임계값을 의심하면 출처 문서를 직접 열어 검증할 수 있습니다.
          ISO/IEC 표준은 <strong>iso.org</strong>에, 논문은 <strong>arxiv.org</strong>에 — 모두 1차 출처.
        </div>
      </div>
    </section>
  );
}
