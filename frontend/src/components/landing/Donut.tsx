type DonutProps = {
  size: number;
  percent: number;
  trackColor: string;
  progressColor: string;
  strokeWidth?: number;
  children?: React.ReactNode;
};

export default function Donut({
  size,
  percent,
  trackColor,
  progressColor,
  strokeWidth = 10,
  children,
}: DonutProps) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - percent / 100);

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'inline-block',
      }}
    >
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      {children && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
