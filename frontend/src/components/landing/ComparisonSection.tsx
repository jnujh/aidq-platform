import { IconCircleCheck, IconX } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

type Cell = { kind: 'check' } | { kind: 'cross' } | { kind: 'text'; value: string };

const rows: Array<{ feature: string; ours: Cell; others: Cell }> = [
  {
    feature: '목적 인식 진단',
    ours: { kind: 'check' },
    others: { kind: 'cross' },
  },
  {
    feature: '자연어 입력',
    ours: { kind: 'check' },
    others: { kind: 'cross' },
  },
  {
    feature: '자동 가중치 조정',
    ours: { kind: 'check' },
    others: { kind: 'text', value: '수동만' },
  },
  {
    feature: '개선안 자동 생성',
    ours: { kind: 'check' },
    others: { kind: 'cross' },
  },
  {
    feature: '정형·비정형·멀티모달',
    ours: { kind: 'check' },
    others: { kind: 'text', value: '정형만' },
  },
];

function CellContent({ cell }: { cell: Cell }) {
  if (cell.kind === 'check') {
    return (
      <IconCircleCheck
        size={22}
        color={BRAND.colors.highlights.success.icon}
        stroke={2}
      />
    );
  }
  if (cell.kind === 'cross') {
    return <IconX size={20} color="#bbb" stroke={2} />;
  }
  return (
    <span style={{ fontSize: BRAND.fontSize.bodySmall, color: '#888' }}>
      {cell.value}
    </span>
  );
}

export default function ComparisonSection() {
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
            COMPARISON
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            왜 Scorecard일까요?
          </h2>
        </div>

        <div
          style={{
            maxWidth: 580,
            margin: '0 auto',
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 14,
            overflow: 'hidden',
          }}
        >
          {/* 헤더 행 */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr 1fr',
              background: BRAND.colors.surfaces.cardBlue,
              fontSize: BRAND.fontSize.bodySmall,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
            }}
          >
            <div style={{ padding: '14px 18px' }}>기능</div>
            <div style={{ padding: '14px 12px', textAlign: 'center' }}>
              Scorecard
            </div>
            <div style={{ padding: '14px 12px', textAlign: 'center' }}>
              기존 도구
            </div>
          </div>

          {/* 데이터 행 */}
          {rows.map((r) => (
            <div
              key={r.feature}
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr 1fr',
                borderTop: '1px solid #f0f0f0',
                alignItems: 'center',
              }}
            >
              <div
                style={{
                  padding: '14px 18px',
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#444',
                }}
              >
                {r.feature}
              </div>
              <div
                style={{
                  padding: '14px 12px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <CellContent cell={r.ours} />
              </div>
              <div
                style={{
                  padding: '14px 12px',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <CellContent cell={r.others} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
