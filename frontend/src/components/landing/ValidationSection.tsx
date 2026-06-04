import { Flex } from 'antd';
import { BRAND } from '../../config/brand';

const MODEL_COLORS: Record<string, string> = {
  LogisticRegression: '#5FB3A1',
  MLP: '#F39B7E',
  RandomForest: '#8DA0CB',
  SVC: '#E78AC3',
  XGBoost: '#A6D854',
};

const SCATTER_POINTS: { dsc: number; f1: number; model: keyof typeof MODEL_COLORS }[] = [
  { dsc: 39, f1: 0.45, model: 'LogisticRegression' },
  { dsc: 40, f1: 0.71, model: 'MLP' },
  { dsc: 41, f1: 0.06, model: 'XGBoost' },
  { dsc: 42, f1: 0.36, model: 'RandomForest' },
  { dsc: 43, f1: 0.59, model: 'SVC' },
  { dsc: 45, f1: 0.48, model: 'LogisticRegression' },
  { dsc: 46, f1: 0.42, model: 'XGBoost' },
  { dsc: 48, f1: 0.51, model: 'MLP' },
  { dsc: 49, f1: 0.62, model: 'RandomForest' },
  { dsc: 51, f1: 0.66, model: 'SVC' },
  { dsc: 53, f1: 0.42, model: 'XGBoost' },
  { dsc: 55, f1: 0.58, model: 'LogisticRegression' },
  { dsc: 57, f1: 0.15, model: 'MLP' },
  { dsc: 58, f1: 0.71, model: 'RandomForest' },
  { dsc: 60, f1: 0.45, model: 'SVC' },
  { dsc: 62, f1: 0.67, model: 'LogisticRegression' },
  { dsc: 63, f1: 0.62, model: 'XGBoost' },
  { dsc: 64, f1: 0.7, model: 'MLP' },
  { dsc: 65, f1: 0.55, model: 'RandomForest' },
  { dsc: 66, f1: 0.68, model: 'SVC' },
  { dsc: 67, f1: 0.34, model: 'XGBoost' },
  { dsc: 68, f1: 0.73, model: 'LogisticRegression' },
  { dsc: 69, f1: 0.4, model: 'MLP' },
  { dsc: 70, f1: 0.71, model: 'RandomForest' },
  { dsc: 71, f1: 0.45, model: 'SVC' },
  { dsc: 72, f1: 0.83, model: 'MLP' },
  { dsc: 73, f1: 0.7, model: 'XGBoost' },
  { dsc: 74, f1: 0.69, model: 'LogisticRegression' },
  { dsc: 75, f1: 0.78, model: 'RandomForest' },
  { dsc: 76, f1: 0.82, model: 'SVC' },
  { dsc: 77, f1: 0.85, model: 'MLP' },
  { dsc: 78, f1: 0.74, model: 'XGBoost' },
  { dsc: 79, f1: 0.88, model: 'RandomForest' },
  { dsc: 80, f1: 0.91, model: 'LogisticRegression' },
  { dsc: 81, f1: 0.84, model: 'SVC' },
  { dsc: 82, f1: 0.93, model: 'MLP' },
  { dsc: 83, f1: 0.81, model: 'XGBoost' },
  { dsc: 84, f1: 0.95, model: 'RandomForest' },
  { dsc: 85, f1: 0.89, model: 'LogisticRegression' },
  { dsc: 86, f1: 0.92, model: 'SVC' },
  { dsc: 87, f1: 0.96, model: 'MLP' },
  { dsc: 88, f1: 0.87, model: 'XGBoost' },
  { dsc: 89, f1: 0.94, model: 'RandomForest' },
  { dsc: 90, f1: 0.9, model: 'LogisticRegression' },
  { dsc: 91, f1: 0.93, model: 'SVC' },
  { dsc: 92, f1: 0.96, model: 'MLP' },
  { dsc: 93, f1: 0.77, model: 'XGBoost' },
];

