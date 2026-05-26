import {
  IconChecks,
  IconShieldCheck,
  IconEqual,
  IconTarget,
  IconClock,
  IconFingerprint,
  IconChartPie,
  IconLink,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

const metrics = [
  { Icon: IconChecks, title: '완전성', desc: '결측치 비율' },
  { Icon: IconShieldCheck, title: '유효성', desc: '형식 일치도' },
  { Icon: IconEqual, title: '일관성', desc: '중복·충돌' },
  { Icon: IconTarget, title: '정확성', desc: '실제값 일치' },
  { Icon: IconClock, title: '최신성', desc: '업데이트 주기' },
  { Icon: IconFingerprint, title: '고유성', desc: '중복 없음' },
  { Icon: IconChartPie, title: '균형성', desc: '클래스 분포' },
  { Icon: IconLink, title: '관련성', desc: '목적 적합도' },
];

export default function MetricsSection() {
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
            METRICS
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            8가지 진단 지표
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
          }}
        >
          {metrics.map(({ Icon, title, desc }) => (
            <div
              key={title}
              style={{
                background: BRAND.colors.surfaces.subtle,
                borderRadius: 12,
                padding: 14,
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
    </section>
  );
}
