import { useState } from 'react';
import { Flex } from 'antd';
import {
  IconChecks,
  IconShieldCheck,
  IconEqual,
  IconTarget,
  IconClock,
  IconFingerprint,
  IconChartPie,
  IconLink,
  IconTable,
  IconPhoto,
  IconFileText,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

const universalCategories = [
  { Icon: IconChecks, title: '완전성', desc: '결측치·누락 비율' },
  { Icon: IconShieldCheck, title: '유효성', desc: '형식 일치·디코딩' },
  { Icon: IconEqual, title: '일관성', desc: '표기 통일·중복 충돌' },
  { Icon: IconTarget, title: '정확성', desc: '값/라벨 신뢰도' },
  { Icon: IconClock, title: '최신성', desc: '업데이트 주기' },
  { Icon: IconFingerprint, title: '고유성', desc: '중복 없음' },
  { Icon: IconChartPie, title: '균형성', desc: '클래스·target 분포' },
  { Icon: IconLink, title: '관련성', desc: '목적 적합도' },
];

type Metric = { name: string; weight: number; isPrimary?: boolean };
type Cell = {
  id: string;
  dataType: '정형' | '이미지' | '텍스트';
  task: '분류' | '회귀';
  dataIcon: typeof IconTable;
  metrics: Metric[];
  backbone: string;
  validation: string;
};

const CELLS: Cell[] = [
  {
    id: 'tabular-cls',
    dataType: '정형',
    task: '분류',
    dataIcon: IconTable,
    backbone: 'sklearn (LogReg · RF · XGB · SVC · MLP)',
    validation: 'Pearson r = 0.598 · n=435 · 3 데이터셋 pool',
    metrics: [
      { name: 'completeness', weight: 0.20 },
      { name: 'label_consistency', weight: 0.20, isPrimary: true },
      { name: 'uniqueness', weight: 0.15 },
      { name: 'consistency', weight: 0.10 },
      { name: 'class_balance', weight: 0.10 },
      { name: 'feature_informativeness', weight: 0.10 },
      { name: 'validity', weight: 0.05 },
      { name: 'outlier_ratio', weight: 0.05 },
      { name: 'feature_correlation', weight: 0.05 },
    ],
  },
  {
    id: 'tabular-reg',
    dataType: '정형',
    task: '회귀',
    dataIcon: IconTable,
    backbone: 'sklearn (Linear · RF · XGB · MLP)',
    validation: 'Pearson r = 0.566 · n=324 · hold-out 5/5 PASS',
    metrics: [
      { name: 'target_smoothness', weight: 0.20, isPrimary: true },
      { name: 'completeness', weight: 0.20 },
      { name: 'uniqueness', weight: 0.15 },
      { name: 'consistency', weight: 0.10 },
      { name: 'target_distribution_quality', weight: 0.10 },
      { name: 'feature_informativeness_reg', weight: 0.10 },
      { name: 'validity', weight: 0.05 },
      { name: 'outlier_ratio', weight: 0.05 },
      { name: 'feature_correlation', weight: 0.05 },
    ],
  },
  {
    id: 'image-cls',
    dataType: '이미지',
    task: '분류',
    dataIcon: IconPhoto,
    backbone: 'ResNet18 (10-epoch finetune) + CNNSimple',
    validation: 'CIFAR-10 r=0.449 / Fashion-MNIST r=0.447 · 2/2 PASS',
    metrics: [
      { name: 'label_consistency', weight: 0.20, isPrimary: true },
      { name: 'completeness_image', weight: 0.15 },
      { name: 'class_balance', weight: 0.10 },
      { name: 'uniqueness', weight: 0.10 },
      { name: 'feature_informativeness', weight: 0.10 },
      { name: 'sample_quality_image', weight: 0.10 },
      { name: 'validity', weight: 0.05 },
      { name: 'consistency', weight: 0.05 },
      { name: 'outlier_ratio', weight: 0.05 },
      { name: 'feature_correlation', weight: 0.05 },
      { name: 'signal_integrity', weight: 0.05 },
    ],
  },
  {
    id: 'image-reg',
    dataType: '이미지',
    task: '회귀',
    dataIcon: IconPhoto,
    backbone: 'frozen ResNet18 (512-d) + Ridge·RF·MLP·kNN probe',
    validation: 'SCUT default r=0.668 / 제약최적 r=0.951',
    metrics: [
      { name: 'target_smoothness', weight: 0.20, isPrimary: true },
      { name: 'completeness_image', weight: 0.15 },
      { name: 'target_distribution_quality', weight: 0.10 },
      { name: 'uniqueness', weight: 0.10 },
      { name: 'feature_informativeness_reg', weight: 0.10 },
      { name: 'sample_quality_image', weight: 0.10 },
      { name: 'validity', weight: 0.05 },
      { name: 'consistency', weight: 0.05 },
      { name: 'outlier_ratio', weight: 0.05 },
      { name: 'feature_correlation', weight: 0.05 },
      { name: 'signal_integrity', weight: 0.05 },
    ],
  },
  {
    id: 'text-cls',
    dataType: '텍스트',
    task: '분류',
    dataIcon: IconFileText,
    backbone: 'frozen DistilBERT (768-d) + LogReg·RF·MLP·kNN probe',
    validation: 'ag_news 0.676 / imdb 0.412 / 20news 0.613 · 3/3 PASS',
    metrics: [
      { name: 'label_consistency', weight: 0.20, isPrimary: true },
      { name: 'completeness_text', weight: 0.15 },
      { name: 'sample_quality_text', weight: 0.15 },
      { name: 'class_balance', weight: 0.10 },
      { name: 'uniqueness', weight: 0.10 },
      { name: 'feature_informativeness', weight: 0.10 },
      { name: 'validity', weight: 0.05 },
      { name: 'consistency', weight: 0.05 },
      { name: 'outlier_ratio', weight: 0.05 },
      { name: 'feature_correlation', weight: 0.05 },
    ],
  },
  {
    id: 'text-reg',
    dataType: '텍스트',
    task: '회귀',
    dataIcon: IconFileText,
    backbone: 'frozen DistilBERT (768-d) + Ridge·RF·MLP·kNN probe',
    validation: 'yelp 0.555 / amazon 0.503 / sst5 0.487 · 3/3 PASS',
    metrics: [
      { name: 'target_smoothness', weight: 0.20, isPrimary: true },
      { name: 'completeness_text', weight: 0.15 },
      { name: 'sample_quality_text', weight: 0.15 },
      { name: 'target_distribution_quality', weight: 0.10 },
      { name: 'uniqueness', weight: 0.10 },
      { name: 'feature_informativeness_reg', weight: 0.10 },
      { name: 'validity', weight: 0.05 },
      { name: 'consistency', weight: 0.05 },
      { name: 'outlier_ratio', weight: 0.05 },
      { name: 'feature_correlation', weight: 0.05 },
    ],
  },
];

const SUBSTITUTIONS = [
  {
    from: 'class_balance',
    to: 'target_distribution_quality',
    detail: 'target을 10-bin equal-width 분할 후 정규화 Shannon entropy',
  },
  {
    from: 'label_consistency',
    to: 'target_smoothness',
    detail: 'k-NN(k=5) 이웃 target 표준편차 / 전체 target std 보수',
  },
  {
    from: 'feature_informativeness',
    to: 'feature_informativeness_reg',
    detail: 'mutual_info_classif → mutual_info_regression 치환',
  },
];

const VALIDATION_ROWS = [
  { cell: '정형 × 분류', metric: 'F1 macro', r: '0.598', dataset: 'Telco · Credit · letter (pool)', status: '정식 완료' },
  { cell: '정형 × 회귀', metric: 'R²', r: '0.566', dataset: 'California · Bike · Wine (pool)', status: 'hold-out 5/5 PASS' },
  { cell: '이미지 × 분류', metric: 'accuracy', r: '0.449 / 0.447', dataset: 'CIFAR-10 / Fashion-MNIST', status: '2/2 PASS' },
  { cell: '이미지 × 회귀', metric: 'R² (probe)', r: '0.668 / 0.951', dataset: 'SCUT-FBP5500 (default/제약최적)', status: '검증 통과' },
  { cell: '텍스트 × 분류', metric: 'F1 (probe)', r: '0.676 / 0.412 / 0.613', dataset: 'ag_news / imdb / 20news', status: '3/3 PASS' },
  { cell: '텍스트 × 회귀', metric: 'R² (probe)', r: '0.555 / 0.503 / 0.487', dataset: 'yelp / amazon / sst5', status: '3/3 PASS' },
];

function MetricBar({ metric }: { metric: Metric }) {
  const pct = metric.weight * 100;
  const barColor = metric.isPrimary
    ? BRAND.colors.primary
    : metric.weight >= 0.15
      ? '#5B8AC1'
      : metric.weight >= 0.10
        ? '#9DBBD9'
        : '#CFDEED';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 0' }}>
      <div
        style={{
          flex: '0 0 220px',
          fontSize: 12.5,
          fontFamily: '"SF Mono","Menlo","Consolas","DM Mono",monospace',
          color: metric.isPrimary ? BRAND.colors.primaryDark : '#444',
          fontWeight: metric.isPrimary ? BRAND.fontWeight.bold : BRAND.fontWeight.regular,
        }}
      >
        {metric.name}
        {metric.isPrimary && (
          <span
            style={{
              marginLeft: 8,
              fontSize: 9.5,
              padding: '1px 6px',
              borderRadius: 4,
              background: BRAND.colors.badges.purposeA.bg,
              color: BRAND.colors.badges.purposeA.text,
              fontFamily: 'inherit',
              letterSpacing: 0.3,
            }}
          >
            CORE
          </span>
        )}
      </div>
      <div
        style={{
          flex: 1,
          height: 10,
          background: '#F0F3F8',
          borderRadius: 5,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${pct * 4}%`,
            maxWidth: '100%',
            height: '100%',
            background: barColor,
            borderRadius: 5,
            transition: 'width 0.3s',
          }}
        />
      </div>
      <div
        style={{
          flex: '0 0 50px',
          textAlign: 'right',
          fontSize: 12.5,
          fontWeight: BRAND.fontWeight.semibold,
          color: BRAND.colors.primaryDark,
          fontFamily: '"SF Mono","Menlo","Consolas","DM Mono",monospace',
        }}
      >
        {metric.weight.toFixed(2)}
      </div>
    </div>
  );
}

function CellSelector({
  cells,
  active,
  onSelect,
}: {
  cells: Cell[];
  active: string;
  onSelect: (id: string) => void;
}) {
  return (
    <Flex gap={8} wrap="wrap" justify="center" style={{ marginBottom: 24 }}>
      {cells.map((c) => {
        const isActive = c.id === active;
        return (
          <button
            key={c.id}
            onClick={() => onSelect(c.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              border: `1px solid ${isActive ? BRAND.colors.primary : '#E8EEF5'}`,
              background: isActive ? BRAND.colors.primary : '#fff',
              color: isActive ? '#fff' : BRAND.colors.primaryDark,
              borderRadius: 999,
              fontSize: 13,
              fontWeight: isActive ? BRAND.fontWeight.bold : BRAND.fontWeight.semibold,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            <c.dataIcon size={15} stroke={2} />
            {c.dataType} × {c.task}
          </button>
        );
      })}
    </Flex>
  );
}

export default function MetricsSection() {
  const [activeCell, setActiveCell] = useState<string>('tabular-cls');
  const cell = CELLS.find((c) => c.id === activeCell) ?? CELLS[0];
  const totalWeight = cell.metrics.reduce((s, m) => s + m.weight, 0);

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
            TASK-CONDITIONAL METRICS
          </div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 12,
            }}
          >
            진단 지표는 데이터·작업에 따라 달라집니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
              maxWidth: 720,
              marginInline: 'auto',
              lineHeight: 1.6,
            }}
          >
            같은 이름의 지표라도 <strong>(data_type, task)</strong> 셀마다 정의식·가중치가 달라집니다.
            DSC v5 framework는 6개 셀(3 데이터 타입 × 2 작업)에 대해 각각의 지표 세트를 학술 근거와 함께 freeze해
            관리합니다.
          </p>
        </div>

        <div style={{ marginBottom: 64 }}>
          <h3
            style={{
              fontSize: 18,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            8가지 보편 품질 차원
          </h3>
          <p
            style={{
              fontSize: BRAND.fontSize.bodySmall,
              color: '#777',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: 24,
            }}
          >
            Wang & Strong (1996), Pipino (2002) 기준 — 모든 셀이 이 8개 차원에서 출발합니다
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 16,
            }}
          >
            {universalCategories.map(({ Icon, title, desc }) => (
              <div
                key={title}
                style={{
                  background: BRAND.colors.surfaces.subtle,
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  textAlign: 'center',
                }}
              >
                <Icon size={24} color={BRAND.colors.primary} stroke={1.8} />
                <div
                  style={{
                    fontSize: BRAND.fontSize.body,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.primaryDark,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#555',
                  }}
                >
                  {desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 64 }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              textAlign: 'center',
              marginBottom: 6,
            }}
          >
            셀을 선택해 지표 가중치를 확인하세요
          </h3>
          <p
            style={{
              fontSize: BRAND.fontSize.bodySmall,
              color: '#777',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: 24,
            }}
          >
            업로드된 데이터의 타입·작업이 자동 감지되면 해당 셀의 가중치 세트가 즉시 적용됩니다
          </p>

          <CellSelector cells={CELLS} active={activeCell} onSelect={setActiveCell} />

          <div
            style={{
              background: BRAND.colors.surfaces.subtle,
              borderRadius: 16,
              padding: '28px 32px',
            }}
          >
            <Flex justify="space-between" align="center" wrap="wrap" gap={16} style={{ marginBottom: 20 }}>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primary,
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  CELL · {cell.id.toUpperCase().replace('-', ' × ')}
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primaryDark,
                  }}
                >
                  {cell.dataType} × {cell.task}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#555',
                    marginTop: 6,
                  }}
                >
                  지표 {cell.metrics.length}개 · 가중치 합 {totalWeight.toFixed(2)}
                </div>
              </div>
              <div style={{ textAlign: 'right', minWidth: 280 }}>
                <div
                  style={{
                    fontSize: 10.5,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primary,
                    letterSpacing: 0.5,
                    marginBottom: 4,
                  }}
                >
                  검증 결과 (DSC ↔ 모델 성능)
                </div>
                <div style={{ fontSize: 13, color: BRAND.colors.primaryDark, fontWeight: BRAND.fontWeight.semibold }}>
                  {cell.validation}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: '#777',
                    marginTop: 6,
                    fontFamily: '"SF Mono","Menlo","Consolas","DM Mono",monospace',
                  }}
                >
                  backbone: {cell.backbone}
                </div>
              </div>
            </Flex>

            <div
              style={{
                background: '#fff',
                borderRadius: 12,
                padding: '16px 20px',
              }}
            >
              {cell.metrics.map((m) => (
                <MetricBar key={m.name} metric={m} />
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 64 }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              textAlign: 'center',
              marginBottom: 6,
            }}
          >
            분류 → 회귀 지표 치환 규칙
          </h3>
          <p
            style={{
              fontSize: BRAND.fontSize.bodySmall,
              color: '#777',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: 24,
            }}
          >
            회귀 셀(정형·이미지·텍스트 공통)은 라벨을 전제하는 3개 지표를 target 기반으로 치환합니다
          </p>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            {SUBSTITUTIONS.map((s) => (
              <div
                key={s.from}
                style={{
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 12,
                  padding: 20,
                }}
              >
                <Flex align="center" gap={8} style={{ marginBottom: 12 }}>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: BRAND.colors.badges.purposeA.bg,
                      color: BRAND.colors.badges.purposeA.text,
                      fontWeight: BRAND.fontWeight.bold,
                      fontFamily: '"SF Mono","Menlo","Consolas","DM Mono",monospace',
                    }}
                  >
                    {s.from}
                  </span>
                  <span style={{ color: '#999' }}>→</span>
                  <span
                    style={{
                      fontSize: 11,
                      padding: '3px 8px',
                      borderRadius: 6,
                      background: BRAND.colors.badges.purposeB.bg,
                      color: BRAND.colors.badges.purposeB.text,
                      fontWeight: BRAND.fontWeight.bold,
                      fontFamily: '"SF Mono","Menlo","Consolas","DM Mono",monospace',
                    }}
                  >
                    {s.to}
                  </span>
                </Flex>
                <div style={{ fontSize: BRAND.fontSize.bodySmall, color: '#444', lineHeight: 1.55 }}>
                  {s.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 64 }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              textAlign: 'center',
              marginBottom: 6,
            }}
          >
            검증 프로토콜 (6셀 통일)
          </h3>
          <p
            style={{
              fontSize: BRAND.fontSize.bodySmall,
              color: '#777',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: 24,
            }}
          >
            오염된 학습 데이터로 학습한 모델이 깨끗한 테스트셋에서 내는 성능 ↔ DSC Score 상관 측정
          </p>
          <div
            style={{
              background: BRAND.colors.surfaces.subtle,
              borderRadius: 16,
              padding: '28px 32px',
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 24,
            }}
          >
            {[
              {
                step: '1',
                title: 'Split-first + Clean-test',
                body: '데이터셋을 먼저 train/test로 분할하고 오염은 train에만 적용. 평가는 항상 오염되지 않은 clean test set에서 수행 — 데이터 누수 차단',
              },
              {
                step: '2',
                title: 'Frozen-feature Probe',
                body: '사전학습된 backbone(ResNet18·DistilBERT)을 frozen 임베딩 추출기로 사용, 그 위에 얕은 head(Ridge·RF·MLP·kNN)만 학습. SimCLR·MoCo·CLIP 표준 평가법',
              },
              {
                step: '3',
                title: 'Pearson r + Held-out',
                body: '(dataset × polluter × level × model) 조합마다 (DSC, 성능) 쌍 생성 → Pearson r. LODO·LOPO 두 hold-out으로 일반화 확인',
              },
            ].map((item) => (
              <div key={item.step} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: BRAND.colors.primary,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    fontWeight: BRAND.fontWeight.bold,
                  }}
                >
                  {item.step}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.subtitleSmall,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primaryDark,
                  }}
                >
                  {item.title}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#444',
                    lineHeight: 1.6,
                  }}
                >
                  {item.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3
            style={{
              fontSize: 20,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              textAlign: 'center',
              marginBottom: 6,
            }}
          >
            6개 셀 검증 결과
          </h3>
          <p
            style={{
              fontSize: BRAND.fontSize.bodySmall,
              color: '#777',
              textAlign: 'center',
              marginTop: 0,
              marginBottom: 24,
            }}
          >
            전 셀 공통 합격선: held-out Pearson r ≥ 0.40 (정형 분류만 r ≥ 0.50, v4 baseline)
          </p>
          <div
            style={{
              background: '#fff',
              border: '1px solid #E8EEF5',
              borderRadius: 12,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1fr 1.4fr 2fr 1.2fr',
                padding: '14px 20px',
                background: BRAND.colors.surfaces.subtle,
                fontSize: 11,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primaryDark,
                letterSpacing: 0.5,
                borderBottom: '1px solid #E8EEF5',
              }}
            >
              <div>셀</div>
              <div>성능 지표</div>
              <div>Pearson r</div>
              <div>데이터셋</div>
              <div style={{ textAlign: 'right' }}>상태</div>
            </div>
            {VALIDATION_ROWS.map((row, i) => (
              <div
                key={row.cell}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 1.4fr 2fr 1.2fr',
                  padding: '14px 20px',
                  fontSize: 13,
                  borderBottom: i === VALIDATION_ROWS.length - 1 ? 'none' : '1px solid #F0F3F8',
                  alignItems: 'center',
                }}
              >
                <div style={{ fontWeight: BRAND.fontWeight.semibold, color: BRAND.colors.primaryDark }}>
                  {row.cell}
                </div>
                <div
                  style={{
                    color: '#555',
                    fontFamily: '"SF Mono","Menlo","Consolas","DM Mono",monospace',
                    fontSize: 12,
                  }}
                >
                  {row.metric}
                </div>
                <div
                  style={{
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primary,
                    fontFamily: '"SF Mono","Menlo","Consolas","DM Mono",monospace',
                  }}
                >
                  {row.r}
                </div>
                <div style={{ color: '#666', fontSize: 12 }}>{row.dataset}</div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 999,
                      background: BRAND.colors.highlights.success.bg,
                      color: BRAND.colors.highlights.success.text,
                      fontWeight: BRAND.fontWeight.bold,
                    }}
                  >
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <p
            style={{
              fontSize: 11,
              color: '#888',
              textAlign: 'center',
              marginTop: 16,
              lineHeight: 1.6,
            }}
          >
            정형 셀은 sklearn 실모델 / 이미지 분류는 10-epoch finetune /
            이미지 회귀·텍스트 두 셀은 frozen-probe 측정 (DistilBERT 768-d, ResNet18 512-d)
          </p>
        </div>
      </div>
    </section>
  );
}
