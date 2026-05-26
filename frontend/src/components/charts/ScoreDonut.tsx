import { BRAND } from '../../config/brand';
import Donut from '../landing/Donut';

type ScoreDonutProps = {
  score: number;
  size?: number;
  // 강조 색상 (Before/After 비교 시 다른 색으로 구분 가능). 미지정 시 BRAND.primary.
  accentColor?: string;
  // 점수 기반 등급 라벨. 미지정 시 점수로 자동 결정.
  gradeLabel?: string;
  // 도넛 위에 표시할 부제 (예: "TOTAL SCORE", "BEFORE", "AFTER")
  caption?: string;
};

function autoGrade(score: number): { label: string; bg: string; text: string } {
  if (score >= 80) {
    return {
      label: '우수',
      bg: BRAND.colors.highlights.success.bg,
      text: BRAND.colors.highlights.success.text,
    };
  }
  if (score >= 60) {
    return {
      label: '보통',
      bg: BRAND.colors.badges.purposeA.bg,
      text: BRAND.colors.badges.purposeA.text,
    };
  }
  return {
    label: '주의',
    bg: BRAND.colors.highlights.warning.bg,
    text: BRAND.colors.highlights.warning.text,
  };
}

export default function ScoreDonut({
  score,
  size = 140,
  accentColor = BRAND.colors.primary,
  gradeLabel,
  caption,
}: ScoreDonutProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const grade = autoGrade(clamped);
  const displayLabel = gradeLabel ?? grade.label;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 14,
      }}
    >
      {caption && (
        <div
          style={{
            color: '#999',
            fontSize: 11,
            fontWeight: BRAND.fontWeight.semibold,
            letterSpacing: 0.5,
          }}
        >
          {caption}
        </div>
      )}

      <Donut
        size={size}
        percent={clamped}
        trackColor={BRAND.colors.badges.purposeA.bg}
        progressColor={accentColor}
        strokeWidth={12}
      >
        <div
          style={{
            fontSize: Math.round(size * 0.22),
            fontWeight: BRAND.fontWeight.semibold,
            color: BRAND.colors.primaryDark,
            lineHeight: 1,
          }}
        >
          {Number.isInteger(clamped) ? clamped : clamped.toFixed(1)}
        </div>
        <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>/ 100</div>
      </Donut>

      <span
        style={{
          background: grade.bg,
          color: grade.text,
          fontSize: BRAND.fontSize.bodySmall,
          fontWeight: BRAND.fontWeight.semibold,
          padding: '4px 14px',
          borderRadius: 999,
        }}
      >
        {displayLabel}
      </span>
    </div>
  );
}
