import { Flex } from 'antd';
import {
  IconSparkles,
  IconReportAnalytics,
  IconTargetArrow,
  IconWand,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';
import jobsScreenshot from '../../assets/jobs.png';

const USAGES: Array<{
  Icon: typeof IconReportAnalytics;
  title: string;
  body: string;
}> = [
  {
    Icon: IconTargetArrow,
    title: '목적을 이해해서 가중치를 조정합니다',
    body: '분류·회귀·시계열 등 데이터의 쓰임새에 맞춰 8개 지표의 비중을 자동으로 다시 잡습니다.',
  },
  {
    Icon: IconReportAnalytics,
    title: 'RAG 기반 LLM 분석 리포트를 만듭니다',
    body: '점수·세부 지표·이상 패턴을 종합해 사람이 읽기 좋은 진단·개선 가이드를 자동 생성합니다.',
  },
  {
    Icon: IconWand,
    title: '개선 액션을 우선순위로 제안합니다',
    body: '결측·중복·이상치·라벨 불균형 등 발견한 문제를 영향이 큰 순서로 정리해 보여줍니다.',
  },
];

export default function AIAssistantSection() {
  return (
    <section style={{ padding: '80px 40px', background: '#fff' }}>
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
            AI ASSISTANT
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
            AI를 이렇게 활용합니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            데이터를 업로드하면 AI가 진단 결과를 리포트 형태로 풀어서 알려드립니다.
          </p>
        </div>

        <Flex gap={28} wrap="wrap" align="stretch">
          <div
            style={{
              flex: '1 1 480px',
              minWidth: 0,
              background: BRAND.colors.surfaces.subtle,
              border: '1px solid #E8EEF5',
              borderRadius: 16,
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <img
              src={jobsScreenshot}
              alt="작업 생성 화면 — 사용 목적 입력"
              style={{
                width: '100%',
                height: 'auto',
                borderRadius: 10,
                boxShadow: '0 10px 28px rgba(4, 44, 83, 0.12)',
                display: 'block',
              }}
            />
            <div
              style={{
                marginTop: 12,
                fontSize: 12,
                color: '#888',
                textAlign: 'center',
              }}
            >
            "사용 목적" 한 줄만 적으면 LLM이 가중치와 진단 기준을 자동 조정합니다
            </div>
          </div>

          <Flex
            vertical
            gap={14}
            style={{ flex: '1 1 380px', minWidth: 0 }}
          >
            {USAGES.map(({ Icon, title, body }) => (
              <div
                key={title}
                style={{
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 18,
                  display: 'flex',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: BRAND.colors.surfaces.cardBlue,
                    color: BRAND.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} stroke={2} />
                </div>
                <div>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.body,
                      fontWeight: BRAND.fontWeight.semibold,
                      color: BRAND.colors.primaryDark,
                      marginBottom: 4,
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.bodySmall,
                      color: '#555',
                      lineHeight: 1.6,
                    }}
                  >
                    {body}
                  </div>
                </div>
              </div>
            ))}

            <div
              style={{
                marginTop: 4,
                background: BRAND.colors.surfaces.cardBlue,
                borderRadius: 12,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <IconSparkles
                size={18}
                color={BRAND.colors.primary}
                stroke={2}
              />
              <span
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primaryDark,
                }}
              >
                RAG 기반 — 외부 지식과 결합한 맞춤 분석
              </span>
            </div>
          </Flex>
        </Flex>
      </div>
    </section>
  );
}
