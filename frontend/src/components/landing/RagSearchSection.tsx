import { Flex } from 'antd';
import {
  IconSearch,
  IconBook,
  IconBolt,
  IconDatabase,
  IconQuote,
  IconShieldCheck,
  IconAlertCircle,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';
import googleImg from '../../assets/google1.png';
import kaggleImg from '../../assets/kaggle1.png';
import citationImg from '../../assets/개선가이드리얼2.png';

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

type PipelineStep = { num: string; title: string; body: string };

const PIPELINE: PipelineStep[] = [
  {
    num: '01',
    title: '질문 임베딩',
    body: '사용자 목적·진단 결과를 sentence-transformers(all-MiniLM-L6-v2)로 384차원 벡터화. 한·영 모두 처리.',
  },
  {
    num: '02',
    title: 'ChromaDB 검색',
    body: '49개 문서 임베딩에서 cosine 유사도 top-5를 즉시 회수. 메타데이터(modality·section)로 필터링.',
  },
  {
    num: '03',
    title: '프롬프트 조합',
    body: '검색 결과를 LLM 프롬프트에 [Source: ...] 헤더와 함께 주입. 도메인 룰("실제 도구·기관 이름으로 인용") 강제.',
  },
  {
    num: '04',
    title: 'Claude 생성',
    body: 'Claude Haiku 4.5가 검색 결과만 근거로 한국어 답변 생성. 출처 없는 추측은 자제하도록 프롬프트에 명시.',
  },
];

type DocCategory = {
  Icon: typeof IconBook;
  category: string;
  englishKey: string;
  count: number;
  examples: string[];
  desc: string;
};

const DOC_CATEGORIES: DocCategory[] = [
  {
    Icon: IconShieldCheck,
    category: '표준·정의',
    englishKey: 'definitions/',
    count: 7,
    examples: [
      'ISO/IEC 25012 데이터 품질 차원',
      'ISO/IEC 5259-1~4 AI·ML 데이터 품질',
      'Google Rules of ML (Zinkevich)',
      'Confident Learning · cleanlab',
      'Data-Centric AI 원칙',
    ],
    desc: '품질 정의·임계값·이론 근거. 가중치 추천 시 우선 인용.',
  },
  {
    Icon: IconDatabase,
    category: 'Kaggle 데이터셋 분석',
    englishKey: 'kaggle/',
    count: 34,
    examples: [
      'Telco Customer Churn · Credit Card Fraud',
      'House Prices · Medical Cost · Bike Sharing',
      'Titanic · Bank Marketing · MovieLens',
      'CIFAR-10/100 · MNIST · Fashion MNIST',
      'IMDB · AG News · 20 Newsgroups · TREC',
    ],
    desc: '도메인별 정답 데이터 패턴. "유사 데이터셋은 어디서 점수가 깎였나" 사례 제공.',
  },
  {
    Icon: IconBolt,
    category: '정제 기법',
    englishKey: 'techniques/',
    count: 8,
    examples: [
      'sklearn KNNImputer · IterativeImputer (결측)',
      'IsolationForest · winsorize (이상치)',
      'imblearn SMOTE · ADASYN (클래스 불균형)',
      'pandas drop_duplicates · GroupKFold',
      'RobustScaler · log/sqrt 변환',
    ],
    desc: '구체적인 도구·라이브러리·코드 패턴. 개선 가이드의 "어떻게" 부분 근거.',
  },
];

type CitationRule = {
  Icon: typeof IconShieldCheck;
  rule: string;
  good: string;
  bad: string;
};

const CITATION_RULES: CitationRule[] = [
  {
    Icon: IconShieldCheck,
    rule: '실제 도구·표준·기관 이름 사용',
    good: '"scikit-learn 가이드에 따르면", "ISO/IEC 25012 표준이 정의한", "Kaggle Telco 분석에서는"',
    bad: '"문서 3에 따르면", "참고 자료의 ~", "관련 자료에서는"',
  },
  {
    Icon: IconAlertCircle,
    rule: '출처 없으면 지어내지 않음',
    good: '전문가 권고로 자연스럽게 서술 (출처 표기 없음)',
    bad: '존재하지 않는 데이터셋·논문·통계 수치 환각',
  },
  {
    Icon: IconQuote,
    rule: '한글 조사 호환 평문 강조',
    good: '"클래스 균형이 떨어집니다"',
    bad: '`**클래스 균형**의` → 별표 노출 깨짐 (CommonMark 한글 조사 버그)',
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

            <Flex vertical gap={12} className="rag-points-list">
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

        {/* ── 1. RAG 파이프라인 4단계 ── */}
        <div style={{ marginTop: 72 }}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primary,
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              RAG PIPELINE
            </div>
            <h3
              style={{
                fontSize: BRAND.fontSize.titleSmall,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primaryDark,
                margin: 0,
                marginBottom: 8,
              }}
            >
              질문이 답변이 되기까지 4단계
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#5A6678',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              임베딩 → 벡터 검색 → 프롬프트 조합 → 생성. 각 단계의 정확한 도구·모델까지 공개합니다.
            </p>
          </div>
          <Flex gap={14} wrap="wrap" align="stretch">
            {PIPELINE.map(({ num, title, body }) => (
              <div
                key={num}
                style={{
                  flex: '1 1 230px',
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 20,
                  position: 'relative',
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: BRAND.fontWeight.black,
                    color: BRAND.colors.primary,
                    opacity: 0.8,
                    lineHeight: 1,
                    marginBottom: 10,
                    fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.body,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primaryDark,
                    marginBottom: 8,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#5A6678',
                    lineHeight: 1.7,
                  }}
                >
                  {body}
                </div>
              </div>
            ))}
          </Flex>
        </div>

        {/* ── 2. 인덱싱된 문서 통계 ── */}
        <div style={{ marginTop: 72 }}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primary,
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              KNOWLEDGE BASE
            </div>
            <h3
              style={{
                fontSize: BRAND.fontSize.titleSmall,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primaryDark,
                margin: 0,
                marginBottom: 8,
              }}
            >
              검색 가능한 49개 문서 — 카테고리별 구성
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#5A6678',
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              <strong style={{ color: BRAND.colors.primaryDark }}>표준·정의</strong> 7개 +
              <strong style={{ color: BRAND.colors.primaryDark }}> Kaggle 데이터셋 분석</strong> 34개 +
              <strong style={{ color: BRAND.colors.primaryDark }}> 정제 기법</strong> 8개.
              모두 ChromaDB에 임베딩되어 사용자 질문에 따라 동적으로 인용됩니다.
            </p>
          </div>

          {/* 큰 통계 카드 */}
          <Flex gap={14} wrap="wrap" style={{ marginBottom: 24 }}>
            {DOC_CATEGORIES.map(({ Icon, category, englishKey, count }) => (
              <div
                key={category}
                style={{
                  flex: '1 1 240px',
                  background: BRAND.colors.surfaces.cardBlue,
                  border: `1px solid ${BRAND.colors.primary}33`,
                  borderRadius: 12,
                  padding: '18px 22px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 11,
                    background: '#fff',
                    color: BRAND.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flex: '0 0 auto',
                  }}
                >
                  <Icon size={22} stroke={2} />
                </div>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#7A8FA5',
                      fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                      marginBottom: 2,
                    }}
                  >
                    {englishKey}
                  </div>
                  <Flex align="baseline" gap={8}>
                    <span
                      style={{
                        fontSize: 28,
                        fontWeight: BRAND.fontWeight.black,
                        color: BRAND.colors.primaryDark,
                        lineHeight: 1,
                        fontFamily: '"SF Mono","Menlo","Consolas",monospace',
                      }}
                    >
                      {count}
                    </span>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: BRAND.fontWeight.semibold,
                        color: BRAND.colors.primaryDark,
                      }}
                    >
                      {category}
                    </span>
                  </Flex>
                </div>
              </div>
            ))}
          </Flex>

          {/* 카테고리별 상세 */}
          <Flex gap={14} wrap="wrap" align="stretch">
            {DOC_CATEGORIES.map(({ category, examples, desc }) => (
              <div
                key={`${category}-detail`}
                style={{
                  flex: '1 1 280px',
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <div
                  style={{
                    fontSize: BRAND.fontSize.body,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primaryDark,
                  }}
                >
                  {category}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#5A6678',
                    lineHeight: 1.6,
                  }}
                >
                  {desc}
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    fontSize: 12,
                    color: '#5A6678',
                    lineHeight: 1.75,
                    marginTop: 'auto',
                    paddingTop: 10,
                    borderTop: '1px dashed #E8EEF5',
                  }}
                >
                  {examples.map((ex) => (
                    <li key={ex}>{ex}</li>
                  ))}
                </ul>
              </div>
            ))}
          </Flex>
        </div>

        {/* ── 3. 실제 인용 예시 (개선가이드리얼2.png) ── */}
        <div style={{ marginTop: 72 }}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primary,
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              CITATION IN ACTION
            </div>
            <h3
              style={{
                fontSize: BRAND.fontSize.titleSmall,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primaryDark,
                margin: 0,
                marginBottom: 8,
              }}
            >
              실제 LLM 답변 — 출처가 박힌 모습
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#5A6678',
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              아래 캡쳐는 진단 결과의 LLM 개선 가이드 일부입니다. 본문에서는 "Kaggle 자료에 따르면",
              "MSSubClass 트랩"처럼 실제 데이터셋 이름이 자연스럽게 인용되고, 맨 아래
              <strong style={{ color: BRAND.colors.primaryDark }}> 🔗 참고 자료</strong> 섹션에
              어떤 인덱스 문서가 답변에 기여했는지 명시됩니다.
            </p>
          </div>
          <Flex gap={20} wrap="wrap" align="flex-start">
            <div
              style={{
                flex: '1 1 360px',
                maxWidth: 480,
                background: '#fff',
                border: '1px solid #E8EEF5',
                borderRadius: 14,
                padding: 14,
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <img
                src={citationImg}
                alt="실제 LLM 답변에 박힌 Kaggle 참고 자료"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  display: 'block',
                  borderRadius: 8,
                }}
              />
            </div>
            <div
              style={{
                flex: '1 1 320px',
                minWidth: 280,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              {/* 본문 인용 예시 3개 */}
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primary,
                    letterSpacing: 0.5,
                    marginBottom: 10,
                  }}
                >
                  본문 안 인용 (실제 답변 발췌)
                </div>
                <Flex vertical gap={10}>
                  {[
                    {
                      tag: 'Kaggle',
                      tagColor: '#FF8A3D',
                      quote: '"Kaggle 자료에 따르면 MSSubClass처럼 의도된 정수도 범주 의미를 가질 수 있어 라벨인코딩으로 검증 권장…"',
                    },
                    {
                      tag: 'ISO 표준',
                      tagColor: '#185FA5',
                      quote: '"ISO/IEC 25012가 정의한 Consistency 차원에 따라 카테고리 표현을 통일하면…"',
                    },
                    {
                      tag: '도구',
                      tagColor: '#1F9D6B',
                      quote: '"imbalanced-learn이 제안하는 SMOTE + class_weight=\'balanced\' 조합을 적용하면 minority recall이…"',
                    },
                  ].map(({ tag, tagColor, quote }, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: '#fff',
                        border: '1px solid #E8EEF5',
                        borderLeft: `3px solid ${tagColor}`,
                        padding: '12px 14px',
                        borderRadius: 8,
                      }}
                    >
                      <span
                        style={{
                          display: 'inline-block',
                          background: `${tagColor}1A`,
                          color: tagColor,
                          fontSize: 10,
                          fontWeight: BRAND.fontWeight.bold,
                          letterSpacing: 0.4,
                          padding: '2px 8px',
                          borderRadius: 4,
                          marginBottom: 6,
                        }}
                      >
                        {tag}
                      </span>
                      <div
                        style={{
                          fontSize: 12,
                          color: BRAND.colors.primaryDark,
                          lineHeight: 1.7,
                          fontStyle: 'italic',
                        }}
                      >
                        {quote}
                      </div>
                    </div>
                  ))}
                </Flex>
              </div>

              {/* 🔗 참고 자료 */}
              <div
                style={{
                  background: BRAND.colors.highlights.success.bg,
                  borderLeft: `4px solid ${BRAND.colors.highlights.success.icon}`,
                  padding: '16px 18px',
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: BRAND.colors.highlights.success.text,
                    fontWeight: BRAND.fontWeight.bold,
                    letterSpacing: 0.4,
                    marginBottom: 8,
                  }}
                >
                  🔗 참고 자료 (답변 하단 자동 첨부)
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    fontSize: 12,
                    color: BRAND.colors.highlights.success.text,
                    lineHeight: 2,
                  }}
                >
                  <li>Kaggle Bike Sharing Demand 데이터셋 분석</li>
                  <li>Kaggle Medical Cost 데이터셋 분석</li>
                  <li>Kaggle House Prices 데이터셋 분석</li>
                </ul>
              </div>

              {/* 메커니즘 한 줄 매핑 */}
              <div
                style={{
                  background: BRAND.colors.surfaces.subtle,
                  border: '1px dashed #CBD3E0',
                  padding: '14px 16px',
                  borderRadius: 10,
                  fontSize: 12,
                  color: '#5A6678',
                  lineHeight: 1.75,
                }}
              >
                <strong style={{ color: BRAND.colors.primaryDark }}>
                  본문에 등장한 문서 = 하단 참고 자료
                </strong>
                <br />
                LLM이 답변 작성 시 참조한 ChromaDB 인덱스 문서가 collapsing 없이 그대로 노출됩니다 —
                사용자는 어떤 자료가 답변을 뒷받침하는지 한눈에 검증 가능.
              </div>

              {/* RAG vs no-RAG 미니 비교 */}
              <Flex gap={10} wrap="wrap">
                <div
                  style={{
                    flex: '1 1 120px',
                    background: BRAND.colors.highlights.warning.bg,
                    color: BRAND.colors.highlights.warning.text,
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: 11,
                    lineHeight: 1.6,
                  }}
                >
                  <strong>RAG 미사용</strong>
                  <div style={{ marginTop: 4, opacity: 0.85 }}>
                    "비슷한 데이터셋에서…" 같은 추상 표현
                  </div>
                </div>
                <div
                  style={{
                    flex: '1 1 120px',
                    background: BRAND.colors.surfaces.cardBlue,
                    color: BRAND.colors.primaryDark,
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: 11,
                    lineHeight: 1.6,
                  }}
                >
                  <strong>RAG 사용 ✓</strong>
                  <div style={{ marginTop: 4, opacity: 0.85 }}>
                    "Kaggle House Prices에서는" 같은 실명 인용
                  </div>
                </div>
              </Flex>
            </div>
          </Flex>
        </div>

        {/* ── 4. 인용 규칙 (안전장치) ── */}
        <div style={{ marginTop: 72 }}>
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primary,
                letterSpacing: 0.5,
                marginBottom: 6,
              }}
            >
              CITATION SAFEGUARDS
            </div>
            <h3
              style={{
                fontSize: BRAND.fontSize.titleSmall,
                fontWeight: BRAND.fontWeight.bold,
                color: BRAND.colors.primaryDark,
                margin: 0,
                marginBottom: 8,
              }}
            >
              LLM 환각·내부 지칭어를 막는 3가지 프롬프트 규칙
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#5A6678',
                margin: 0,
                lineHeight: 1.7,
              }}
            >
              검색 결과를 받았다고 끝이 아닙니다. LLM이 출처를 잘못 인용하거나 사용자가 알 수 없는 내부
              표현을 쓰는 것을 막기 위해 generator.py 프롬프트에 명시적 규칙을 박아 두었습니다.
            </p>
          </div>
          <Flex vertical gap={14}>
            {CITATION_RULES.map(({ Icon, rule, good, bad }) => (
              <div
                key={rule}
                style={{
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 22,
                }}
              >
                <Flex align="center" gap={10} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
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
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primaryDark,
                    }}
                  >
                    {rule}
                  </div>
                </Flex>
                <Flex gap={12} wrap="wrap">
                  <div
                    style={{
                      flex: '1 1 240px',
                      background: BRAND.colors.highlights.success.bg,
                      borderRadius: 10,
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: BRAND.fontWeight.bold,
                        color: BRAND.colors.highlights.success.text,
                        letterSpacing: 0.4,
                        marginBottom: 4,
                      }}
                    >
                      ✓ GOOD
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: BRAND.colors.highlights.success.text,
                        lineHeight: 1.6,
                      }}
                    >
                      {good}
                    </div>
                  </div>
                  <div
                    style={{
                      flex: '1 1 240px',
                      background: BRAND.colors.highlights.warning.bg,
                      borderRadius: 10,
                      padding: '10px 14px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: BRAND.fontWeight.bold,
                        color: BRAND.colors.highlights.warning.text,
                        letterSpacing: 0.4,
                        marginBottom: 4,
                      }}
                    >
                      ✗ BAD
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: BRAND.colors.highlights.warning.text,
                        lineHeight: 1.6,
                      }}
                    >
                      {bad}
                    </div>
                  </div>
                </Flex>
              </div>
            ))}
          </Flex>
        </div>
      </div>
    </section>
  );
}
