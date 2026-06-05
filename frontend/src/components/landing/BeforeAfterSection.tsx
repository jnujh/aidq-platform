import { Flex } from 'antd';
import {
  IconArrowRight,
  IconTrendingUp,
  IconStarFilled,
  IconCircleDashed,
  IconCopy,
  IconAlertTriangle,
  IconTextSpellcheck,
  IconScaleOff,
  IconRecycle,
  IconBolt,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';
import Donut from './Donut';
import levelChart from '../../assets/research/chart2_level_vs_dsc_f1.png';
import radarChart from '../../assets/research/chart5_radar_single_pollution.png';
import weightImg from '../../assets/가중치분석.png';

type FAQ = { q: string; a: string };

const FAQS: FAQ[] = [
  {
    q: '재진단은 몇 번까지 가능한가요?',
    a: '횟수 제한 없습니다. 부모 진단의 가중치가 잠겨 있어 매 라운드의 점수 차이가 데이터 개선의 순효과만 반영합니다. 실무적으로는 plateau(점수 변화 ±1점 이내) 도달 시점이 자연스러운 멈춤 신호입니다.',
  },
  {
    q: 'plateau 도달은 어떻게 판단하나요?',
    a: '직전 라운드 대비 총점 상승이 1점 미만이거나, 약점이었던 상위 3개 지표가 모두 임계값(B 등급 0.75 이상)을 넘기면 plateau입니다. ROI ★ 영역 fix만 남아있을 때 무리하게 적용해도 비용 대비 효과 0에 수렴합니다.',
  },
  {
    q: '가중치를 사용자가 직접 바꿀 수 있나요?',
    a: '첫 진단에선 LLM 추천을 검토·수정 가능합니다. 그러나 재진단에선 부모 가중치를 시스템이 강제로 잠급니다 — 개선 전후를 같은 잣대로 비교하기 위한 설계입니다. 평가 기준을 새로 잡고 싶으면 "새 진단"으로 시작하세요.',
  },
  {
    q: '자연 노이즈·라벨 오류도 잡아내나요?',
    a: '솔직하게: 검증 실험은 합성 오염 5종에 한정됩니다. 자연 노이즈와 cleanlab 기반 라벨 오류는 진단 알고리즘 자체는 측정하지만, 모델 성능과의 통계적 상관관계는 후속 과제로 남아있습니다.',
  },
  {
    q: '같은 데이터를 다른 목적으로 재진단할 수 있나요?',
    a: '"새 진단"으로 시작하면 가능합니다. 사용 목적이 바뀌면 LLM이 다른 가중치를 추천하고, 그 진단을 새 부모로 삼아 별도의 개선 사이클을 돌릴 수 있습니다. 분류용 가중치로 진단한 데이터를 회귀용 잣대로 평가하면 점수가 무의미해지므로 별도 진단을 권장합니다.',
  },
];

type ROIRow = {
  fix: string;
  effort: 'Low' | 'Medium' | 'Low-Med';
  impact: string;
  rating: 1 | 2 | 3;
  tier: 'top' | 'mid' | 'low';
};

const ROI_MATRIX: ROIRow[] = [
  { fix: '중복 제거', effort: 'Low', impact: '5–15% 지표 보정 + 누수 방지', rating: 3, tier: 'top' },
  { fix: '타입 오류 수정', effort: 'Low', impact: '분석 가능 상태로 회복', rating: 3, tier: 'top' },
  { fix: '클래스 불균형 처리', effort: 'Medium', impact: '10–30% recall 상승', rating: 3, tier: 'top' },
  { fix: '결측치 보완 (imputation)', effort: 'Medium', impact: '2–10% accuracy 상승', rating: 2, tier: 'mid' },
  { fix: '이상치 제거·변환', effort: 'Medium', impact: '5–15% (linear 모델 한정)', rating: 2, tier: 'mid' },
  { fix: '표현 일관성 해소', effort: 'Medium', impact: '3–8% accuracy 상승', rating: 2, tier: 'mid' },
  { fix: '피처 상관 축소', effort: 'Low-Med', impact: '해석가능성 ↑, 정확도는 <5%', rating: 1, tier: 'low' },
  { fix: '값 분포 변환 (log 등)', effort: 'Low', impact: '2–5% (linear 모델 한정)', rating: 1, tier: 'low' },
];

type FixPattern = {
  Icon: typeof IconCircleDashed;
  pollution: string;
  whatToDo: string;
  tools: string[];
  expected: string;
};

const FIX_PATTERNS: FixPattern[] = [
  {
    Icon: IconCircleDashed,
    pollution: '결측치',
    whatToDo: 'MCAR / MAR / MNAR 구분 후 전략 선택. 평균·중앙값 보완은 MCAR에만 안전, 나머지는 모델 기반 보완 또는 결측 자체를 피처화.',
    tools: ['sklearn KNNImputer', 'IterativeImputer', '"has_value" 이진 피처'],
    expected: '2–10% accuracy 상승 (결측 패턴이 정보를 담고 있을 땐 피처화가 더 효과적)',
  },
  {
    Icon: IconCopy,
    pollution: '중복',
    whatToDo: 'pandas drop_duplicates는 최소한. 진짜 위험은 train↔test 간 누수 — 분할 전후로 키 기준 중복 확인이 필수.',
    tools: ['drop_duplicates(subset=key)', 'sklearn GroupKFold', 'hash 기반 중복 탐지'],
    expected: '5–15% 지표 보정 + cross-validation 신뢰성 회복',
  },
  {
    Icon: IconAlertTriangle,
    pollution: '이상치 / 값 오류',
    whatToDo: '모델 타입별로 처리 다름. 트리·앙상블은 그대로 두고, 선형 모델은 winsorize/log 변환. IsolationForest로 자동 탐지.',
    tools: ['IsolationForest', 'winsorize', 'log/sqrt 변환', 'RobustScaler'],
    expected: '5–15% (linear) / <1% (트리) — 모델에 따라 ROI 양극화',
  },
  {
    Icon: IconTextSpellcheck,
    pollution: '표현 불일치',
    whatToDo: '표기 매핑 사전 구축 후 일괄 정규화. "서울/SEOUL/서울특별시"를 같은 토큰으로 통일하지 않으면 학습 신호가 갈라짐.',
    tools: ['매핑 dict + str.replace', 'pandas Categorical', 'fuzzy matching (rapidfuzz)'],
    expected: '3–8% accuracy 상승, 카테고리 cardinality 적정화',
  },
  {
    Icon: IconScaleOff,
    pollution: '클래스 불균형',
    whatToDo: '데이터 레벨(SMOTE·ADASYN)과 알고리즘 레벨(class_weight·focal loss) 동시 적용. minority 1% 이하면 이상탐지 접근법으로 전환 권장.',
    tools: ['imblearn SMOTE', 'ADASYN', 'class_weight="balanced"', 'IsolationForest'],
    expected: '10–30% minority recall 상승 — 단일 fix 중 가장 큰 임팩트',
  },
];

type ModelOutlier = {
  model: string;
  family: string;
  impact: '극단' | '높음' | '중간' | '낮음' | '매우 낮음';
  example: string;
};

const MODEL_OUTLIER_IMPACT: ModelOutlier[] = [
  { model: 'Linear Regression', family: '선형', impact: '극단', example: '한 채의 10억 주택이 200만 평균을 흔듦' },
  { model: 'Logistic Regression', family: '선형 분류', impact: '높음', example: '극단값이 결정 경계 이동' },
  { model: 'SVM (linear)', family: '커널', impact: '높음', example: 'margin 위치 왜곡' },
  { model: 'KMeans', family: '거리 기반', impact: '높음', example: '센트로이드가 이상치 쪽으로 끌림' },
  { model: 'Decision Tree', family: '트리', impact: '낮음', example: '이상치를 별도 분할로 격리' },
  { model: 'Random Forest', family: '배깅', impact: '매우 낮음', example: '앙상블 평균으로 무력화' },
  { model: 'XGBoost / LightGBM', family: '부스팅', impact: '매우 낮음', example: '개별 트리만 영향, 전체 안정' },
];

type RetryStep = {
  round: string;
  parent: number;
  child: number;
  delta: number;
  focus: string;
};

const RETRY_CYCLE: RetryStep[] = [
  { round: '1차 진단', parent: 0, child: 57.2, delta: 0, focus: '베이스라인 — 약점 메트릭 식별' },
  { round: '1차 재진단', parent: 57.2, child: 73.4, delta: 16.2, focus: '클래스 불균형 + 중복 제거 (ROI ★★★)' },
  { round: '2차 재진단', parent: 73.4, child: 84.1, delta: 10.7, focus: '결측치 보완 + 이상치 처리 (ROI ★★)' },
  { round: '3차 재진단', parent: 84.1, child: 87.5, delta: 3.4, focus: '표현 일관성·상관 축소 (ROI ★)' },
  { round: '4차 재진단', parent: 87.5, child: 88.1, delta: 0.6, focus: 'plateau 도달 — 더 손대도 ROI 0 수렴' },
];

export default function BeforeAfterSection() {
  return (
    <section
      style={{ padding: '80px 40px', background: BRAND.colors.surfaces.subtle }}
    >
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
            BEFORE & AFTER
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 8,
            }}
          >
            AI 개선만 적용하면, 이렇게 점수가 올라갑니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
            }}
          >
            실제 사례 · 동일 데이터 기준
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
          }}
        >
          <Flex
            gap={24}
            align="center"
            justify="center"
            style={{ marginBottom: 24 }}
          >
            {/* BEFORE */}
            <div
              style={{
                flex: 1,
                background: BRAND.colors.surfaces.subtle,
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
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
                BEFORE
              </div>
              <Donut
                size={120}
                percent={57}
                trackColor={BRAND.colors.highlights.warning.bg}
                progressColor={BRAND.colors.highlights.warning.icon}
                strokeWidth={11}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.highlights.warning.icon,
                    lineHeight: 1,
                  }}
                >
                  57.2
                </div>
              </Donut>
              <span
                style={{
                  background: BRAND.colors.highlights.warning.bg,
                  color: BRAND.colors.highlights.warning.text,
                  fontSize: BRAND.fontSize.bodySmall,
                  fontWeight: BRAND.fontWeight.semibold,
                  padding: '4px 12px',
                  borderRadius: 999,
                }}
              >
                개선 필요
              </span>
            </div>

            {/* 화살표 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: BRAND.colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconArrowRight size={22} color="#fff" stroke={2.2} />
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primary,
                }}
              >
                AI 개선
              </div>
            </div>

            {/* AFTER */}
            <div
              style={{
                flex: 1,
                background: '#fff',
                border: `2px solid ${BRAND.colors.primary}`,
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  color: BRAND.colors.primary,
                  fontSize: 11,
                  fontWeight: BRAND.fontWeight.semibold,
                  letterSpacing: 0.5,
                }}
              >
                AFTER
              </div>
              <Donut
                size={120}
                percent={87}
                trackColor={BRAND.colors.badges.purposeA.bg}
                progressColor={BRAND.colors.primary}
                strokeWidth={11}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.primaryDark,
                    lineHeight: 1,
                  }}
                >
                  87.5
                </div>
              </Donut>
              <span
                style={{
                  background: BRAND.colors.highlights.success.bg,
                  color: BRAND.colors.highlights.success.text,
                  fontSize: BRAND.fontSize.bodySmall,
                  fontWeight: BRAND.fontWeight.semibold,
                  padding: '4px 12px',
                  borderRadius: 999,
                }}
              >
                우수 등급
              </span>
            </div>
          </Flex>

          <div
            style={{
              background: BRAND.colors.highlights.success.bg,
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <IconTrendingUp
              size={20}
              color={BRAND.colors.highlights.success.icon}
              stroke={2}
            />
            <span
              style={{
                fontSize: BRAND.fontSize.body,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.highlights.success.text,
              }}
            >
              총 +30.3점 상승 · 예상 F1 0.62 → 0.81
            </span>
          </div>
        </div>

        {/* ── 1.5 empirical evidence: chart2 ── */}
        <div style={{ marginTop: 72 }}>
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
              EMPIRICAL EVIDENCE
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
              "점수 차이가 정말 모델 성능 차이로 이어지는가"
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#666',
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              오염 강도를 10% → 25% → 50% → 75%로 늘리면 DSC 점수와 F1이 함께 떨어집니다.
              <strong style={{ color: BRAND.colors.primaryDark }}> 5종 오염 × 5개 모델</strong> 모두에서 동일 패턴이 관찰됩니다 —
              점수를 끌어올리는 게 곧 모델 성능을 끌어올리는 것.
            </p>
          </div>
          <div
            style={{
              background: '#fff',
              border: '1px solid #E8EEF5',
              borderRadius: 14,
              padding: 20,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img
              src={levelChart}
              alt="오염 레벨별 DSC·F1 추이"
              style={{
                maxWidth: '100%',
                maxHeight: 320,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* ── 2. Improvement ROI 매트릭스 ── */}
        <div style={{ marginTop: 72 }}>
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
              IMPROVEMENT ROI MATRIX
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
              어떤 개선이 가장 효과적인가
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#666',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              ISO/IEC 25024 측정 표준 + Budach et al. 2022 영향 매트릭스 기반.
              effort 대비 기대 성능 향상으로 우선순위가 나옵니다.
            </p>
          </div>

          {/* 헤더 행 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 2.5fr 1fr',
              gap: 0,
              background: BRAND.colors.surfaces.subtle,
              padding: '12px 16px',
              borderRadius: '10px 10px 0 0',
              border: '1px solid #E8EEF5',
              fontSize: 11,
              fontWeight: BRAND.fontWeight.bold,
              color: BRAND.colors.primary,
              letterSpacing: 0.4,
            }}
          >
            <div>개선 항목</div>
            <div>난이도</div>
            <div>기대 효과</div>
            <div style={{ textAlign: 'right' }}>ROI</div>
          </div>

          {ROI_MATRIX.map(({ fix, effort, impact, rating, tier }) => {
            const tierColor =
              tier === 'top'
                ? '#1F9D6B'
                : tier === 'mid'
                  ? BRAND.colors.primary
                  : '#9AAAB8';
            return (
              <div
                key={fix}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 2.5fr 1fr',
                  gap: 0,
                  background: '#fff',
                  padding: '14px 16px',
                  borderLeft: '1px solid #E8EEF5',
                  borderRight: '1px solid #E8EEF5',
                  borderBottom: '1px solid #E8EEF5',
                  alignItems: 'center',
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: BRAND.colors.primaryDark,
                    fontWeight: BRAND.fontWeight.semibold,
                    paddingLeft: 10,
                    borderLeft: `3px solid ${tierColor}`,
                  }}
                >
                  {fix}
                </div>
                <div>
                  <span
                    style={{
                      background:
                        effort === 'Low'
                          ? BRAND.colors.highlights.success.bg
                          : effort === 'Medium'
                            ? BRAND.colors.surfaces.cardBlue
                            : BRAND.colors.surfaces.subtle,
                      color:
                        effort === 'Low'
                          ? BRAND.colors.highlights.success.text
                          : BRAND.colors.primaryDark,
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.semibold,
                      padding: '3px 9px',
                      borderRadius: 999,
                    }}
                  >
                    {effort}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#5A6678',
                    lineHeight: 1.5,
                  }}
                >
                  {impact}
                </div>
                <div style={{ textAlign: 'right', color: tierColor }}>
                  {Array.from({ length: rating }, (_, i) => (
                    <IconStarFilled key={i} size={14} />
                  ))}
                </div>
              </div>
            );
          })}

          <div
            style={{
              marginTop: 10,
              fontSize: 11,
              color: '#7A8FA5',
              lineHeight: 1.6,
              textAlign: 'right',
            }}
          >
            🟢 상위(★★★) · 🔵 중위(★★) · ⚪ 하위(★)
          </div>
        </div>

        {/* ── 3. 80/20 Pareto 인사이트 ── */}
        <div
          style={{
            marginTop: 56,
            background: '#fff',
            border: `2px solid ${BRAND.colors.primary}`,
            borderRadius: 18,
            padding: '32px 32px',
          }}
        >
          <Flex gap={32} wrap="wrap" align="center">
            <div style={{ flex: '0 0 auto' }}>
              <div
                style={{
                  fontSize: 64,
                  fontWeight: BRAND.fontWeight.black,
                  color: BRAND.colors.primary,
                  lineHeight: 1,
                  fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                }}
              >
                80<span style={{ fontSize: 36 }}>%</span>
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#7A8FA5',
                  letterSpacing: 0.4,
                  marginTop: 4,
                }}
              >
                of model improvement
              </div>
            </div>

            <div style={{ flex: '1 1 360px', minWidth: 280 }}>
              <h3
                style={{
                  fontSize: BRAND.fontSize.titleSmall,
                  fontWeight: BRAND.fontWeight.bold,
                  color: BRAND.colors.primaryDark,
                  margin: 0,
                  marginBottom: 10,
                }}
              >
                전체 개선의 80%가 상위 20% fix에서 나옵니다
              </h3>
              <p
                style={{
                  fontSize: BRAND.fontSize.body,
                  color: '#5A6678',
                  margin: 0,
                  lineHeight: 1.7,
                  marginBottom: 14,
                }}
              >
                모든 지표를 동시에 끌어올릴 필요 없습니다. ROI ★★★ 3개에 집중하면
                대부분 데이터셋에서 결정적인 점수 상승이 나옵니다.
              </p>
              <Flex gap={8} wrap="wrap">
                {['중복 제거', '타입 오류 수정', '클래스 불균형 처리'].map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: BRAND.colors.highlights.success.bg,
                      color: BRAND.colors.highlights.success.text,
                      fontSize: 12,
                      fontWeight: BRAND.fontWeight.semibold,
                      padding: '6px 12px',
                      borderRadius: 999,
                    }}
                  >
                    ★★★ {tag}
                  </span>
                ))}
              </Flex>
            </div>
          </Flex>
        </div>

        {/* ── 3.5 LLM 가중치 추천 화면 (실제 동작) ── */}
        <div style={{ marginTop: 72 }}>
          <Flex gap={32} wrap="wrap" align="center">
            <div style={{ flex: '1 1 320px', minWidth: 280 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: BRAND.fontWeight.bold,
                  color: BRAND.colors.primary,
                  letterSpacing: 0.5,
                  marginBottom: 6,
                }}
              >
                LLM IN ACTION
              </div>
              <h3
                style={{
                  fontSize: BRAND.fontSize.titleSmall,
                  fontWeight: BRAND.fontWeight.bold,
                  color: BRAND.colors.primaryDark,
                  margin: 0,
                  marginBottom: 12,
                }}
              >
                ROI 큰 지표에 가중치가 자동으로 쏠립니다
              </h3>
              <p
                style={{
                  fontSize: BRAND.fontSize.body,
                  color: '#5A6678',
                  margin: 0,
                  lineHeight: 1.7,
                  marginBottom: 16,
                }}
              >
                추상적인 ROI 표가 아니라 — 사용 목적을 입력하면 LLM이 실제 화면에서 분배합니다.
                위쪽 ROI ★★★ 지표(클래스 균형·중복·타입)에 큰 점수가 잡히고,
                ROI ★ 지표는 자연스럽게 낮은 가중치를 받습니다.
              </p>
              <Flex gap={8} wrap="wrap">
                {['RAG 검색 근거', '8개 지표 합 100', '수정 가능 (첫 진단)', '잠금 (재진단)'].map(
                  (tag) => (
                    <span
                      key={tag}
                      style={{
                        background: BRAND.colors.surfaces.subtle,
                        color: BRAND.colors.primaryDark,
                        fontSize: 11,
                        fontWeight: BRAND.fontWeight.semibold,
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                    >
                      {tag}
                    </span>
                  ),
                )}
              </Flex>
            </div>
            <div
              style={{
                flex: '1 1 360px',
                minWidth: 300,
                background: '#fff',
                border: '1px solid #E8EEF5',
                borderRadius: 14,
                padding: 16,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <img
                src={weightImg}
                alt="LLM 가중치 추천 화면"
                style={{
                  maxWidth: '100%',
                  maxHeight: 320,
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
            </div>
          </Flex>
        </div>

        {/* ── 3.7 단일 fix의 부수 효과 — chart5 radar ── */}
        <div style={{ marginTop: 72 }}>
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
              SIDE EFFECTS
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
              fix 하나가 다른 지표는 어떻게 흔드나
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#666',
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              결측치(completeness)만 0% → 95%로 점진 해소했을 때 8지표가 어떻게 반응하는지 radar로 본 결과 —
              <strong style={{ color: BRAND.colors.primaryDark }}> 부수 효과는 거의 없습니다. </strong>
              지표 간 직교성(orthogonality)이 어느 정도 확보되어 있어 fix 우선순위 결정이 단순해집니다.
            </p>
          </div>
          <div
            style={{
              background: '#fff',
              border: '1px solid #E8EEF5',
              borderRadius: 14,
              padding: 20,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <img
              src={radarChart}
              alt="단일 오염 강도별 다지표 영향 radar"
              style={{
                maxWidth: '100%',
                maxHeight: 380,
                objectFit: 'contain',
                display: 'block',
              }}
            />
          </div>
        </div>

        {/* ── 4. 5종 개선 패턴 구체화 ── */}
        <div style={{ marginTop: 72 }}>
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
              FIX PATTERNS
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
              각 오염을 실제로 어떻게 고치는가
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#666',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              "이렇게 하세요" 수준이 아니라 도구·라이브러리·기대 효과까지.
            </p>
          </div>
          <Flex vertical gap={14}>
            {FIX_PATTERNS.map(({ Icon, pollution, whatToDo, tools, expected }) => (
              <div
                key={pollution}
                style={{
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 22,
                }}
              >
                <Flex gap={20} wrap="wrap" align="flex-start">
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
                  <div style={{ flex: '1 1 280px', minWidth: 240 }}>
                    <div
                      style={{
                        fontSize: BRAND.fontSize.subtitleSmall,
                        fontWeight: BRAND.fontWeight.bold,
                        color: BRAND.colors.primaryDark,
                        marginBottom: 6,
                      }}
                    >
                      {pollution}
                    </div>
                    <div
                      style={{
                        fontSize: BRAND.fontSize.bodySmall,
                        color: '#3F4A5C',
                        lineHeight: 1.7,
                        marginBottom: 12,
                      }}
                    >
                      {whatToDo}
                    </div>
                    <Flex gap={6} wrap="wrap" style={{ marginBottom: 10 }}>
                      {tools.map((t) => (
                        <span
                          key={t}
                          style={{
                            background: BRAND.colors.surfaces.subtle,
                            color: BRAND.colors.primaryDark,
                            fontSize: 11,
                            fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                            fontWeight: BRAND.fontWeight.semibold,
                            padding: '3px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {t}
                        </span>
                      ))}
                    </Flex>
                    <div
                      style={{
                        fontSize: 12,
                        color: BRAND.colors.primary,
                        fontWeight: BRAND.fontWeight.semibold,
                        lineHeight: 1.55,
                      }}
                    >
                      📈 {expected}
                    </div>
                  </div>
                </Flex>
              </div>
            ))}
          </Flex>
        </div>

        {/* ── 5. 모델 family별 outlier 영향 ── */}
        <div style={{ marginTop: 72 }}>
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
              MODEL FAMILY × OUTLIER
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
              같은 개선도 모델에 따라 ROI가 정반대
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#666',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              이상치 제거를 예로 들면 — 선형 모델엔 결정적, 트리 앙상블엔 사실상 무의미.
              <strong style={{ color: BRAND.colors.primaryDark }}> 모델 타입을 보고 우선순위를 다르게 잡아야 합니다.</strong>
            </p>
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid #E8EEF5',
              borderRadius: 14,
              overflow: 'hidden',
            }}
          >
            {MODEL_OUTLIER_IMPACT.map(({ model, family, impact, example }, idx) => {
              const impactColor =
                impact === '극단'
                  ? '#D9396A'
                  : impact === '높음'
                    ? '#FF8A3D'
                    : impact === '중간'
                      ? '#BA7517'
                      : impact === '낮음'
                        ? '#1F9D6B'
                        : '#9AAAB8';
              return (
                <div
                  key={model}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1.5fr 1fr 1fr 2.5fr',
                    gap: 0,
                    padding: '14px 18px',
                    borderTop: idx === 0 ? 'none' : '1px solid #E8EEF5',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: BRAND.fontSize.bodySmall,
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primaryDark,
                      fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                    }}
                  >
                    {model}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#7A8FA5',
                    }}
                  >
                    {family}
                  </div>
                  <div>
                    <span
                      style={{
                        background: `${impactColor}1A`,
                        color: impactColor,
                        fontSize: 11,
                        fontWeight: BRAND.fontWeight.bold,
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                    >
                      {impact}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#5A6678',
                      lineHeight: 1.5,
                    }}
                  >
                    {example}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            style={{
              marginTop: 14,
              padding: '12px 16px',
              background: BRAND.colors.surfaces.cardBlue,
              borderRadius: 10,
              fontSize: BRAND.fontSize.bodySmall,
              color: BRAND.colors.primaryDark,
              lineHeight: 1.7,
            }}
          >
            <IconBolt size={16} stroke={2} style={{ verticalAlign: 'middle', marginRight: 6 }} />
            플랫폼은 진단 시점에 데이터 타입과 사용 목적으로 추정한 모델 family를 LLM이 받아 가중치에 반영합니다 —
            그래서 트리 기반 사용자에게는 이상치 가중치를 낮춥니다.
          </div>
        </div>

        {/* ── 6. 재진단 사이클 (plateau) ── */}
        <div style={{ marginTop: 72 }}>
          <div style={{ marginBottom: 24 }}>
            <Flex align="center" gap={10} style={{ marginBottom: 6 }}>
              <IconRecycle size={20} color={BRAND.colors.primary} stroke={2} />
              <div
                style={{
                  fontSize: 11,
                  fontWeight: BRAND.fontWeight.bold,
                  color: BRAND.colors.primary,
                  letterSpacing: 0.5,
                }}
              >
                ITERATIVE CYCLE
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
              한 번의 개선으로 끝이 아닙니다 — plateau까지 반복
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#666',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              재진단은 동일 가중치를 강제하므로 부담 없이 여러 번 반복할 수 있고,
              <strong style={{ color: BRAND.colors.primaryDark }}> 점수가 더 안 오르는 순간이 진짜 멈춤 신호</strong>입니다.
            </p>
          </div>

          <Flex vertical gap={12}>
            {RETRY_CYCLE.map(({ round, parent, child, delta, focus }, idx) => {
              const isLast = idx === RETRY_CYCLE.length - 1;
              const deltaColor = delta === 0 ? '#9AAAB8' : delta > 5 ? '#1F9D6B' : delta > 1 ? BRAND.colors.primary : '#9AAAB8';
              return (
                <div
                  key={round}
                  style={{
                    background: isLast ? BRAND.colors.surfaces.subtle : '#fff',
                    border: isLast ? '1px dashed #CBD3E0' : '1px solid #E8EEF5',
                    borderRadius: 14,
                    padding: 20,
                  }}
                >
                  <Flex gap={20} wrap="wrap" align="center">
                    <div
                      style={{
                        flex: '0 0 100px',
                        fontSize: 12,
                        fontWeight: BRAND.fontWeight.bold,
                        color: BRAND.colors.primary,
                        letterSpacing: 0.4,
                      }}
                    >
                      {round}
                    </div>

                    <div style={{ flex: '0 0 auto' }}>
                      <Flex align="center" gap={12}>
                        {parent > 0 && (
                          <>
                            <span
                              style={{
                                fontSize: 18,
                                fontWeight: BRAND.fontWeight.bold,
                                color: '#9AAAB8',
                                fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                              }}
                            >
                              {parent}
                            </span>
                            <IconArrowRight size={16} color="#9AAAB8" stroke={2} />
                          </>
                        )}
                        <span
                          style={{
                            fontSize: 22,
                            fontWeight: BRAND.fontWeight.black,
                            color: BRAND.colors.primaryDark,
                            fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                          }}
                        >
                          {child}
                        </span>
                        {delta > 0 && (
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: BRAND.fontWeight.bold,
                              color: deltaColor,
                              fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                            }}
                          >
                            ▲ +{delta.toFixed(1)}
                          </span>
                        )}
                        {delta === 0 && parent === 0 && (
                          <span
                            style={{
                              fontSize: 11,
                              color: '#9AAAB8',
                              fontWeight: BRAND.fontWeight.semibold,
                            }}
                          >
                            baseline
                          </span>
                        )}
                      </Flex>
                    </div>

                    <div
                      style={{
                        flex: '1 1 280px',
                        minWidth: 240,
                        fontSize: BRAND.fontSize.bodySmall,
                        color: '#5A6678',
                        lineHeight: 1.6,
                      }}
                    >
                      {focus}
                    </div>
                  </Flex>
                </div>
              );
            })}
          </Flex>

          <div
            style={{
              marginTop: 16,
              padding: '14px 18px',
              background: BRAND.colors.surfaces.cardBlue,
              border: `1px dashed ${BRAND.colors.primary}55`,
              borderRadius: 10,
              fontSize: BRAND.fontSize.bodySmall,
              color: BRAND.colors.primaryDark,
              lineHeight: 1.7,
            }}
          >
            <strong>Pareto + plateau 결합 전략:</strong> ROI ★★★부터 적용 → 효과 큰 라운드를 먼저 끝내고,
            ROI ★ fix로 plateau에 가까울 때만 마무리. 모든 fix를 다 적용할 필요는 없습니다.
          </div>
        </div>

        {/* ── 7. FAQ ── */}
        <div style={{ marginTop: 72 }}>
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
              FAQ
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
              자주 받는 질문
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#666',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              재진단 사이클과 가중치 잠금 동작에 대해 자주 헷갈리는 부분만 정리했습니다.
            </p>
          </div>
          <Flex vertical gap={12}>
            {FAQS.map(({ q, a }, idx) => (
              <div
                key={idx}
                style={{
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 22,
                }}
              >
                <Flex gap={12} align="flex-start" style={{ marginBottom: 10 }}>
                  <span
                    style={{
                      background: BRAND.colors.primary,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      letterSpacing: 0.5,
                      padding: '3px 8px',
                      borderRadius: 6,
                      flex: '0 0 auto',
                      marginTop: 2,
                    }}
                  >
                    Q
                  </span>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.body,
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primaryDark,
                      lineHeight: 1.4,
                    }}
                  >
                    {q}
                  </div>
                </Flex>
                <Flex gap={12} align="flex-start">
                  <span
                    style={{
                      background: BRAND.colors.surfaces.subtle,
                      color: BRAND.colors.primary,
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      letterSpacing: 0.5,
                      padding: '3px 8px',
                      borderRadius: 6,
                      flex: '0 0 auto',
                      marginTop: 2,
                    }}
                  >
                    A
                  </span>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.bodySmall,
                      color: '#3F4A5C',
                      lineHeight: 1.75,
                    }}
                  >
                    {a}
                  </div>
                </Flex>
              </div>
            ))}
          </Flex>
        </div>
      </div>
    </section>
  );
}
