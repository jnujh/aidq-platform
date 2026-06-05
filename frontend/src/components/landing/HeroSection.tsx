import { BRAND } from '../../config/brand';
import bgImage from '../../assets/background.png';

export default function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        overflow: 'hidden',
        padding: '128px 40px 112px',
        backgroundImage: `url(${bgImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* 가독성 보호용 다크 오버레이 (텍스트 영역만 살짝 어둡게) */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(8, 22, 48, 0.55) 0%, rgba(8, 22, 48, 0.7) 50%, rgba(8, 22, 48, 0.55) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          maxWidth: 880,
          margin: '0 auto',
          textAlign: 'center',
          zIndex: 1,
        }}
      >
        <h1
          style={{
            fontSize: 64,
            fontWeight: BRAND.fontWeight.semibold,
            color: '#FFFFFF',
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            margin: 0,
            marginBottom: 28,
            textShadow: '0 2px 24px rgba(0, 0, 0, 0.35)',
          }}
        >
          데이터의{' '}
          <span style={{ color: '#7AB6FF' }}>"목적"</span>에
          <br />
          따라 기준이 달라집니다
        </h1>

        <p
          style={{
            fontSize: 18,
            fontWeight: BRAND.fontWeight.regular,
            color: 'rgba(255, 255, 255, 0.82)',
            lineHeight: 1.65,
            margin: 0,
            maxWidth: 640,
            marginLeft: 'auto',
            marginRight: 'auto',
            textShadow: '0 2px 16px rgba(0, 0, 0, 0.3)',
          }}
        >
          쓰임새에 따라 좋은 데이터의 기준이 다릅니다. AI가 목적을 이해하고
          가중치를 자동 조정해 진단합니다.
        </p>
      </div>
    </section>
  );
}
