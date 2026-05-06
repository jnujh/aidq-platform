import { Flex } from 'antd';
import {
  IconUpload,
  IconMessageChatbot,
  IconAdjustments,
  IconSearch,
  IconWand,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

type Step = {
  Icon: typeof IconUpload;
  title: string;
  desc: string;
  number?: string;
  isCore?: boolean;
};

const steps: Step[] = [
  { Icon: IconUpload, title: '업로드', desc: 'CSV·텍스트 자유', number: '01' },
  { Icon: IconMessageChatbot, title: '목적 입력', desc: '자연어로 입력', isCore: true },
  { Icon: IconAdjustments, title: '가중치 조정', desc: 'RAG로 자동', number: '03' },
  { Icon: IconSearch, title: '진단', desc: '8개 지표 산출', number: '04' },
  { Icon: IconWand, title: '개선', desc: '맞춤 개선안', number: '05' },
];

export default function HowItWorksSection() {
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
            HOW IT WORKS
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            5단계로 끝나는 맞춤형 진단
          </h2>
        </div>

        <Flex gap={16} align="stretch">
          {steps.map(({ Icon, title, desc, number, isCore }) => (
            <div
              key={title}
              style={{
                flex: 1,
                position: 'relative',
                background: '#fff',
                border: isCore
                  ? `2px solid ${BRAND.colors.primary}`
                  : '1px solid #f0f0f0',
                borderRadius: 12,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: 12,
                  right: 14,
                }}
              >
                {isCore ? (
                  <span
                    style={{
                      background: BRAND.colors.badges.purposeA.bg,
                      color: BRAND.colors.badges.purposeA.text,
                      fontSize: 10,
                      fontWeight: BRAND.fontWeight.semibold,
                      padding: '3px 8px',
                      borderRadius: 999,
                      letterSpacing: 0.5,
                    }}
                  >
                    CORE
                  </span>
                ) : (
                  <span
                    style={{
                      color: '#999',
                      fontSize: 12,
                      fontWeight: BRAND.fontWeight.semibold,
                    }}
                  >
                    {number}
                  </span>
                )}
              </div>

              <Icon size={28} color={BRAND.colors.primary} stroke={1.8} />
              <div
                style={{
                  fontSize: BRAND.fontSize.subtitleSmall,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primaryDark,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#555',
                }}
              >
                {desc}
              </div>
            </div>
          ))}
        </Flex>
      </div>
    </section>
  );
}
