import { Flex } from 'antd';
import { BRAND } from '../../config/brand';

export type MetricColor =
  | 'primary'
  | 'warning'
  | 'muted'
  // Before/After 비교용. positive 는 증가(초록), negative 는 감소(빨강).
  | 'positive'
  | 'negative';

export type MetricItem = {
  label: string;
  score: number;
  // 가중치 라벨 (예: "30%"). 옵션.
  weight?: string;
  // 막대 색상. 미지정 시 'primary'.
  color?: MetricColor;
  // 점수 옆에 표시할 변화량 (예: "+7", "-3"). 비교 화면에서 사용.
  delta?: string;
};

type HeaderBadge = {
  text: string;
  bg?: string;
  color?: string;
};

type MetricBarListProps = {
  items: MetricItem[];
  title?: string;
  headerBadge?: HeaderBadge;
};

const COLOR_NEGATIVE = '#D24545';

function resolveFill(color: MetricColor): string {
  switch (color) {
    case 'warning':
      return BRAND.colors.highlights.warning.icon;
    case 'muted':
      return '#888';
    case 'positive':
      return BRAND.colors.highlights.success.icon;
    case 'negative':
      return COLOR_NEGATIVE;
    case 'primary':
    default:
      return BRAND.colors.primary;
  }
}

function resolveScoreColor(color: MetricColor): string {
  switch (color) {
    case 'warning':
      return BRAND.colors.highlights.warning.icon;
    case 'positive':
      return BRAND.colors.highlights.success.text;
    case 'negative':
      return COLOR_NEGATIVE;
    case 'muted':
    case 'primary':
    default:
      return BRAND.colors.primaryDark;
  }
}

export default function MetricBarList({
  items,
  title,
  headerBadge,
}: MetricBarListProps) {
  const hasHeader = !!title || !!headerBadge;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 18,
        width: '100%',
      }}
    >
      {hasHeader && (
        <Flex align="center" justify="space-between">
          {title && (
            <div
              style={{
                fontSize: BRAND.fontSize.subtitleSmall,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primaryDark,
              }}
            >
              {title}
            </div>
          )}
          {headerBadge && (
            <span
              style={{
                background: headerBadge.bg ?? BRAND.colors.badges.purposeA.bg,
                color: headerBadge.color ?? BRAND.colors.badges.purposeA.text,
                fontSize: 12,
                fontWeight: BRAND.fontWeight.semibold,
                padding: '4px 10px',
                borderRadius: 999,
              }}
            >
              {headerBadge.text}
            </span>
          )}
        </Flex>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {items.map((item) => {
          const color: MetricColor = item.color ?? 'primary';
          const clamped = Math.max(0, Math.min(100, item.score));
          return (
            <div key={item.label}>
              <Flex
                justify="space-between"
                align="center"
                style={{ marginBottom: 6 }}
              >
                <span
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#444',
                  }}
                >
                  {item.label}
                  {item.weight && (
                    <span style={{ color: '#999' }}> ({item.weight})</span>
                  )}
                </span>
                <span
                  style={{
                    fontSize: BRAND.fontSize.body,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: resolveScoreColor(color),
                  }}
                >
                  {Number.isInteger(item.score) ? item.score : item.score.toFixed(1)}
                  {item.delta && (
                    <span style={{ marginLeft: 6, fontSize: 12 }}>
                      ({item.delta})
                    </span>
                  )}
                </span>
              </Flex>
              <div
                style={{
                  height: 5,
                  background: BRAND.colors.surfaces.subtle,
                  borderRadius: 3,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${clamped}%`,
                    background: resolveFill(color),
                    borderRadius: 3,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
