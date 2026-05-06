import { Flex } from 'antd';
import { IconStar } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

const testimonials = [
  {
    quote:
      '캡스톤 데이터셋이 왜 모델 성능이 안 나오는지 몰랐는데, 클래스 불균형이 원인이라고 정확히 짚어줬어요.',
    avatar: '김',
    avatarBg: BRAND.colors.primary,
    name: '김○○ 학생',
    role: 'AI 캡스톤 · 학부 4년',
  },
  {
    quote:
      '같은 데이터를 다른 목적으로 쓰면 평가가 달라진다는 게 직관적이에요. AI 입문자에게 강추.',
    avatar: '박',
    avatarBg: BRAND.colors.highlights.success.icon,
    name: '박○○ 연구원',
    role: '데이터 분석 · 5년',
  },
];

function StarRow() {
  return (
    <Flex gap={2}>
      {[0, 1, 2, 3, 4].map((i) => (
        <IconStar
          key={i}
          size={18}
          color={BRAND.colors.highlights.warning.icon}
          fill={BRAND.colors.highlights.warning.icon}
          stroke={1.5}
        />
      ))}
    </Flex>
  );
}

export default function TestimonialsSection() {
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
            TESTIMONIALS
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            사용자 이야기
          </h2>
        </div>

        <Flex gap={24} align="stretch">
          {testimonials.map((t) => (
            <div
              key={t.name}
              style={{
                flex: 1,
                background: BRAND.colors.surfaces.subtle,
                borderRadius: 16,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <StarRow />
              <p
                style={{
                  fontSize: BRAND.fontSize.body,
                  color: '#333',
                  lineHeight: 1.7,
                  margin: 0,
                  flex: 1,
                }}
              >
                {t.quote}
              </p>
              <div style={{ height: 1, background: '#e8eef5' }} />
              <Flex align="center" gap={12}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: t.avatarBg,
                    color: '#fff',
                    fontSize: BRAND.fontSize.body,
                    fontWeight: BRAND.fontWeight.semibold,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.bodySmall,
                      fontWeight: BRAND.fontWeight.semibold,
                      color: BRAND.colors.primaryDark,
                    }}
                  >
                    {t.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: '#888',
                      marginTop: 2,
                    }}
                  >
                    {t.role}
                  </div>
                </div>
              </Flex>
            </div>
          ))}
        </Flex>
      </div>
    </section>
  );
}
