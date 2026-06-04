import { Flex } from 'antd';
import {
  IconSearch,
  IconBook,
  IconBolt,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';
import googleImg from '../../assets/google1.png';
import kaggleImg from '../../assets/kaggle1.png';

const POINTS: Array<{ Icon: typeof IconSearch; title: string; body: string }> = [
  {
    Icon: IconSearch,
    title: 'RAG 검색으로 외부 지식을 가져옵니다',
    body: '내장 LLM 지식만 쓰지 않습니다. 데이터 품질 표준, 정제 기법, 비슷한 Kaggle 사례를 실시간으로 찾아서 답에 반영합니다.',
  },
  {
    Icon: IconBook,
    title: '신뢰할 수 있는 출처를 우선합니다',
    body: 'ISO/IEC 25012 정의, 결측/이상치 처리 모범 사례, Kaggle 우승 노트북에서 추출한 패턴을 임베딩해 검색합니다.',
  },
  {
    Icon: IconBolt,
    title: '최신성·구체성·재현성',
    body: '훈련 시점의 추측이 아니라 실제 문서에서 가져온 근거를 답에 함께 제시합니다.',
  },
];

export default function RagSearchSection() {
  return (
    <section
      style={{
        padding: '80px 40px',
        background: BRAND.colors.surfaces.subtle,
        flex: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <Flex gap={48} wrap="wrap" align="center">
          <div
            style={{
              flex: '1 1 420px',
              minWidth: 0,
              position: 'relative',
              height: 360,
            }}
            aria-hidden
          >
            <div
              style={{
                position: 'absolute',
                top: 30,
                left: 0,
                width: '70%',
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #E8EEF5',
                boxShadow: '0 14px 36px rgba(4, 44, 83, 0.14)',
                padding: 12,
                transform: 'rotate(-6deg)',
              }}
            >
              <img
                src={googleImg}
                alt="Google 검색 화면"
                style={{
                  width: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: 8,
                }}
              />
            </div>

            <div
              style={{
                position: 'absolute',
                top: 160,
                right: 0,
                width: '55%',
                background: '#fff',
                borderRadius: 14,
                border: '1px solid #E8EEF5',
                boxShadow: '0 14px 36px rgba(4, 44, 83, 0.14)',
                padding: '32px 28px',
                transform: 'rotate(7deg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 140,
              }}
            >
              <img
                src={kaggleImg}
                alt="Kaggle 로고"
                style={{
                  width: '85%',
                  height: 'auto',
                  display: 'block',
                }}
              />
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: 18,
                fontSize: 12,
                color: '#888',
                fontStyle: 'italic',
              }}
            >
              ※ 외부 검색 출처 예시 — 실제로는 임베딩된 내부 문서를 검색합니다
            </div>
          </div>

          <div style={{ flex: '1 1 420px', minWidth: 0 }}>
            <div
              style={{
                color: BRAND.colors.primary,
                fontSize: 11,
                fontWeight: BRAND.fontWeight.semibold,
                letterSpacing: 0.5,
                marginBottom: 12,
              }}
            >
              RAG-POWERED
            </div>
            <h2
              style={{
                fontSize: BRAND.fontSize.titleMedium,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primaryDark,
                margin: 0,
                marginBottom: 12,
                lineHeight: 1.25,
              }}
            >
              검색을 바탕으로 답합니다
            </h2>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#555',
                margin: 0,
                marginBottom: 24,
                lineHeight: 1.6,
              }}
            >
              LLM의 추측이 아니라, ISO 표준 문서·정제 기법·Kaggle 사례를 임베딩한 자체
              지식 베이스에서 관련 내용을 먼저 찾고 그 위에서 답을 만듭니다.
            </p>

            <Flex vertical gap={12}>
              {POINTS.map(({ Icon, title, body }) => (
                <div
                  key={title}
                  style={{
                    background: '#fff',
                    border: '1px solid #E8EEF5',
                    borderRadius: 12,
                    padding: 16,
                    display: 'flex',
                    gap: 12,
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
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
                        lineHeight: 1.5,
                      }}
                    >
                      {body}
                    </div>
                  </div>
                </div>
              ))}
            </Flex>
          </div>
        </Flex>
      </div>
    </section>
  );
}
