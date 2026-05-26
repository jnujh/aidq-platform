import { Flex } from 'antd';
import { BRAND } from '../../config/brand';
import ScoreDonut from '../charts/ScoreDonut';
import MetricBarList, { type MetricItem } from '../charts/MetricBarList';

const PREVIEW_METRICS: MetricItem[] = [
  { label: '클래스 균형', weight: '30%', score: 92, color: 'primary' },
  { label: '라벨 정확도', weight: '25%', score: 88, color: 'primary' },
  { label: '이미지 다양성', weight: '20%', score: 85, color: 'primary' },
  { label: '완전성', weight: '10%', score: 90, color: 'muted' },
  { label: '중복 제거', weight: '8%', score: 68, color: 'warning' },
];

export default function ResultPreviewSection() {
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
            RESULT PREVIEW
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            진단 결과는 이렇게 보입니다
          </h2>
        </div>

        <div
          style={{
            background: BRAND.colors.surfaces.subtle,
            borderRadius: 16,
            padding: 24,
          }}
        >
          <Flex gap={20} align="stretch">
            {/* 좌측: 총점 카드 */}
            <div
              style={{
                flex: 1,
                background: '#fff',
                borderRadius: 12,
                padding: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ScoreDonut score={85.2} caption="TOTAL SCORE" />
            </div>

            {/* 우측: 항목별 점수 */}
            <div
              style={{
                flex: 1.6,
                background: '#fff',
                borderRadius: 12,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <MetricBarList
                title="8개 항목별 점수"
                headerBadge={{ text: '분류 모델용' }}
                items={PREVIEW_METRICS}
              />
            </div>
          </Flex>
        </div>
      </div>
    </section>
  );
}
