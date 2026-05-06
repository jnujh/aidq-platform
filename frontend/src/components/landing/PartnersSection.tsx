import { Flex } from 'antd';
import { BRAND } from '../../config/brand';

const partners = ['로고 1', '로고 2', '로고 3', '로고 4', '로고 5'];

export default function PartnersSection() {
  return (
    <section
      style={{
        padding: '32px 40px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div
          style={{
            color: '#999',
            fontSize: 12,
            fontWeight: BRAND.fontWeight.semibold,
            letterSpacing: 0.5,
            marginBottom: 20,
          }}
        >
          PARTNER · TRUSTED BY
        </div>
        <Flex gap={16}>
          {partners.map((p) => (
            <div
              key={p}
              style={{
                flex: 1,
                height: 56,
                background: BRAND.colors.surfaces.subtle,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#888',
                fontSize: BRAND.fontSize.body,
                fontWeight: BRAND.fontWeight.semibold,
              }}
            >
              {p}
            </div>
          ))}
        </Flex>
      </div>
    </section>
  );
}
