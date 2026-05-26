import { Flex } from 'antd';
import { IconFileSpreadsheet, IconSparkles } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

export default function PurposeInputSection() {
  return (
    <section
      style={{ padding: '80px 40px', background: BRAND.colors.surfaces.subtle }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
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
            PURPOSE INPUT
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            목적은 이렇게 입력하면 됩니다
          </h2>
        </div>

        <div
          style={{
            maxWidth: 540,
            margin: '0 auto',
            background: '#fff',
            border: '1px solid #f0f0f0',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          }}
        >
          <Flex align="center" gap={10}>
            <IconFileSpreadsheet
              size={20}
              color={BRAND.colors.highlights.success.icon}
              stroke={1.8}
            />
            <span
              style={{
                fontSize: BRAND.fontSize.bodySmall,
                color: '#555',
              }}
            >
              업로드됨:
            </span>
            <span
              style={{
                fontSize: BRAND.fontSize.body,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primaryDark,
              }}
            >
              fruits_dataset.csv
            </span>
            <span
              style={{
                marginLeft: 'auto',
                fontSize: 12,
                color: '#999',
              }}
            >
              2.4 MB · 1,250행
            </span>
          </Flex>

          <div style={{ height: 1, background: '#f0f0f0' }} />

          <div
            style={{
              fontSize: BRAND.fontSize.body,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
            }}
          >
            이 데이터를 어디에 사용하시나요?
          </div>

          <div
            style={{
              background: BRAND.colors.surfaces.subtle,
              border: '1px solid #f0f0f0',
              borderRadius: 10,
              padding: 14,
              fontSize: BRAND.fontSize.body,
              color: '#333',
              lineHeight: 1.6,
            }}
          >
            사과 사진을 보고 흠집이 있는지 자동 판별하는 AI 모델을 만들 거예요
          </div>

          <div
            style={{
              background: BRAND.colors.surfaces.cardBlue,
              borderRadius: 10,
              padding: 14,
              display: 'flex',
              gap: 10,
            }}
          >
            <IconSparkles
              size={20}
              color={BRAND.colors.primary}
              stroke={1.8}
              style={{ flexShrink: 0, marginTop: 2 }}
            />
            <div>
              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primary,
                  marginBottom: 4,
                }}
              >
                AI가 이렇게 이해했어요
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#333',
                  lineHeight: 1.6,
                }}
              >
                이미지 분류 모델 학습용 → 클래스별 균형, 라벨 정확도, 이미지 다양성이 핵심
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
