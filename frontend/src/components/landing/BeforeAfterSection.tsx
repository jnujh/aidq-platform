import { Flex } from 'antd';
import { IconArrowRight, IconTrendingUp } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';
import Donut from './Donut';

export default function BeforeAfterSection() {
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
            BEFORE & AFTER
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
            AI 개선만 적용하면, 이렇게 점수가 올라갑니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
            }}
          >
            실제 사례 · 동일 데이터 기준
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 16,
            padding: 32,
          }}
        >
          <Flex
            gap={24}
            align="center"
            justify="center"
            style={{ marginBottom: 24 }}
          >
            {/* BEFORE */}
            <div
              style={{
                flex: 1,
                background: BRAND.colors.surfaces.subtle,
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  color: '#999',
                  fontSize: 11,
                  fontWeight: BRAND.fontWeight.semibold,
                  letterSpacing: 0.5,
                }}
              >
                BEFORE
              </div>
              <Donut
                size={120}
                percent={57}
                trackColor={BRAND.colors.highlights.warning.bg}
                progressColor={BRAND.colors.highlights.warning.icon}
                strokeWidth={11}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.highlights.warning.icon,
                    lineHeight: 1,
                  }}
                >
                  57.2
                </div>
              </Donut>
              <span
                style={{
                  background: BRAND.colors.highlights.warning.bg,
                  color: BRAND.colors.highlights.warning.text,
                  fontSize: BRAND.fontSize.bodySmall,
                  fontWeight: BRAND.fontWeight.semibold,
                  padding: '4px 12px',
                  borderRadius: 999,
                }}
              >
                개선 필요
              </span>
            </div>

            {/* 화살표 */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: BRAND.colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <IconArrowRight size={22} color="#fff" stroke={2.2} />
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primary,
                }}
              >
                AI 개선
              </div>
            </div>

            {/* AFTER */}
            <div
              style={{
                flex: 1,
                background: '#fff',
                border: `2px solid ${BRAND.colors.primary}`,
                borderRadius: 14,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div
                style={{
                  color: BRAND.colors.primary,
                  fontSize: 11,
                  fontWeight: BRAND.fontWeight.semibold,
                  letterSpacing: 0.5,
                }}
              >
                AFTER
              </div>
              <Donut
                size={120}
                percent={87}
                trackColor={BRAND.colors.badges.purposeA.bg}
                progressColor={BRAND.colors.primary}
                strokeWidth={11}
              >
                <div
                  style={{
                    fontSize: 26,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.primaryDark,
                    lineHeight: 1,
                  }}
                >
                  87.5
                </div>
              </Donut>
              <span
                style={{
                  background: BRAND.colors.highlights.success.bg,
                  color: BRAND.colors.highlights.success.text,
                  fontSize: BRAND.fontSize.bodySmall,
                  fontWeight: BRAND.fontWeight.semibold,
                  padding: '4px 12px',
                  borderRadius: 999,
                }}
              >
                우수 등급
              </span>
            </div>
          </Flex>

          <div
            style={{
              background: BRAND.colors.highlights.success.bg,
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
            }}
          >
            <IconTrendingUp
              size={20}
              color={BRAND.colors.highlights.success.icon}
              stroke={2}
            />
            <span
              style={{
                fontSize: BRAND.fontSize.body,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.highlights.success.text,
              }}
            >
              총 +30.3점 상승 · 예상 F1 0.62 → 0.81
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
