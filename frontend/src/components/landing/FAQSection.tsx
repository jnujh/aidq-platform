import { useState } from 'react';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

const items = [
  {
    q: '진단에 얼마나 걸리나요?',
    a: '평균 30초 이내에 8개 항목 진단이 완료됩니다.',
  },
  {
    q: '업로드한 데이터는 안전한가요?',
    a: '업로드된 데이터는 진단 후 자동 삭제되며 외부에 공유되지 않습니다.',
  },
  {
    q: '어떤 파일 형식을 지원하나요?',
    a: '현재 CSV·Excel·JSON 등 주요 정형 데이터를 지원하며, 비정형 데이터도 함께 진단할 수 있습니다.',
  },
  {
    q: '개선까지 자동으로 적용되나요?',
    a: '원본 데이터는 그대로 두고, 개선이 적용된 새 버전을 별도로 받아볼 수 있습니다.',
  },
];

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number>(0);

  const handleToggle = (i: number) => {
    setOpenIdx(openIdx === i ? -1 : i);
  };

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
            FAQ
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            자주 묻는 질문
          </h2>
        </div>

        <div
          style={{
            maxWidth: 580,
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {items.map((it, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={it.q}
                style={{
                  background: isOpen ? BRAND.colors.surfaces.cardBlue : '#fff',
                  border: `1px solid ${
                    isOpen ? BRAND.colors.primary : '#e8eef5'
                  }`,
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => handleToggle(i)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '16px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span
                    style={{
                      fontSize: BRAND.fontSize.body,
                      fontWeight: BRAND.fontWeight.semibold,
                      color: BRAND.colors.primaryDark,
                    }}
                  >
                    {it.q}
                  </span>
                  {isOpen ? (
                    <IconMinus
                      size={20}
                      color={BRAND.colors.primary}
                      stroke={2.2}
                    />
                  ) : (
                    <IconPlus size={20} color="#888" stroke={2} />
                  )}
                </button>
                {isOpen && (
                  <div
                    style={{
                      padding: '0 18px 16px',
                      fontSize: BRAND.fontSize.bodySmall,
                      color: '#444',
                      lineHeight: 1.6,
                    }}
                  >
                    {it.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
