import { Flex } from 'antd';
import { IconTable, IconFileText, IconPhoto } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

type StatusBadge = { kind: 'success'; label: string };

const items: Array<{
  Icon: typeof IconTable;
  iconColor: string;
  title: string;
  desc: string;
  status: StatusBadge;
  borderColor: string;
}> = [
  {
    Icon: IconTable,
    iconColor: BRAND.colors.primary,
    title: '정형 데이터',
    desc: 'CSV · 엑셀 · JSON · DB 테이블',
    status: { kind: 'success', label: '현재 지원' },
    borderColor: '#f0f0f0',
  },
  {
    Icon: IconFileText,
    iconColor: BRAND.colors.primary,
    title: '텍스트 데이터',
    desc: '문서 · 로그 · 뉴스·리뷰 (분류·회귀)',
    status: { kind: 'success', label: '현재 지원' },
    borderColor: '#f0f0f0',
  },
  {
    Icon: IconPhoto,
    iconColor: BRAND.colors.primary,
    title: '이미지 데이터',
    desc: '이미지 폴더 · ZIP (분류 작업용)',
    status: { kind: 'success', label: '현재 지원' },
    borderColor: '#f0f0f0',
  },
];

function StatusPill({ status }: { status: StatusBadge }) {
  const c = BRAND.colors.highlights.success;
  return (
    <span
      style={{
        alignSelf: 'flex-start',
        background: c.bg,
        color: c.text,
        fontSize: 12,
        fontWeight: BRAND.fontWeight.semibold,
        padding: '4px 10px',
        borderRadius: 999,
      }}
    >
      {status.label}
    </span>
  );
}

export default function SupportedDataSection() {
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
            SUPPORTED DATA TYPES
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            모든 종류의 데이터를 진단합니다
          </h2>
        </div>

        <Flex gap={24} align="stretch">
          {items.map(({ Icon, iconColor, title, desc, status, borderColor }) => (
            <div
              key={title}
              style={{
                flex: 1,
                background: '#fff',
                border: `1px solid ${borderColor}`,
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <StatusPill status={status} />
              <Icon size={32} color={iconColor} stroke={1.8} />
              <div
                style={{
                  fontSize: BRAND.fontSize.subtitleSmall,
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
                  lineHeight: 1.6,
                }}
              >
                {desc}
              </div>
            </div>
          ))}
        </Flex>
      </div>
    </section>
  );
}
