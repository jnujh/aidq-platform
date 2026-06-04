import { Flex } from 'antd';
import { CheckCircleFilled } from '@ant-design/icons';
import { BRAND } from '../../config/brand';

type TaskCard = {
  badge: string;
  badgeBg: string;
  badgeText: string;
  title: string;
  exampleTitle: string;
  exampleVisual: React.ReactNode;
  exampleCaption: string;
  keyMetrics: string[];
  highlightBg: string;
  highlightText: string;
  highlightIcon: string;
  highlightTitle: string;
  highlightBody: string;
};

const TASKS: TaskCard[] = [
  {
    badge: '분류',
    badgeBg: BRAND.colors.badges.purposeA.bg,
    badgeText: BRAND.colors.badges.purposeA.text,
    title: 'Classification',
    exampleTitle: '예: 동물 종류 분류',
    exampleVisual: (
      <span style={{ fontSize: 44, letterSpacing: 4 }}>🐶🐱🐰</span>
    ),
    exampleCaption: '개 · 고양이 · 토끼 카테고리로 라벨링',
    keyMetrics: ['라벨 일관성', '클래스 균형', '완전성'],
    highlightBg: BRAND.colors.highlights.success.bg,
    highlightText: BRAND.colors.highlights.success.text,
    highlightIcon: BRAND.colors.highlights.success.icon,
    highlightTitle: '중요한 건: 라벨의 신뢰성',
    highlightBody:
      '잘못 붙은 라벨이 있거나 한 클래스가 너무 많으면 모델이 편향됩니다',
  },
  {
    badge: '회귀',
    badgeBg: BRAND.colors.badges.purposeB.bg,
    badgeText: BRAND.colors.badges.purposeB.text,
    title: 'Regression',
    exampleTitle: '예: 집값 예측',
    exampleVisual: (
      <span
        style={{
          fontSize: 44,
          display: 'inline-flex',
          gap: 8,
          justifyContent: 'center',
          alignItems: 'flex-end',
        }}
      >
        <span style={{ fontSize: 28 }}>🏠</span>
        <span style={{ fontSize: 36 }}>🏠</span>
        <span style={{ fontSize: 44 }}>🏠</span>
        <span style={{ fontSize: 52 }}>🏠</span>
      </span>
    ),
    exampleCaption: '1억 · 2.5억 · 5억 · 9억 … 연속적 수치',
    keyMetrics: ['target_smoothness', '특성 상관', '이상치 비율'],
    highlightBg: BRAND.colors.badges.purposeB.bg,
    highlightText: BRAND.colors.badges.purposeB.text,
    highlightIcon: BRAND.colors.badges.purposeB.text,
    highlightTitle: '중요한 건: 목표값 분포',
    highlightBody:
      '값이 매끄럽게 분포되어 있어야 회귀 모델이 안정적으로 학습합니다',
  },
];

export default function TaskTypeSection() {
  return (
    <section
      style={{
        padding: '80px 40px',
        background: '#fff',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
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
            TASK-AWARE EVALUATION
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 10,
            }}
          >
            작업 종류에 따라 진단 방식이 달라집니다
          </h2>
          <p
            style={{ fontSize: BRAND.fontSize.body, color: '#666', margin: 0 }}
          >
            분류와 회귀는 중점을 두는 지표가 다릅니다
          </p>
        </div>

        <Flex gap={24} align="stretch" wrap="wrap">
          {TASKS.map((t) => (
            <div
              key={t.badge}
              style={{
                flex: '1 1 360px',
                minWidth: 0,
                background: BRAND.colors.surfaces.subtle,
                borderRadius: 16,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
              }}
            >
              <Flex align="center" gap={12}>
                <span
                  style={{
                    background: t.badgeBg,
                    color: t.badgeText,
                    fontSize: BRAND.fontSize.bodySmall,
                    fontWeight: BRAND.fontWeight.bold,
                    padding: '4px 12px',
                    borderRadius: 999,
                  }}
                >
                  {t.badge}
                </span>
                <span
                  style={{
                    fontSize: BRAND.fontSize.subtitleSmall,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.primaryDark,
                  }}
                >
                  {t.title}
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
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: '#888',
                    marginBottom: 12,
                    letterSpacing: 0.2,
                  }}
                >
                  {t.exampleTitle}
                </div>
                <div style={{ marginBottom: 10 }}>{t.exampleVisual}</div>
                <div style={{ fontSize: BRAND.fontSize.body, color: '#555' }}>
                  {t.exampleCaption}
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primary,
                    letterSpacing: 0.5,
                    marginBottom: 8,
                  }}
                >
                  핵심 지표
                </div>
                <Flex gap={8} wrap="wrap">
                  {t.keyMetrics.map((m) => (
                    <span
                      key={m}
                      style={{
                        background: '#fff',
                        border: '1px solid #E8EEF5',
                        color: '#444',
                        fontSize: BRAND.fontSize.bodySmall,
                        padding: '4px 10px',
                        borderRadius: 6,
                        fontFamily:
                          '"SF Mono","Menlo","Consolas","DM Mono",monospace',
                      }}
                    >
                      {m}
                    </span>
                  ))}
                </Flex>
              </div>

              <div
                style={{
                  background: t.highlightBg,
                  borderRadius: 12,
                  padding: 16,
                  display: 'flex',
                  gap: 10,
                }}
              >
                <CheckCircleFilled
                  style={{
                    color: t.highlightIcon,
                    fontSize: 18,
                    flexShrink: 0,
                    marginTop: 2,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.body,
                      fontWeight: BRAND.fontWeight.semibold,
                      color: t.highlightText,
                      marginBottom: 4,
                    }}
                  >
                    {t.highlightTitle}
                  </div>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.bodySmall,
                      color: t.highlightText,
                      lineHeight: 1.5,
                    }}
                  >
                    {t.highlightBody}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Flex>
      </div>
    </section>
  );
}
