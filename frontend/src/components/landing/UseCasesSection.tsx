import { Flex } from 'antd';
import { IconBrain, IconBuildingBank, IconSchool } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

const cases = [
  {
    Icon: IconBrain,
    title: 'AI 모델 학습',
    desc: '학습용 데이터셋의 클래스 균형, 라벨 정확도를 사전 점검합니다',
    badge: '캡스톤 적용',
  },
  {
    Icon: IconBuildingBank,
    title: '공공·연구 데이터',
    desc: '개방 전 데이터의 품질 표준 충족 여부를 자동 확인합니다',
    badge: '기관 적용 가능',
  },
  {
    Icon: IconSchool,
    title: '학술·졸업 프로젝트',
    desc: '논문·캡스톤용 데이터셋의 신뢰도를 검증합니다',
    badge: '학생 친화적',
  },
];

export default function UseCasesSection() {
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
            USE CASES
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
            어떻게 쓰이고 있나요?
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
            }}
          >
            실제 적용 사례를 소개합니다
          </p>
        </div>

        <Flex gap={24} align="stretch">
          {cases.map(({ Icon, title, desc, badge }) => (
            <div
              key={title}
              style={{
                flex: 1,
                background: BRAND.colors.surfaces.subtle,
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <Icon size={32} color={BRAND.colors.primary} stroke={1.8} />
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
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {desc}
              </div>
              <span
                style={{
                  alignSelf: 'flex-start',
                  background: BRAND.colors.badges.purposeA.bg,
                  color: BRAND.colors.badges.purposeA.text,
                  fontSize: 12,
                  fontWeight: BRAND.fontWeight.semibold,
                  padding: '4px 10px',
                  borderRadius: 999,
                }}
              >
                {badge}
              </span>
            </div>
          ))}
        </Flex>
      </div>
    </section>
  );
}
