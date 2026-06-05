import { Flex } from 'antd';
import { IconTargetArrow, IconBook, IconRecycle } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';
import gradeChart from '../../assets/research/chart4_grade_boxplot.png';

const POINTS = [
  {
    Icon: IconTargetArrow,
    title: '사용 목적을 인지합니다',
    body: 'LLM이 데이터 쓰임새(분류·회귀·시계열 등)에 맞춰 8개 지표의 가중치를 자동 분배. 일률적 점수가 아닌 맞춤 평가.',
  },
  {
    Icon: IconBook,
    title: '학술 표준 근거로 인용합니다',
    body: 'ISO/IEC 25012·5259, Northcutt 2021, Budach 2022 등 권위 출처를 RAG로 검색해 답변에 실제 인용.',
  },
  {
    Icon: IconRecycle,
    title: '재진단으로 개선을 검증합니다',
    body: '동일 가중치 잠금 상태로 재진단해 점수 상승이 평가 기준이 아닌 데이터 품질 향상에서 옴을 보장.',
  },
];

export default function DefinitionSection() {
  return (
    <section style={{ padding: '56px 40px', background: BRAND.colors.neutral.page }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
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
            What is AI-Ready Data Quality
          </div>
          <h2
            style={{
              fontSize: 36,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.ink,
              margin: 0,
              marginBottom: 18,
              lineHeight: 1.25,
              letterSpacing: '-0.02em',
            }}
          >
            "데이터가 깨끗하다"가 아니라{' '}
            <span style={{ color: BRAND.colors.primary }}>
              "이 모델로 쓸 만한가"
            </span>{' '}
            입니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#5A6678',
              margin: 0,
              lineHeight: 1.7,
              maxWidth: 780,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            결측이 없는 데이터도 ML 학습엔 무용할 수 있고, 결측이 있는 데이터가 더 효과적일 수도 있습니다.
            <br />
            ML 데이터 품질은 <strong style={{ color: BRAND.colors.ink }}>사용 목적</strong>과 분리해서 평가할 수 없습니다.
          </p>
        </div>

        <Flex gap={24} wrap="wrap" align="stretch" style={{ marginBottom: 64 }}>
          {POINTS.map(({ Icon, title, body }, idx) => (
            <div
              key={title}
              style={{
                flex: '1 1 280px',
                background: BRAND.colors.neutral.cardBg,
                border: `1px solid ${BRAND.colors.neutral.border}`,
                borderRadius: 12,
                padding: 32,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              <Flex align="center" gap={14}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: BRAND.colors.neutral.surface,
                    color: BRAND.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: `1px solid ${BRAND.colors.neutral.border}`,
                  }}
                >
                  <Icon size={22} stroke={1.6} />
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: BRAND.colors.inkSoft,
                    fontWeight: BRAND.fontWeight.semibold,
                    letterSpacing: 2,
                  }}
                >
                  {String(idx + 1).padStart(2, '0')} / 03
                </div>
              </Flex>
              <div
                style={{
                  fontSize: 18,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.ink,
                  lineHeight: 1.4,
                  letterSpacing: '-0.01em',
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: 14,
                  color: BRAND.colors.inkMuted,
                  lineHeight: 1.75,
                }}
              >
                {body}
              </div>
            </div>
          ))}
        </Flex>

        <div
          style={{
            background: BRAND.colors.neutral.surface,
            borderLeft: `3px solid ${BRAND.colors.primary}`,
            padding: '24px 32px',
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 10,
              color: BRAND.colors.inkSoft,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 2.5,
              marginBottom: 10,
              textTransform: 'uppercase',
            }}
          >
            Key insight
          </div>
          <div
            style={{
              fontSize: 18,
              fontWeight: BRAND.fontWeight.regular,
              color: BRAND.colors.ink,
              lineHeight: 1.6,
              letterSpacing: '-0.01em',
            }}
          >
            데이터 품질 점수는 모델 성능을 결정합니다 —
            <br />
            <span style={{ color: BRAND.colors.inkMuted, fontSize: 14, letterSpacing: 0 }}>
              DSC와 F1 macro 간 Pearson r = 0.598 (p {'<'} 0.001, n = 435)
            </span>
          </div>
        </div>

        {/* 산점도 + 해설 2열 — Key Insight를 시각/언어로 동시에 증명 */}
        <Flex gap={24} wrap="wrap" align="stretch">
          {/* 좌측: 산점도 카드 */}
          <div
            style={{
              flex: '1.4 1 460px',
              minWidth: 320,
              background: BRAND.colors.neutral.cardBg,
              border: `1px solid ${BRAND.colors.neutral.border}`,
              borderRadius: 12,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                padding: '16px 24px',
                borderBottom: `1px solid ${BRAND.colors.neutral.borderSoft}`,
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 6,
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
                DSC 등급별 모델 성능(F1-score) 분포
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: BRAND.colors.inkSoft,
                  letterSpacing: 0.4,
                }}
              >
                5종 모델 × 3개 데이터셋 · n = 435
              </div>
            </div>
            <div style={{ position: 'relative', flex: 1 }}>
              <img
                src={gradeChart}
                alt="DSC 등급별 F1-score 박스플롯 — A등급 μ=0.883 / D등급 μ=0.520"
                style={{
                  width: '100%',
                  display: 'block',
                }}
              />
              {/* 깨진 영문/한글 혼합 타이틀(이미지 상단) 흰색 띠로 가림 */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '6.5%',
                  background: BRAND.colors.neutral.cardBg,
                }}
              />
            </div>
          </div>

          {/* 우측: 차트 해설 — 인과 방향(데이터 품질 → 모델 성능) 강조 */}
          <div
            style={{
              flex: '1 1 300px',
              minWidth: 280,
              background: BRAND.colors.neutral.cardBg,
              border: `1px solid ${BRAND.colors.neutral.border}`,
              borderRadius: 12,
              padding: '28px 30px',
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              wordBreak: 'keep-all',
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: BRAND.colors.inkSoft,
                fontWeight: BRAND.fontWeight.semibold,
                letterSpacing: 2.5,
                textTransform: 'uppercase',
              }}
            >
              How to read it
            </div>
            <div
              style={{
                fontSize: 20,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.ink,
                lineHeight: 1.35,
                letterSpacing: '-0.01em',
              }}
            >
              데이터 품질이 좋을수록
              <br />
              모델 성능도 함께 올라갑니다
            </div>
            <Flex vertical gap={14}>
              {[
                {
                  k: 'A 등급 데이터',
                  v: 'F1 평균 0.883 — 같은 모델도 최고 성능을 냅니다.',
                },
                {
                  k: 'D 등급 데이터',
                  v: 'F1 평균 0.520 — 알고리즘 튜닝으로는 못 메꿉니다.',
                },
                {
                  k: 'Δ +0.363',
                  v: '데이터 품질 한 등급의 차이가 모델 성능 차이로 그대로 나타납니다.',
                },
              ].map(({ k, v }) => (
                <div key={k}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: BRAND.fontWeight.semibold,
                      color: BRAND.colors.primary,
                      marginBottom: 4,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    {k}
                  </div>
                  <div
                    style={{
                      fontSize: 13,
                      color: BRAND.colors.inkMuted,
                      lineHeight: 1.65,
                    }}
                  >
                    {v}
                  </div>
                </div>
              ))}
            </Flex>
            <div
              style={{
                marginTop: 'auto',
                paddingTop: 16,
                borderTop: `1px solid ${BRAND.colors.neutral.borderSoft}`,
                fontSize: 12,
                color: BRAND.colors.inkSoft,
                lineHeight: 1.65,
                fontStyle: 'italic',
              }}
            >
              "Garbage in, garbage out" — 데이터 품질이
              <br />
              먼저 좋아져야 모델 성능이 따라옵니다.
            </div>
          </div>
        </Flex>
      </div>
    </section>
  );
}
