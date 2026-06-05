import { Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import { IconCheck } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

const POINTS = [
  'ISO/IEC 25012·5259 표준 7개 + Kaggle 데이터셋 분석 34개 + 정제 기법 8개 = 49개 문서 ChromaDB 임베딩',
  '답변에 "scikit-learn 가이드에 따르면", "Kaggle Telco 분석에서는"처럼 실제 도구·표준 이름으로 인용',
  '본문 인용된 모든 출처는 답변 하단 🔗 참고 자료 섹션에 collapsing 없이 자동 첨부',
];

export default function RagBriefSection() {
  const navigate = useNavigate();
  return (
    <section
      style={{
        padding: '56px 40px',
        background: BRAND.colors.neutral.page,
      }}
    >
      <div
        style={{
          maxWidth: 1080,
          margin: '0 auto',
          background: BRAND.colors.neutral.cardBg,
          border: `1px solid ${BRAND.colors.neutral.border}`,
          borderRadius: 12,
          padding: '48px 56px',
        }}
      >
        <Flex gap={48} wrap="wrap" align="flex-start">
          <div style={{ flex: '1 1 280px', minWidth: 260 }}>
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
              Our Differentiator
            </div>
            <h2
              style={{
                fontSize: 28,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.ink,
                margin: 0,
                marginBottom: 16,
                letterSpacing: '-0.02em',
                lineHeight: 1.3,
              }}
            >
              LLM 추측이 아니라
              <br />
              <span style={{ color: BRAND.colors.primary }}>실제 출처를 인용</span>
              합니다
            </h2>
            <p
              style={{
                fontSize: 15,
                color: BRAND.colors.inkMuted,
                margin: 0,
                lineHeight: 1.75,
                marginBottom: 24,
                wordBreak: 'keep-all',
              }}
            >
              RAG로 ISO 표준·논문·Kaggle 데이터셋 분석을
              답변 안에 직접 인용 — 다른 데이터 품질
              도구가 못 하는 부분입니다.
            </p>
            <span
              onClick={() => {
                navigate('/research/rag');
                window.scrollTo({ top: 0 });
              }}
              style={{
                fontSize: 13,
                color: BRAND.colors.primary,
                fontWeight: BRAND.fontWeight.semibold,
                cursor: 'pointer',
              }}
            >
              검색 기반 답변 자세히 보기 →
            </span>
          </div>

          <div style={{ flex: '1 1 360px', minWidth: 300 }}>
            <Flex vertical gap={18}>
              {POINTS.map((point, idx) => (
                <Flex key={idx} gap={14} align="flex-start">
                  <div
                    style={{
                      flex: '0 0 auto',
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: BRAND.colors.neutral.surface,
                      color: BRAND.colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: `1px solid ${BRAND.colors.neutral.border}`,
                      marginTop: 3,
                    }}
                  >
                    <IconCheck size={13} stroke={2.4} />
                  </div>
                  <div
                    style={{
                      fontSize: 14,
                      color: BRAND.colors.ink,
                      lineHeight: 1.7,
                    }}
                  >
                    {point}
                  </div>
                </Flex>
              ))}
            </Flex>
          </div>
        </Flex>
      </div>
    </section>
  );
}
