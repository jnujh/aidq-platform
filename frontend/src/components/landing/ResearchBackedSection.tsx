import { Flex } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { BRAND } from '../../config/brand';

const stats = [
  { value: '295', label: '학습 실험 횟수' },
  { value: '0.598', label: 'DSC↔F1 상관계수' },
  { value: '5/5', label: '유의 검증 통과' },
  { value: 'p<0.05', label: '통계적 유의' },
];

export default function ResearchBackedSection() {
  return (
    <section style={{ padding: '64px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              color: BRAND.colors.primary,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            RESEARCH-BACKED
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 8,
            }}
          >
            근거 있는 점수입니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
            }}
          >
            295회 ML 실험으로 검증된 데이터 품질 지표
          </p>
        </div>

        <Flex gap={16} style={{ marginBottom: 24 }}>
          {stats.map((s) => (
            <div
              key={s.label}
              style={{
                flex: 1,
                background: BRAND.colors.surfaces.cardBlue,
                borderRadius: 12,
                padding: 16,
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 24,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primaryDark,
                  marginBottom: 6,
                }}
              >
                {s.value}
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#555',
                }}
              >
                {s.label}
              </div>
            </div>
          ))}
        </Flex>

        <div
          style={{
            background: BRAND.colors.surfaces.subtle,
            borderRadius: 12,
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <ExperimentOutlined
            style={{
              fontSize: 20,
              color: BRAND.colors.primary,
              flexShrink: 0,
            }}
          />
          <span
            style={{
              fontSize: BRAND.fontSize.bodySmall,
              color: '#555',
              lineHeight: 1.6,
            }}
          >
            데이터 품질 점수와 모델 성능의 상관관계 입증. 3개 데이터셋에 5가지 오염을 4단계 강도로 주입해 5개 ML 모델로 검증했습니다.
          </span>
        </div>
      </div>
    </section>
  );
}
