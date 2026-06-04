import { Flex } from 'antd';
import {
  IconSparkles,
  IconReportAnalytics,
  IconTargetArrow,
  IconWand,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';
import structureImg from '../../assets/structure.png';
import imgImg from '../../assets/img.png';
import textImg from '../../assets/text.png';

const DATA_TYPES: Array<{
  src: string;
  title: string;
  desc: string;
}> = [
  {
    src: structureImg,
    title: '정형 데이터',
    desc: 'CSV · 엑셀 · JSON · DB 테이블',
  },
  {
    src: imgImg,
    title: '이미지 데이터',
    desc: '이미지 폴더 · ZIP (분류 작업용)',
  },
  {
    src: textImg,
    title: '텍스트 데이터',
    desc: '문서 · 로그 · 뉴스·리뷰 (분류·회귀)',
  },
];

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
    body: '점수·세부 지표·이상 패턴을 종합해 사람이 읽기 좋은 진단·재진단 가이드를 자동 생성합니다.',
  },
  {
    Icon: IconWand,
    title: '재진단 액션을 우선순위로 제안합니다',
    body: '결측·중복·이상치·라벨 불균형 등 발견한 문제를 영향이 큰 순서로 정리해 보여줍니다.',
  },
];

export default function AIAssistantSection() {
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
            데이터 종류에 따라 입력 화면이 달라지고, 그에 맞춰 AI가 진단 결과를 풀어서 알려드립니다.
          </p>
        </div>

        <Flex gap={20} wrap="wrap" align="stretch" style={{ marginBottom: 28 }}>
          {DATA_TYPES.map(({ src, title, desc }) => (
            <div
              key={title}
              style={{
                flex: '1 1 280px',
                minWidth: 0,
                background: BRAND.colors.surfaces.subtle,
                border: '1px solid #E8EEF5',
                borderRadius: 16,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  background: '#fff',
                  borderRadius: 10,
                  padding: 10,
                  boxShadow: '0 6px 16px rgba(4, 44, 83, 0.08)',
                  aspectRatio: '1 / 1.1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src={src}
                  alt={`${title} 업로드 화면`}
                  style={{
                    width: '100%',
                    maxHeight: '100%',
                    display: 'block',
                    borderRadius: 6,
                    objectFit: 'contain',
                  }}
                />
              </div>
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
                  lineHeight: 1.5,
                }}
              >
                {desc}
              </div>
            </div>
          ))}
        </Flex>

        <Flex gap={16} wrap="wrap" align="stretch">
          {USAGES.map(({ Icon, title, body }) => (
            <div
              key={title}
              style={{
                flex: '1 1 280px',
                minWidth: 0,
                background: '#fff',
                border: '1px solid #E8EEF5',
                borderRadius: 14,
                padding: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: BRAND.colors.surfaces.cardBlue,
                  color: BRAND.colors.primary,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={20} stroke={2} />
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.body,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primaryDark,
                  lineHeight: 1.3,
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#555',
                  lineHeight: 1.55,
                }}
              >
                {body}
              </div>
            </div>
          ))}
        </Flex>

        <div
          style={{
            marginTop: 20,
            background: BRAND.colors.surfaces.cardBlue,
            borderRadius: 12,
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
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
      </div>
    </section>
  );
}
