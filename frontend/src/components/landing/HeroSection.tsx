import { Button, Flex } from 'antd';
import { BRAND } from '../../config/brand';
import resultImage from '../../assets/re1.png';

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
};

const stats = [
  { highlight: '8가지', label: '진단 지표' },
  { highlight: 'RAG 기반', label: '맞춤 추천' },
  { highlight: '자동', label: '개선 가이드' },
];

export default function HeroSection() {
  return (
    <section style={{ padding: '80px 48px', background: '#fff' }}>
      <Flex
        align="center"
        gap={64}
        style={{ maxWidth: 1280, margin: '0 auto' }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              borderRadius: 999,
              background: '#E8F1FB',
              color: BRAND.colors.primary,
              fontSize: BRAND.fontSize.bodySmall,
              fontWeight: BRAND.fontWeight.semibold,
              marginBottom: 24,
            }}
          >
            {BRAND.tagline}
          </div>

          <h1
            style={{
              fontSize: BRAND.fontSize.titleLarge,
              fontWeight: BRAND.fontWeight.semibold,
              color: '#111',
              lineHeight: 1.35,
              margin: 0,
              marginBottom: 20,
            }}
          >
            데이터의{' '}
            <span style={{ color: BRAND.colors.primary }}>"목적"</span>
            에 따라
            <br />
            기준이 달라집니다
          </h1>

          <p
            style={{
              fontSize: BRAND.fontSize.subtitle,
              fontWeight: BRAND.fontWeight.regular,
              color: '#555',
              lineHeight: 1.6,
              margin: 0,
              marginBottom: 36,
            }}
          >
            쓰임새에 따라 좋은 데이터의 기준이 다릅니다.
            <br />
            AI가 목적을 이해하고 가중치를 자동 조정해 진단합니다.
          </p>

          <Flex gap={12} style={{ marginBottom: 56 }}>
            <Button
              type="primary"
              onClick={() => scrollToId('service')}
              style={{
                background: BRAND.colors.primary,
                borderColor: BRAND.colors.primary,
                fontWeight: BRAND.fontWeight.semibold,
                fontSize: BRAND.fontSize.body,
                height: 52,
                paddingInline: 28,
                borderRadius: 8,
              }}
            >
              기능 둘러보기
            </Button>
            <Button
              onClick={() => scrollToId('preview')}
              style={{
                background: '#fff',
                fontWeight: BRAND.fontWeight.semibold,
                fontSize: BRAND.fontSize.body,
                height: 52,
                paddingInline: 28,
                borderRadius: 8,
              }}
            >
              결과 미리보기
            </Button>
          </Flex>

          <Flex gap={48}>
            {stats.map((s) => (
              <div key={s.label}>
                <div
                  style={{
                    fontSize: BRAND.fontSize.titleSmall,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.primaryDark,
                    lineHeight: 1.2,
                  }}
                >
                  {s.highlight}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    fontWeight: BRAND.fontWeight.regular,
                    color: '#666',
                    marginTop: 6,
                  }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </Flex>
        </div>

        <img
          src={resultImage}
          alt="진단 결과 미리보기"
          style={{
            flex: 1,
            minWidth: 0,
            width: '100%',
            aspectRatio: '4 / 3',
            objectFit: 'contain',
            borderRadius: 16,
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
          }}
        />
      </Flex>
    </section>
  );
}
