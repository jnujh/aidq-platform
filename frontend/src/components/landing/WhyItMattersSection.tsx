import { Flex } from 'antd';
import { BRAND } from '../../config/brand';
import meetingImg from '../../assets/meeting.png';

export default function WhyItMattersSection() {
  return (
    <section
      style={{
        padding: '48px 40px',
        background: BRAND.colors.neutral.page,
      }}
    >
      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
        }}
      >
        <Flex gap={56} wrap="wrap" align="center">
          <div
            style={{
              flex: '1.4 1 520px',
              minWidth: 320,
              borderRadius: 12,
              overflow: 'hidden',
              border: `1px solid ${BRAND.colors.neutral.border}`,
              background: BRAND.colors.neutral.surface,
            }}
          >
            <img
              src={meetingImg}
              alt="비즈니스 의사결정 회의"
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                objectFit: 'cover',
              }}
            />
          </div>

          <div
            style={{
              flex: '1 1 380px',
              minWidth: 280,
              wordBreak: 'keep-all',
            }}
          >
            <div
              style={{
                color: BRAND.colors.inkSoft,
                fontSize: 11,
                fontWeight: BRAND.fontWeight.semibold,
                letterSpacing: 2.5,
                marginBottom: 20,
                textTransform: 'uppercase',
              }}
            >
              Why It Matters
            </div>
            <h2
              style={{
                fontSize: 32,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.ink,
                margin: 0,
                marginBottom: 24,
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
              }}
            >
              AI 도입 결정에서
              <br />
              가장 먼저 답해야 할 질문은
              <br />
              <span style={{ color: BRAND.colors.primary }}>모델이 아니라 데이터</span>
              입니다
            </h2>
            <p
              style={{
                fontSize: 16,
                color: BRAND.colors.inkMuted,
                margin: 0,
                marginBottom: 18,
                lineHeight: 1.8,
              }}
            >
              잘 만든 모델도
              <br />
              흔들리는 데이터 위에서는 신뢰할 수 없습니다.
              <br />
              데이터 품질이 곧 모델 신뢰도이고,
              <br />
              모델 신뢰도가 곧 비즈니스 신뢰도입니다.
            </p>
            <p
              style={{
                fontSize: 14,
                color: BRAND.colors.inkSoft,
                margin: 0,
                lineHeight: 1.8,
                fontStyle: 'italic',
              }}
            >
              학습 전에 데이터부터 점검하세요.
              <br />
              그래야 모델·예산·일정에 대한 모든 결정이
              <br />
              같은 기반 위에 섭니다.
            </p>
          </div>
        </Flex>
      </div>
    </section>
  );
}