const BOX_DATA = [
  { grade: 'A', min: 0.76, q1: 0.83, median: 0.88, q3: 0.94, max: 0.96, mean: 0.883, color: '#5FB37C' },
  { grade: 'B', min: 0.52, q1: 0.7, median: 0.74, q3: 0.9, max: 0.97, mean: 0.78, color: '#C5D147' },
  { grade: 'C', min: 0.18, q1: 0.49, median: 0.65, q3: 0.69, max: 0.86, mean: 0.597, color: '#F4D157' },
  { grade: 'D', min: 0.06, q1: 0.43, median: 0.61, q3: 0.68, max: 0.74, mean: 0.52, color: '#E07856' },
];

const SCATTER_W = 540;
const SCATTER_H = 360;
const SCATTER_PAD = { top: 24, right: 16, bottom: 44, left: 48 };
const DSC_MIN = 35;
const DSC_MAX = 95;

const xScale = (dsc: number) =>
  SCATTER_PAD.left +
  ((dsc - DSC_MIN) / (DSC_MAX - DSC_MIN)) *
    (SCATTER_W - SCATTER_PAD.left - SCATTER_PAD.right);
const yScale = (f1: number) =>
  SCATTER_PAD.top +
  (1 - f1) * (SCATTER_H - SCATTER_PAD.top - SCATTER_PAD.bottom);

const REGRESSION_SLOPE = 0.0093;
const REGRESSION_INTERCEPT = 0.02;

const BOX_W = 540;
const BOX_H = 360;
const BOX_PAD = { top: 24, right: 16, bottom: 44, left: 48 };
const BOX_INNER_W = BOX_W - BOX_PAD.left - BOX_PAD.right;
const BOX_INNER_H = BOX_H - BOX_PAD.top - BOX_PAD.bottom;
const boxX = (i: number) =>
  BOX_PAD.left + (i + 0.5) * (BOX_INNER_W / BOX_DATA.length);
const boxY = (f1: number) => BOX_PAD.top + (1 - f1) * BOX_INNER_H;
const BOX_WIDTH = 56;

