import { Flex } from 'antd';
import {
  IconCircleDashed,
  IconCopy,
  IconAlertTriangle,
  IconTextSpellcheck,
  IconScaleOff,
  IconShieldLock,
  IconBrandGithub,
  IconExternalLink,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

const CAPSTONE_REPO = 'https://github.com/gary5876/capstone-dsc';

type Pollution = {
  Icon: typeof IconCircleDashed;
  title: string;
  englishKey: string;
  desc: string;
  range: string;
  impact: string;
};

const POLLUTIONS: Pollution[] = [
  {
    Icon: IconCircleDashed,
    title: '결측치',
    englishKey: 'Completeness',
    desc: '값이 비어있거나 NA로 표시된 셀',
    range: '10% · 25% · 50% · 75%',
    impact: '체계적 결측은 단순 imputation으로 해결 안 됨 — MNAR 패턴 의심',
  },
  {
    Icon: IconCopy,
    title: '중복',
    englishKey: 'Uniqueness',
    desc: '동일 행이 반복 등장 (전체 또는 키 일치)',
    range: '×1.5 · ×2.0 · ×3.0 · ×4.0',
    impact: 'Train/Test 누수로 정확도 거짓 부풀림 — KDD99 사례 78% 중복',
  },
  {
    Icon: IconAlertTriangle,
    title: '값 오류',
    englishKey: 'Feature Accuracy',
    desc: '범위·타입·관계가 의심스러운 값 (예: 음수 나이)',
    range: '10% · 25% · 50% · 75%',
    impact: '선형 모델에 가장 치명적 — 단 1개 outlier로 회귀선 흔들림',
  },
  {
    Icon: IconTextSpellcheck,
    title: '표현 불일치',
    englishKey: 'Consistent Representation',
    desc: '같은 의미가 다른 표기로 쪼개짐 ("서울"/"SEOUL"/"seoul")',
    range: '10% · 25% · 50% · 75%',
    impact: '카테고리 학습 신호가 갈라져 모델 정확도·일관성 동시 하락',
  },
  {
    Icon: IconScaleOff,
    title: '클래스 불균형',
    englishKey: 'Class Balance',
    desc: '타겟 분포가 한쪽으로 쏠림 (예: 90:10)',
    range: '10% · 25% · 50% · 75%',
    impact: 'minority class recall이 0에 수렴 — accuracy 무의미해짐',
  },
];

type PollutionMetricMap = {
  pollution: string;
  metric: string;
  formula: string;
  threshold: string;
};

const POLLUTION_METRIC_MAP: PollutionMetricMap[] = [
  {
    pollution: '결측치',
    metric: 'completeness',
    formula: '1 − (null 셀 수 / 전체 셀 수)',
    threshold: '≥ 0.95 우수',
  },
  {
    pollution: '중복',
    metric: 'uniqueness',
    formula: 'unique 행 수 / 전체 행 수',
    threshold: '≥ 0.99 우수',
  },
  {
    pollution: '값 오류',
    metric: 'validity · outlier_ratio',
    formula: '타입·범위 부합 비율 + 1.5×IQR 규칙',
    threshold: '≥ 0.95 / ≥ 0.85',
  },
  {
    pollution: '표현 불일치',
    metric: 'consistency',
    formula: '정규화 후 distinct 수 / 원본 distinct 수',
    threshold: '≥ 0.90 우수',
  },
  {
    pollution: '클래스 불균형',
    metric: 'class_balance',
    formula: 'min(클래스 빈도) / max(클래스 빈도)',
    threshold: '≥ 0.80 우수',
  },
];

const LEAKAGE_PRINCIPLES = [
  {
    badge: '01',
    title: 'Split-first',
    body: '오염 주입 전에 train/test를 먼저 나눕니다. 오염 비율을 통제하려고 split을 뒤로 미루면 test가 오염됩니다.',
  },
  {
    badge: '02',
    title: 'Train-only 오염',
    body: '오염은 train 데이터에만 들어갑니다. test는 항상 원본 그대로 — 모델 성능을 같은 잣대로 평가하기 위함.',
  },
  {
    badge: '03',
    title: 'Clean test 재사용',
    body: '모든 모델·오염 강도에서 동일한 깨끗한 test를 사용. 점수 차이가 오로지 학습 데이터 품질에서 나오도록 통제.',
  },
];

export default function PollutionDetectionSection() {
  return (
    <section style={{ padding: '80px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* ── 1. Hero ── */}
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div
            style={{
              color: BRAND.colors.primary,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            POLLUTION DETECTION
          </div>
          <h2
            style={{
              fontSize: 30,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 14,
            }}
          >
            5가지 데이터 오염을 자동 감지합니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 780,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            DSC v3.2 엔진은 합성 오염 시나리오로 <strong style={{ color: BRAND.colors.primaryDark }}>3개 데이터셋 · 5개 ML 모델 · 4단계 강도</strong> 교차 검증을 거쳤습니다.
            아래는 진단 결과가 실제 모델 성능과 어떻게 연결되는지 정량적으로 보여주는 실험 요약입니다.
          </p>
        </div>

        {/* ── 2. 5종 오염 상세 카드 ── */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ marginBottom: 22 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primary,
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              5종 오염 유형
            </div>
            <h3
              style={{
                fontSize: BRAND.fontSize.titleSmall,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primaryDark,
                margin: 0,
              }}
            >
              어떤 오염을, 어떤 강도로, 어떻게 잡아내는가
            </h3>
          </div>
          <Flex gap={16} wrap="wrap" align="stretch">
            {POLLUTIONS.map(({ Icon, title, englishKey, desc, range, impact }) => (
              <div
                key={title}
                style={{
                  flex: '1 1 220px',
                  minWidth: 220,
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: BRAND.colors.surfaces.cardBlue,
                    color: BRAND.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} stroke={2} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.body,
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primaryDark,
                      lineHeight: 1.3,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#7A8FA5',
                      fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                      marginTop: 2,
                    }}
                  >
                    {englishKey}
                  </div>
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#3F4A5C',
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </div>
                <div
                  style={{
                    background: BRAND.colors.surfaces.subtle,
                    color: BRAND.colors.primaryDark,
                    padding: '6px 10px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                    fontWeight: BRAND.fontWeight.semibold,
                  }}
                >
                  주입 강도: {range}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: '#5A6678',
                    lineHeight: 1.6,
                    paddingTop: 8,
                    borderTop: '1px dashed #E8EEF5',
                    marginTop: 'auto',
                  }}
                >
                  <strong style={{ color: BRAND.colors.primaryDark }}>모델 영향:</strong> {impact}
                </div>
              </div>
            ))}
          </Flex>
        </div>

        {/* ── 3. 오염 → 8지표 매핑 ── */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primary,
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              POLLUTION → METRIC MAPPING
            </div>
            <h3
              style={{
                fontSize: BRAND.fontSize.titleSmall,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primaryDark,
                margin: 0,
                marginBottom: 8,
              }}
            >
              어떤 오염이 어떤 지표에 잡히는가
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#666',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              5종 오염이 8개 DSC 지표 중 어디에 영향을 주는지 명시적 매핑. 측정 공식과 정상 임계값까지 함께 공개.
            </p>
          </div>

          {/* 헤더 행 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1.4fr 2.2fr 1fr',
              background: BRAND.colors.surfaces.subtle,
              padding: '12px 18px',
              borderRadius: '10px 10px 0 0',
              border: '1px solid #E8EEF5',
              fontSize: 11,
              fontWeight: BRAND.fontWeight.bold,
              color: BRAND.colors.primary,
              letterSpacing: 0.4,
            }}
          >
            <div>오염 유형</div>
            <div>대응 지표</div>
            <div>측정 공식</div>
            <div style={{ textAlign: 'right' }}>정상 임계값</div>
          </div>
          {POLLUTION_METRIC_MAP.map(({ pollution, metric, formula, threshold }, idx) => (
            <div
              key={pollution}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1.4fr 2.2fr 1fr',
                background: '#fff',
                padding: '14px 18px',
                borderLeft: '1px solid #E8EEF5',
                borderRight: '1px solid #E8EEF5',
                borderBottom: '1px solid #E8EEF5',
                borderRadius: idx === POLLUTION_METRIC_MAP.length - 1 ? '0 0 10px 10px' : 0,
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  fontWeight: BRAND.fontWeight.bold,
                  color: BRAND.colors.primaryDark,
                }}
              >
                {pollution}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: BRAND.colors.primary,
                  fontWeight: BRAND.fontWeight.semibold,
                  fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                }}
              >
                {metric}
              </div>
              <div
                style={{
                  fontSize: 12,
                  color: '#5A6678',
                  lineHeight: 1.6,
                  fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                }}
              >
                {formula}
              </div>
              <div
                style={{
                  textAlign: 'right',
                  fontSize: 12,
                  color: BRAND.colors.primaryDark,
                  fontWeight: BRAND.fontWeight.bold,
                  fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                }}
              >
                {threshold}
              </div>
            </div>
          ))}

          <div
            style={{
              marginTop: 16,
              padding: '12px 16px',
              background: BRAND.colors.surfaces.cardBlue,
              borderRadius: 10,
              fontSize: BRAND.fontSize.bodySmall,
              color: BRAND.colors.primaryDark,
              lineHeight: 1.6,
            }}
          >
            <strong>핵심:</strong> 진단 엔진은 5종 오염을 추측하지 않습니다 — 위 공식으로 명시적으로 측정한 8지표 점수가
            "어떤 오염이 얼마나 있는지"를 그대로 드러냅니다.
          </div>
        </div>

        {/* ── 7. Leakage 방지 3원칙 ── */}
        <div style={{ marginBottom: 72 }}>
          <div style={{ marginBottom: 22 }}>
            <Flex align="center" gap={10} style={{ marginBottom: 6 }}>
              <IconShieldLock size={20} color={BRAND.colors.primary} stroke={2} />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: BRAND.fontWeight.bold,
                  color: BRAND.colors.primary,
                  letterSpacing: 0.5,
                }}
              >
                LEAKAGE PREVENTION
              </div>
            </Flex>
            <h3
              style={{
                fontSize: BRAND.fontSize.titleSmall,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primaryDark,
                margin: 0,
                marginBottom: 8,
              }}
            >
              실험 신뢰성을 보장하는 3가지 설계 원칙
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.bodySmall,
                color: '#666',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              점수 차이가 "데이터 품질 때문"인지 "평가 누수 때문"인지 헷갈리지 않도록 구조적으로 차단.
            </p>
          </div>
          <Flex gap={16} wrap="wrap" align="stretch">
            {LEAKAGE_PRINCIPLES.map(({ badge, title, body }) => (
              <div
                key={badge}
                style={{
                  flex: '1 1 280px',
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <Flex align="center" gap={10}>
                  <span
                    style={{
                      background: BRAND.colors.primary,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      letterSpacing: 0.5,
                      padding: '4px 10px',
                      borderRadius: 6,
                    }}
                  >
                    {badge}
                  </span>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.body,
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primaryDark,
                    }}
                  >
                    {title}
                  </div>
                </Flex>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#5A6678',
                    lineHeight: 1.7,
                  }}
                >
                  {body}
                </div>
              </div>
            ))}
          </Flex>
        </div>

        {/* ── 6. 합성 한계 인정 + GitHub ── */}
        <div style={{ marginBottom: 24 }}>
          <Flex gap={20} wrap="wrap" align="stretch">
            <div
              style={{
                flex: '1.5 1 360px',
                background: BRAND.colors.surfaces.subtle,
                border: '1px dashed #CBD3E0',
                borderRadius: 14,
                padding: 24,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: BRAND.fontWeight.bold,
                  color: '#5A6678',
                  letterSpacing: 0.5,
                  marginBottom: 8,
                }}
              >
                SCOPE & HONEST LIMITATIONS
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.body,
                  fontWeight: BRAND.fontWeight.bold,
                  color: BRAND.colors.primaryDark,
                  marginBottom: 12,
                }}
              >
                이 페이지의 자동감지가 다루는 범위
              </div>
              <ul
                style={{
                  margin: 0,
                  paddingLeft: 18,
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#5A6678',
                  lineHeight: 1.85,
                }}
              >
                <li>위 5종 오염은 <strong style={{ color: BRAND.colors.primaryDark }}>합성 주입 시나리오</strong>로 알고리즘 동작이 검증된 범위</li>
                <li>자연 노이즈(센서 흔들림), 체계적 라벨 오류는 알고리즘은 측정하지만 통계 검증은 후속 과제</li>
                <li>실제 통계 수치(Pearson r 등 정확도 증명) 는 <strong style={{ color: BRAND.colors.primaryDark }}>Research → 검증된 진단 정확도</strong> 페이지에서 확인 가능</li>
              </ul>
            </div>

            <a
              href={CAPSTONE_REPO}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: '1 1 260px',
                background: BRAND.colors.primaryDark,
                color: '#fff',
                borderRadius: 14,
                padding: 24,
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Flex align="center" gap={10} style={{ marginBottom: 12 }}>
                  <IconBrandGithub size={26} stroke={1.8} />
                  <div
                    style={{
                      fontSize: BRAND.fontSize.subtitle,
                      fontWeight: BRAND.fontWeight.bold,
                    }}
                  >
                    DSC 검증 연구 리포
                  </div>
                </Flex>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    lineHeight: 1.6,
                    opacity: 0.92,
                  }}
                >
                  오염 주입 노트북·결과 CSV·ADR(설계 결정)·발표 자료까지 모두 공개.
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  padding: '10px 14px',
                  borderRadius: 8,
                  fontSize: 12,
                  fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <IconExternalLink size={14} stroke={2} />
                github.com/gary5876/capstone-dsc
              </div>
            </a>
          </Flex>
        </div>
      </div>
    </section>
  );
}
