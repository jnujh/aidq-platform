import { Flex } from 'antd';
import { IconTable, IconPhoto, IconFileText } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

type Cell = {
  available: boolean;
  metricsCount: number | null;
  topMetrics: string[];
  note?: string;
};

type Row = {
  Icon: typeof IconTable;
  label: string;
  classification: Cell;
  regression: Cell;
};

const ROWS: Row[] = [
  {
    Icon: IconTable,
    label: 'Tabular',
    classification: {
      available: true,
      metricsCount: 9,
      topMetrics: ['completeness 0.20', 'label_consistency 0.20'],
    },
    regression: {
      available: true,
      metricsCount: 9,
      topMetrics: ['target_smoothness 0.20', 'feature_correlation 0.18'],
    },
  },
  {
    Icon: IconPhoto,
    label: 'Image',
    classification: {
      available: true,
      metricsCount: 10,
      topMetrics: ['sample_quality_image 0.15', 'class_balance 0.18'],
    },
    regression: {
      available: false,
      metricsCount: null,
      topMetrics: [],
      note: '이미지 회귀는 일반적으로 활용되지 않아 미지원',
    },
  },
  {
    Icon: IconFileText,
    label: 'Text',
    classification: {
      available: true,
      metricsCount: 10,
      topMetrics: ['sample_quality_text 0.15', 'label_consistency 0.20'],
    },
    regression: {
      available: true,
      metricsCount: 10,
      topMetrics: ['target_smoothness 0.20', 'sample_quality_text 0.15'],
    },
  },
];

function CellBox({ cell }: { cell: Cell }) {
  if (!cell.available) {
    return (
      <div
        style={{
          background: '#F7F8FA',
          border: '1px dashed #D5DAE2',
          borderRadius: 12,
          padding: 18,
          minHeight: 130,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          gap: 6,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: BRAND.fontWeight.bold,
            color: '#999',
            letterSpacing: 0.5,
          }}
        >
          미지원
        </span>
        <span style={{ fontSize: 11, color: '#999', lineHeight: 1.55 }}>
          {cell.note}
        </span>
      </div>
    );
  }
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E8EEF5',
        borderRadius: 12,
        padding: 18,
        minHeight: 130,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      }}
    >
      <Flex justify="space-between" align="center">
        <span
          style={{
            background: BRAND.colors.surfaces.cardBlue,
            color: BRAND.colors.primary,
            fontSize: 11,
            fontWeight: BRAND.fontWeight.bold,
            padding: '3px 9px',
            borderRadius: 999,
          }}
        >
          {cell.metricsCount}개 지표
        </span>
        <span
          style={{
            color: BRAND.colors.highlights.success.icon,
            fontSize: 11,
            fontWeight: BRAND.fontWeight.bold,
          }}
        >
          ● 등록 완료
        </span>
      </Flex>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          marginTop: 'auto',
        }}
      >
        {cell.topMetrics.map((m) => (
          <span
            key={m}
            style={{
              fontSize: 11,
              color: '#555',
              fontFamily:
                '"SF Mono","Menlo","Consolas","DM Mono",monospace',
              lineHeight: 1.4,
            }}
          >
            {m}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function CellMatrixSection() {
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
            DIAGNOSIS CELL MATRIX
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
            3 데이터 타입 × 2 작업 = 6개 진단 셀
          </h2>
          <p
            style={{ fontSize: BRAND.fontSize.body, color: '#666', margin: 0 }}
          >
            각 셀이 자신만의 지표 세트와 가중치를 가집니다
          </p>
        </div>

        {/* 헤더 행 */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr 1fr',
            gap: 16,
            marginBottom: 12,
          }}
        >
          <div />
          <div
            style={{
              textAlign: 'center',
              padding: '10px 12px',
              fontSize: 12,
              fontWeight: BRAND.fontWeight.bold,
              color: BRAND.colors.primaryDark,
              background: '#fff',
              border: '1px solid #E8EEF5',
              borderRadius: 10,
              letterSpacing: 0.3,
            }}
          >
            CLASSIFICATION
          </div>
          <div
            style={{
              textAlign: 'center',
              padding: '10px 12px',
              fontSize: 12,
              fontWeight: BRAND.fontWeight.bold,
              color: BRAND.colors.primaryDark,
              background: '#fff',
              border: '1px solid #E8EEF5',
              borderRadius: 10,
              letterSpacing: 0.3,
            }}
          >
            REGRESSION
          </div>
        </div>

        {/* 데이터 행 */}
        <Flex vertical gap={16}>
          {ROWS.map((row) => (
            <div
              key={row.label}
              style={{
                display: 'grid',
                gridTemplateColumns: '160px 1fr 1fr',
                gap: 16,
                alignItems: 'stretch',
              }}
            >
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 12,
                  padding: '18px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: BRAND.colors.surfaces.cardBlue,
                    color: BRAND.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <row.Icon size={22} stroke={2} />
                </div>
                <span
                  style={{
                    fontSize: BRAND.fontSize.body,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primaryDark,
                    letterSpacing: 0.3,
                  }}
                >
                  {row.label}
                </span>
              </div>
              <CellBox cell={row.classification} />
              <CellBox cell={row.regression} />
            </div>
          ))}
        </Flex>

        <div
          style={{
            marginTop: 24,
            background: BRAND.colors.surfaces.cardBlue,
            borderRadius: 12,
            padding: '14px 18px',
            fontSize: BRAND.fontSize.bodySmall,
            color: BRAND.colors.primaryDark,
            lineHeight: 1.55,
            textAlign: 'center',
          }}
        >
          업로드된 데이터의 타입·작업이 자동 감지되면, 해당 셀의 지표·가중치 세트가 즉시 적용됩니다
        </div>
      </div>
    </section>
  );
}