function ScatterChart() {
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
  const xTicks = [40, 50, 60, 70, 80, 90];

  return (
    <svg
      viewBox={`0 0 ${SCATTER_W} ${SCATTER_H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label="DSC Score vs F1-score 산점도"
    >
      {yTicks.map((t) => (
        <g key={`y-${t}`}>
          <line
            x1={SCATTER_PAD.left}
            x2={SCATTER_W - SCATTER_PAD.right}
            y1={yScale(t)}
            y2={yScale(t)}
            stroke="#EDF1F5"
            strokeWidth={1}
          />
          <text
            x={SCATTER_PAD.left - 8}
            y={yScale(t) + 4}
            textAnchor="end"
            fontSize={11}
            fill="#888"
          >
            {t.toFixed(1)}
          </text>
        </g>
      ))}

      {xTicks.map((t) => (
        <text
          key={`x-${t}`}
          x={xScale(t)}
          y={SCATTER_H - SCATTER_PAD.bottom + 18}
          textAnchor="middle"
          fontSize={11}
          fill="#888"
        >
          {t}
        </text>
      ))}

      <line
        x1={xScale(DSC_MIN)}
        y1={yScale(REGRESSION_SLOPE * DSC_MIN + REGRESSION_INTERCEPT)}
        x2={xScale(DSC_MAX)}
        y2={yScale(REGRESSION_SLOPE * DSC_MAX + REGRESSION_INTERCEPT)}
        stroke="#888"
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />

      {SCATTER_POINTS.map((p, i) => (
        <circle
          key={i}
          cx={xScale(p.dsc)}
          cy={yScale(p.f1)}
          r={4}
          fill={MODEL_COLORS[p.model]}
          fillOpacity={0.75}
        />
      ))}

      <g transform={`translate(${SCATTER_PAD.left + 8}, ${SCATTER_PAD.top + 6})`}>
        <rect
          width={210}
          height={42}
          rx={6}
          fill="#FFF8E5"
          stroke="#E8D89A"
          strokeWidth={1}
        />
        <text x={10} y={17} fontSize={11} fill="#5C4A14" fontWeight={600}>
          Pearson r = 0.598 (p = 1.6e-43)
        </text>
        <text x={10} y={33} fontSize={11} fill="#5C4A14" fontWeight={600}>
          Spearman ρ = 0.628 (p = 4.7e-49)
        </text>
      </g>

      <text
        x={SCATTER_W / 2}
        y={SCATTER_H - 6}
        textAnchor="middle"
        fontSize={12}
        fill="#555"
        fontWeight={600}
      >
        DSC Score
      </text>
      <text
        x={-SCATTER_H / 2}
        y={14}
        transform="rotate(-90)"
        textAnchor="middle"
        fontSize={12}
        fill="#555"
        fontWeight={600}
      >
        F1-score (macro)
      </text>
    </svg>
  );
}

function BoxPlotChart() {
  const yTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <svg
      viewBox={`0 0 ${BOX_W} ${BOX_H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
      role="img"
      aria-label="DSC 등급별 F1-score 분포 박스플롯"
    >
      {yTicks.map((t) => (
        <g key={`y-${t}`}>
          <line
            x1={BOX_PAD.left}
            x2={BOX_W - BOX_PAD.right}
            y1={boxY(t)}
            y2={boxY(t)}
            stroke="#EDF1F5"
            strokeWidth={1}
          />
          <text
            x={BOX_PAD.left - 8}
            y={boxY(t) + 4}
            textAnchor="end"
            fontSize={11}
            fill="#888"
          >
            {t.toFixed(1)}
          </text>
        </g>
      ))}

      {BOX_DATA.map((b, i) => {
        const cx = boxX(i);
        const left = cx - BOX_WIDTH / 2;

        return (
          <g key={b.grade}>
            <line
              x1={cx}
              x2={cx}
              y1={boxY(b.max)}
              y2={boxY(b.min)}
              stroke="#666"
              strokeWidth={1}
            />
            <line
              x1={cx - 12}
              x2={cx + 12}
              y1={boxY(b.max)}
              y2={boxY(b.max)}
              stroke="#666"
              strokeWidth={1}
            />
            <line
              x1={cx - 12}
              x2={cx + 12}
              y1={boxY(b.min)}
              y2={boxY(b.min)}
              stroke="#666"
              strokeWidth={1}
            />

            <rect
              x={left}
              y={boxY(b.q3)}
              width={BOX_WIDTH}
              height={boxY(b.q1) - boxY(b.q3)}
              fill={b.color}
              fillOpacity={0.75}
              stroke={b.color}
              strokeWidth={1.5}
            />
            <line
              x1={left}
              x2={left + BOX_WIDTH}
              y1={boxY(b.median)}
              y2={boxY(b.median)}
              stroke="#333"
              strokeWidth={1.5}
            />

            <text
              x={cx}
              y={boxY(b.mean) + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={700}
              fill="#1f1f1f"
            >
              μ={b.mean.toFixed(3)}
            </text>

            <text
              x={cx}
              y={BOX_H - BOX_PAD.bottom + 22}
              textAnchor="middle"
              fontSize={14}
              fontWeight={700}
              fill="#333"
            >
              {b.grade}
            </text>
          </g>
        );
      })}

      <text
        x={BOX_W / 2}
        y={BOX_H - 4}
        textAnchor="middle"
        fontSize={12}
        fill="#555"
        fontWeight={600}
      >
        DSC Grade
      </text>
      <text
        x={-BOX_H / 2}
        y={14}
        transform="rotate(-90)"
        textAnchor="middle"
        fontSize={12}
        fill="#555"
        fontWeight={600}
      >
        F1-score (macro)
      </text>
    </svg>
  );
}

const KEY_STATS = [
  { value: '435', label: '학습 실험', sub: 'training runs' },
  { value: '0.598', label: 'Pearson r', sub: 'p < 1e-43' },
  { value: '0.628', label: 'Spearman ρ', sub: 'p < 1e-48' },
  { value: '84.4', label: 'ANOVA F', sub: '4개 등급 검정' },
];

export default function ValidationSection() {
  return (
    <section style={{ padding: '64px 40px', background: BRAND.colors.surfaces.subtle }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div
            style={{
              color: BRAND.colors.primary,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            VALIDATION RESULTS
          </div>
          <h2
            style={{
              fontSize: BRAND.fontSize.titleMedium,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 10,
            }}
          >
            DSC 점수는 실제 ML 성능을 예측합니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#555',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            5종 ML 모델 × 3개 공개 데이터셋 × 5종 오염 × 4단계 강도, 총 435회 학습으로 검증한 결과입니다.
          </p>
        </div>

        <Flex gap={12} style={{ marginBottom: 28 }} wrap="wrap">
          {KEY_STATS.map((s) => (
            <div
              key={s.label}
              style={{
                flex: '1 1 180px',
                background: '#fff',
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
                border: '1px solid #E8EEF5',
              }}
            >
              <div
                style={{
                  fontSize: 26,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primaryDark,
                  lineHeight: 1.1,
                  marginBottom: 6,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#333',
                  fontWeight: BRAND.fontWeight.semibold,
                  marginBottom: 2,
                }}
              >
                {s.label}
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>{s.sub}</div>
            </div>
          ))}
        </Flex>

        <Flex gap={20} wrap="wrap">
          <div
            style={{
              flex: '1 1 480px',
              minWidth: 0,
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              border: '1px solid #E8EEF5',
            }}
          >
            <div
              style={{
                fontSize: BRAND.fontSize.subtitleSmall,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primaryDark,
                marginBottom: 4,
              }}
            >
              DSC 점수 ↔ ML 성능 상관관계
            </div>
            <div style={{ fontSize: 12, color: '#777', marginBottom: 12 }}>
              점 하나가 한 번의 학습 실험 결과 · 우상향 분포 = 데이터 품질이 좋을수록 모델 성능 향상
            </div>
            <ScatterChart />
            <Flex gap={14} wrap="wrap" style={{ marginTop: 12 }}>
              {Object.entries(MODEL_COLORS).map(([name, color]) => (
                <Flex key={name} align="center" gap={6}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: color,
                      display: 'inline-block',
                    }}
                  />
                  <span style={{ fontSize: 11, color: '#555' }}>{name}</span>
                </Flex>
              ))}
            </Flex>
          </div>

          <div
            style={{
              flex: '1 1 480px',
              minWidth: 0,
              background: '#fff',
              borderRadius: 12,
              padding: 20,
              border: '1px solid #E8EEF5',
            }}
          >
            <div
              style={{
                fontSize: BRAND.fontSize.subtitleSmall,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primaryDark,
                marginBottom: 4,
              }}
            >
              DSC 등급별 ML 성능 분포
            </div>
            <div style={{ fontSize: 12, color: '#777', marginBottom: 12 }}>
              A등급 평균 F1 0.883, D등급 0.520 — 등급이 한 단계 떨어질 때마다 성능이 의미 있게 감소
            </div>
            <BoxPlotChart />
            <div
              style={{
                marginTop: 12,
                fontSize: 11,
                color: '#888',
                lineHeight: 1.5,
              }}
            >
              상자 = Q1~Q3, 가로선 = 중앙값, 수염 = 최솟/최댓값. ANOVA F=84.4, p&lt;1e-42로 등급 간 차이가 통계적으로 유의함.
            </div>
          </div>
        </Flex>

        <div
          style={{
            marginTop: 24,
            background: BRAND.colors.surfaces.cardBlue,
            borderRadius: 12,
            padding: '18px 22px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 18,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ flex: '1 1 360px', minWidth: 0 }}>
            <div
              style={{
                fontSize: BRAND.fontSize.bodySmall,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primaryDark,
                marginBottom: 4,
              }}
            >
              비선형 모델로 확인 시 설명력 1.77배 향상
            </div>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              선형 R² 0.358 → Random Forest 회귀 R² 0.632. Letter 데이터셋에서는 r=0.798, MLP 모델 기준 r=0.695를 기록했습니다.
            </div>
          </div>
          <div
            style={{
              fontSize: 11,
              color: '#666',
              borderLeft: '2px solid #C7D8EA',
              paddingLeft: 12,
              flexShrink: 0,
            }}
          >
            출처: DSC Validation Study
            <br />
            n=435 · 2026-04 공개
          </div>
        </div>
      </div>
    </section>
  );
}
