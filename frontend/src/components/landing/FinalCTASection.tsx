import { BRAND } from '../../config/brand';

export default function FinalCTASection() {
  return (
    <section
      style={{
        padding: '40px 40px',
        background: BRAND.colors.primaryDark,
        textAlign: 'center',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <h2
          style={{
            fontSize: 28,
            fontWeight: BRAND.fontWeight.semibold,
            color: '#fff',
            margin: 0,
            marginBottom: 10,
          }}
        >
          목적에 딱 맞는 진단을 받아보세요
        </h2>
        <p
          style={{
            fontSize: BRAND.fontSize.body,
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0,
            marginBottom: 24,
          }}
        >
          회원가입 후 무료로 시작할 수 있습니다
        </p>
        <button
          type="button"
          style={{
            background: '#fff',
            color: '#111',
            border: 'none',
            fontSize: BRAND.fontSize.body,
            fontWeight: BRAND.fontWeight.semibold,
            padding: '12px 24px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          무료로 시작하기 →
        </button>
      </div>
    </section>
  );
}
