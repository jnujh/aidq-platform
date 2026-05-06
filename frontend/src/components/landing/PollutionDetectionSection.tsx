import { Flex } from 'antd';
import {
  IconCircleDashed,
  IconCopy,
  IconAlertTriangle,
  IconTextSpellcheck,
  IconScaleOff,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

const pollutions = [
  { Icon: IconCircleDashed, title: '결측치', desc: '비어있는 값' },
  { Icon: IconCopy, title: '중복', desc: '반복되는 행' },
  { Icon: IconAlertTriangle, title: '값 오류', desc: '왜곡된 수치' },
  { Icon: IconTextSpellcheck, title: '표현 불일치', desc: '서울/SEOUL' },
  { Icon: IconScaleOff, title: '불균형', desc: '한쪽으로 쏠림' },
];

export default function PollutionDetectionSection() {
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
            POLLUTION DETECTION
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            5가지 데이터 오염을 자동 감지합니다
          </h2>
        </div>

        <Flex gap={16} align="stretch">
          {pollutions.map(({ Icon, title, desc }) => (
            <div
              key={title}
              style={{
                flex: 1,
                background: BRAND.colors.surfaces.subtle,
                borderRadius: 12,
                padding: 14,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 10,
                textAlign: 'center',
              }}
            >
              <Icon
                size={28}
                color={BRAND.colors.highlights.warning.icon}
                stroke={1.8}
              />
              <div
                style={{
                  fontSize: BRAND.fontSize.body,
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
