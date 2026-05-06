import { Flex } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { BRAND } from '../../config/brand';

type BadgeColor = { bg: string; text: string };

function PurposeBadge({ label, color }: { label: string; color: BadgeColor }) {
  return (
    <span
      style={{
        display: 'inline-block',
        background: color.bg,
        color: color.text,
        fontSize: BRAND.fontSize.bodySmall,
        fontWeight: BRAND.fontWeight.semibold,
        padding: '4px 12px',
        borderRadius: 999,
      }}
    >
      {label}
    </span>
  );
}

function HighlightBox({
  bg,
  textColor,
  iconColor,
  title,
  body,
}: {
  bg: string;
  textColor: string;
  iconColor: string;
  title: string;
  body: string;
}) {
  return (
    <div
      style={{
        background: bg,
        borderRadius: 12,
        padding: 16,
        display: 'flex',
        gap: 10,
      }}
    >
      <CheckCircleFilled
        style={{ color: iconColor, fontSize: 18, flexShrink: 0, marginTop: 2 }}
      />
      <div>
        <div
          style={{
            fontSize: BRAND.fontSize.body,
            fontWeight: BRAND.fontWeight.semibold,
            color: textColor,
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: BRAND.fontSize.bodySmall,
            color: textColor,
            lineHeight: 1.5,
          }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

function PurposeCard({
  badgeLabel,
  badgeColor,
  title,
  emojiRow,
  caption,
  highlight,
}: {
  badgeLabel: string;
  badgeColor: BadgeColor;
  title: string;
  emojiRow: React.ReactNode;
  caption: string;
  highlight: { bg: string; textColor: string; iconColor: string; title: string; body: string };
}) {
  return (
    <div
      style={{
        flex: 1,
        background: '#fff',
        borderRadius: 16,
        padding: 28,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <Flex align="center" gap={12}>
        <PurposeBadge label={badgeLabel} color={badgeColor} />
        <span
          style={{
            fontSize: BRAND.fontSize.subtitleSmall,
            fontWeight: BRAND.fontWeight.semibold,
            color: BRAND.colors.primaryDark,
          }}
        >
          {title}
        </span>
      </Flex>

      <div
        style={{
          background: '#fff',
          border: '1px solid #f0f0f0',
          borderRadius: 12,
          padding: '24px 16px',
          textAlign: 'center',
        }}
      >
        <div style={{ marginBottom: 12 }}>{emojiRow}</div>
        <div style={{ fontSize: BRAND.fontSize.body, color: '#555' }}>{caption}</div>
      </div>

      <HighlightBox {...highlight} />
    </div>
  );
}

export default function PurposeComparisonSection() {
  return (
    <section
      style={{
        padding: '80px 40px',
        background: BRAND.colors.surfaces.subtle,
      }}
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
            WHY PURPOSE MATTERS
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
            같은 과일 데이터, 목적이 다르면 평가도 달라요
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
            }}
          >
            데이터 품질의 정답은 하나가 아닙니다
          </p>
        </div>

        <Flex gap={24} align="stretch">
          <PurposeCard
            badgeLabel="목적 A"
            badgeColor={BRAND.colors.badges.purposeA}
            title="과일 종류 분류 모델"
            emojiRow={<span style={{ fontSize: 48, letterSpacing: 4 }}>🍎🍊🍌</span>}
            caption="사과 33% / 귤 33% / 바나나 34%"
            highlight={{
              bg: BRAND.colors.highlights.success.bg,
              textColor: BRAND.colors.highlights.success.text,
              iconColor: BRAND.colors.highlights.success.icon,
              title: '중요한 건: 종류 간 균형',
              body: '사과·귤·바나나가 비슷한 비율로 골고루 있는 게 좋습니다',
            }}
          />
          <PurposeCard
            badgeLabel="목적 B"
            badgeColor={BRAND.colors.badges.purposeB}
            title="사과 품질 판정 모델"
            emojiRow={
              <span
                style={{
                  fontSize: 48,
                  display: 'inline-flex',
                  gap: 8,
                  justifyContent: 'center',
                }}
              >
                <span style={{ opacity: 1.0 }}>🍎</span>
                <span style={{ opacity: 0.6 }}>🍎</span>
                <span style={{ opacity: 0.3 }}>🍎</span>
              </span>
            }
            caption="우수 / 보통 / 흠집"
            highlight={{
              bg: BRAND.colors.badges.purposeB.bg,
              textColor: BRAND.colors.badges.purposeB.text,
              iconColor: BRAND.colors.badges.purposeB.text,
              title: '중요한 건: 상태별 균형',
              body: '사과 안에서 흠집·등급별 분포가 골고루 있는 게 좋습니다',
            }}
          />
        </Flex>
      </div>
    </section>
  );
}
