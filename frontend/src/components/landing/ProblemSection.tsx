import { Flex } from 'antd';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

const SYMPTOMS = [
  '결측·중복은 잡지만 "이게 학습에 쓸만한 수치인가"를 모른다',
  '품질 점수가 모델 성능을 예측한다는 보증이 없다',
  '데이터의 사용 목적(분류·회귀 등)이 평가에 반영되지 않는다',
  '개선 후 점수가 오른 게 진짜 효과인지 평가 기준이 바뀐 탓인지 헷갈린다',
];

type ToolRow = { feature: string; others: string; ours: string };

const TOOL_GAPS: ToolRow[] = [
  {
    feature: '사용 목적 인지',
    others: 'task-agnostic — 모든 데이터 동일 평가',
    ours: '분류·회귀·시계열 등 목적 기반 가중치 자동 분배',
  },
  {
    feature: 'ML 성능 연결',
    others: '품질 점수와 모델 성능의 상관 검증 없음',
    ours: 'DSC ↔ F1 Pearson r = 0.598 (n=435) 통계 입증',
  },
  {
    feature: '출처 인용',
    others: 'LLM 추측에 의존, 출처 명시 없음',
    ours: 'ISO/IEC 25012·5259 + Kaggle·논문 RAG 인용',
  },
  {
    feature: '개선 검증',
    others: '재진단 시 평가 기준이 매번 달라짐',
    ours: '동일 가중치 잠금으로 순수 개선 효과만 측정',
  },
];

export default function ProblemSection() {
  return (
    <section
      style={{
        padding: '56px 40px',
        background: BRAND.colors.neutral.surface,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div
            style={{
              color: BRAND.colors.inkSoft,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 2.5,
              marginBottom: 16,
              textTransform: 'uppercase',
            }}
          >
            The Problem
          </div>
          <h2
            style={{
              fontSize: 36,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.ink,
              margin: 0,
              marginBottom: 18,
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            "이 데이터, 학습시켜도 될까?"
          </h2>
          <p
            style={{
              fontSize: 16,
              color: BRAND.colors.inkMuted,
              margin: 0,
              lineHeight: 1.75,
              maxWidth: 680,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            ML은 garbage-in-garbage-out인데, 정작 <strong style={{ color: BRAND.colors.ink }}>학습 전에 데이터 품질을
            가늠할 도구</strong>는 없습니다.
            <br />
            기존 도구들은 결측·중복은 잡지만 그 데이터가 실제 ML 성능과
            어떻게 연결되는지 답하지 않습니다.
          </p>
        </div>

        <Flex gap={28} wrap="wrap" align="stretch" style={{ marginBottom: 64 }}>
          <div
            style={{
              flex: '1 1 380px',
              background: BRAND.colors.neutral.cardBg,
              border: `1px solid ${BRAND.colors.neutral.border}`,
              borderRadius: 12,
              padding: 36,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: BRAND.colors.inkSoft,
                fontWeight: BRAND.fontWeight.semibold,
                letterSpacing: 2,
                marginBottom: 14,
                textTransform: 'uppercase',
              }}
            >
              데이터 사이언티스트가 학습 전에 답하기 어려운 질문
            </div>
            <Flex vertical gap={18}>
              {SYMPTOMS.map((sym, idx) => (
                <Flex key={idx} gap={14} align="flex-start">
                  <div
                    style={{
                      flex: '0 0 auto',
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      background: BRAND.colors.neutral.surface,
                      color: BRAND.colors.inkMuted,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${BRAND.colors.neutral.border}`,
                    }}
                  >
                    <IconAlertCircle size={16} stroke={1.6} />
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: BRAND.colors.ink,
                      lineHeight: 1.7,
                      paddingTop: 4,
                    }}
                  >
                    {sym}
                  </div>
                </Flex>
              ))}
            </Flex>
          </div>

          <div
            style={{
              flex: '1 1 380px',
              padding: '36px 4px',
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: BRAND.colors.inkSoft,
                fontWeight: BRAND.fontWeight.semibold,
                letterSpacing: 2,
                marginBottom: 18,
                textTransform: 'uppercase',
              }}
            >
              왜 기존 도구로는 안 되나
            </div>
            <p
              style={{
                fontSize: 15,
                color: BRAND.colors.ink,
                lineHeight: 1.85,
                margin: 0,
                marginBottom: 16,
              }}
            >
              ydata-profiling이나 Great Expectations 같은 도구는 데이터 자체의 정합성은
              잘 보지만, <strong style={{ color: BRAND.colors.primary }}>사용 목적(분류·회귀 등 태스크)</strong>을
              알지 못합니다. 같은 결측 비율도 분류엔 치명적이고 트리 모델엔 무관할 수
              있는데, task-agnostic 점수는 그 차이를 못 잡습니다.
            </p>
            <p
              style={{
                fontSize: 15,
                color: BRAND.colors.inkMuted,
                lineHeight: 1.85,
                margin: 0,
              }}
            >
              더 본질적으로 — 그들의 점수가 실제 모델 성능과 통계적으로 연결된다는
              증거가 없습니다. "이 점수가 90점이면 모델이 잘 학습된다"를 보장할 수
              없습니다. 그래서 우리는 점수와 성능의 관계를 먼저 입증한 뒤,
              그 위에 진단을 올렸습니다.
            </p>
          </div>
        </Flex>

        <div
          style={{
            background: BRAND.colors.neutral.cardBg,
            border: `1px solid ${BRAND.colors.neutral.border}`,
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1.2fr 1.5fr 1.5fr',
              background: BRAND.colors.neutral.surface,
              padding: '18px 28px',
              borderBottom: `1px solid ${BRAND.colors.neutral.border}`,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.inkSoft,
              letterSpacing: 2,
              textTransform: 'uppercase',
            }}
          >
            <div>비교 항목</div>
            <div style={{ textAlign: 'center' }}>기존 데이터 품질 도구</div>
            <div style={{ textAlign: 'center' }}>Scorecard</div>
          </div>
          {TOOL_GAPS.map(({ feature, others, ours }, idx) => (
            <div
              key={feature}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.5fr 1.5fr',
                padding: '22px 28px',
                borderBottom:
                  idx === TOOL_GAPS.length - 1
                    ? 'none'
                    : `1px solid ${BRAND.colors.neutral.borderSoft}`,
                alignItems: 'flex-start',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 14,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.ink,
                  letterSpacing: '-0.01em',
                }}
              >
                {feature}
              </div>
              <div
                style={{
                  fontSize: 13,
                  color: BRAND.colors.inkMuted,
                  lineHeight: 1.7,
                  textAlign: 'center',
                }}
              >
                {others}
              </div>
              <div
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                  textAlign: 'center',
                }}
              >
                <IconCheck
                  size={16}
                  stroke={2}
                  style={{
                    color: BRAND.colors.primary,
                    flex: '0 0 auto',
                    marginTop: 4,
                  }}
                />
                <div
                  style={{
                    fontSize: 13,
                    color: BRAND.colors.ink,
                    lineHeight: 1.7,
                    fontWeight: BRAND.fontWeight.semibold,
                  }}
                >
                  {ours}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
