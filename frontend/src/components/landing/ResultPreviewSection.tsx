import { Flex } from 'antd';
import { BRAND } from '../../config/brand';
import datasetImg from '../../assets/남독일신용도이민.png';
import reasonImg from '../../assets/남독일신용도이민평가이유.png';
import weightImg from '../../assets/가중치분석.png';
import scoreImg from '../../assets/남독일진단결과.png';
import metricImg from '../../assets/남독일지표분석.png';
import guide1Img from '../../assets/남독일개선가이드1.png';
import guide2Img from '../../assets/남독일개선가이드2.png';
import guide3Img from '../../assets/남독일개선가이드3.png';
import retryImg from '../../assets/독일신용도재진단.png';
import retryResultImg from '../../assets/재진단결과.png';

const SectionBlock = ({
  step,
  title,
  description,
  children,
  emphasized = false,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
  emphasized?: boolean;
}) => (
  <div
    style={{
      background: emphasized ? BRAND.colors.surfaces.cardBlue : '#fff',
      borderRadius: 16,
      padding: 28,
      border: emphasized
        ? `2px solid ${BRAND.colors.primary}`
        : '1px solid #E6EDF5',
      boxShadow: emphasized
        ? '0 8px 24px rgba(24, 95, 165, 0.12)'
        : '0 2px 8px rgba(0, 0, 0, 0.04)',
    }}
  >
    <Flex align="center" gap={12} style={{ marginBottom: 8 }}>
      <span
        style={{
          background: emphasized ? BRAND.colors.primary : BRAND.colors.surfaces.subtle,
          color: emphasized ? '#fff' : BRAND.colors.primary,
          fontSize: 12,
          fontWeight: BRAND.fontWeight.bold,
          letterSpacing: 0.5,
          padding: '4px 10px',
          borderRadius: 999,
        }}
      >
        STEP {step}
      </span>
      {emphasized && (
        <span
          style={{
            background: BRAND.colors.badges.purposeB.bg,
            color: BRAND.colors.badges.purposeB.text,
            fontSize: 11,
            fontWeight: BRAND.fontWeight.bold,
            letterSpacing: 0.5,
            padding: '4px 10px',
            borderRadius: 999,
          }}
        >
          재진단 기능
        </span>
      )}
    </Flex>
    <h3
      style={{
        fontSize: BRAND.fontSize.titleSmall,
        fontWeight: BRAND.fontWeight.bold,
        color: BRAND.colors.primaryDark,
        margin: '0 0 6px 0',
      }}
    >
      {title}
    </h3>
    <p
      style={{
        fontSize: BRAND.fontSize.body,
        color: '#5A6678',
        margin: '0 0 20px 0',
        lineHeight: 1.6,
      }}
    >
      {description}
    </p>
    {children}
  </div>
);

const Screenshot = ({ src, alt, flex = 1 }: { src: string; alt: string; flex?: number }) => (
  <div
    style={{
      flex,
      minWidth: 280,
      background: '#fff',
      borderRadius: 10,
      border: '1px solid #E6EDF5',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    <img
      src={src}
      alt={alt}
      style={{
        width: '100%',
        height: 'auto',
        display: 'block',
      }}
    />
  </div>
);

export default function ResultPreviewSection() {
  return (
    <section style={{ padding: '80px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <div
            style={{
              color: BRAND.colors.primary,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            RESULT PREVIEW
          </div>
          <h2
            style={{
              fontSize: 30,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 12,
            }}
          >
            실제 진단 흐름 — 독일 신용 이민 데이터 사례
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
              lineHeight: 1.6,
              maxWidth: 720,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            업로드부터 재진단까지 한 사이클을 그대로 보여드립니다. 점수만 보고 끝나지 않고,
            <strong style={{ color: BRAND.colors.primaryDark }}> 개선 가이드 → 재진단 → 비교</strong>로
            데이터 품질을 끌어올리는 게 핵심입니다.
          </p>
        </div>

        {/* 단계별 흐름 */}
        <Flex vertical gap={24}>
          {/* STEP 01 */}
          <SectionBlock
            step="01"
            title="데이터 업로드 + 사용 목적 입력"
            description="분류·회귀 등 데이터의 쓰임새를 자연어로 입력합니다. 이 사례에서는 '신용 거절 케이스 분류 모델용' 데이터를 업로드했습니다."
          >
            <Flex gap={32} wrap="wrap" align="stretch">
              <div style={{ flex: '1 1 320px', maxWidth: 480 }}>
                <Screenshot src={datasetImg} alt="독일 신용 이민 데이터 업로드" />
              </div>
              <div
                style={{
                  flex: '1 1 280px',
                  minWidth: 260,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 18,
                }}
              >
                {/* 입력 필드 설명 */}
                <div>
                  <div
                    style={{
                      color: BRAND.colors.primary,
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      letterSpacing: 0.5,
                      marginBottom: 10,
                    }}
                  >
                    사용자가 입력하는 정보
                  </div>
                  <ul
                    style={{
                      fontSize: BRAND.fontSize.body,
                      color: '#3F4A5C',
                      lineHeight: 2,
                      paddingLeft: 18,
                      margin: 0,
                    }}
                  >
                    <li>
                      <strong style={{ color: BRAND.colors.primaryDark }}>작업 이름</strong> — 진단 목록에서
                      식별하기 위한 라벨
                    </li>
                    <li>
                      <strong style={{ color: BRAND.colors.primaryDark }}>사용 목적</strong> — 자연어 한 문장.
                      LLM 가중치 추천의 기준으로 그대로 전달
                    </li>
                    <li>
                      <strong style={{ color: BRAND.colors.primaryDark }}>데이터 유형</strong> — 정형 / 이미지
                      / 텍스트 (모달리티에 따라 추가 입력 화면이 달라짐)
                    </li>
                  </ul>
                </div>

                {/* 입력 예시 카드 */}
                <div
                  style={{
                    background: BRAND.colors.surfaces.subtle,
                    borderRadius: 10,
                    padding: '16px 18px',
                    border: `1px solid ${BRAND.colors.primary}22`,
                  }}
                >
                  <div
                    style={{
                      color: BRAND.colors.primary,
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      letterSpacing: 0.5,
                      marginBottom: 8,
                    }}
                  >
                    실제 입력한 사용 목적
                  </div>
                  <p
                    style={{
                      fontSize: BRAND.fontSize.body,
                      color: BRAND.colors.primaryDark,
                      margin: 0,
                      lineHeight: 1.8,
                      fontStyle: 'italic',
                    }}
                  >
                    "남독일인구가 신용도에 따라 이민율이 어떤지 알아보고싶어"
                  </p>
                </div>

                {/* 데이터 유형별 추가 입력 안내 */}
                <div
                  style={{
                    background: '#fff',
                    border: '1px solid #E6EDF5',
                    borderRadius: 10,
                    padding: '14px 16px',
                  }}
                >
                  <div
                    style={{
                      color: BRAND.colors.primary,
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      letterSpacing: 0.5,
                      marginBottom: 10,
                    }}
                  >
                    데이터 유형에 따른 자동 처리
                  </div>
                  <Flex vertical gap={8}>
                    {[
                      { label: '정형 (CSV·Excel·JSON)', desc: 'target 컬럼·numeric/categorical 자동 인식' },
                      { label: '이미지 (ZIP)', desc: '폴더명을 클래스 라벨로 자동 매핑' },
                      { label: '텍스트 (CSV)', desc: '텍스트 열·라벨 열 자동 또는 수동 지정' },
                    ].map((row) => (
                      <Flex key={row.label} gap={10} align="flex-start">
                        <span
                          style={{
                            flex: '0 0 auto',
                            background: BRAND.colors.badges.purposeA.bg,
                            color: BRAND.colors.badges.purposeA.text,
                            fontSize: 11,
                            fontWeight: BRAND.fontWeight.semibold,
                            padding: '3px 9px',
                            borderRadius: 999,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {row.label}
                        </span>
                        <span
                          style={{
                            fontSize: BRAND.fontSize.bodySmall,
                            color: '#5A6678',
                            lineHeight: 1.7,
                          }}
                        >
                          {row.desc}
                        </span>
                      </Flex>
                    ))}
                  </Flex>
                </div>
              </div>
            </Flex>
          </SectionBlock>

          {/* STEP 02 */}
          <SectionBlock
            step="02"
            title="LLM이 목적 기반으로 가중치 추천"
            description="RAG 검색으로 도메인 문서를 근거 삼아 8개 지표의 가중치를 자동으로 분배합니다. 왜 그렇게 분배했는지 근거도 함께 보여드립니다."
          >
            <Flex gap={16} wrap="wrap">
              <Screenshot src={weightImg} alt="가중치 추천 결과" />
              <Screenshot src={reasonImg} alt="추천 근거 — 평가 이유" />
            </Flex>
          </SectionBlock>

          {/* STEP 03 */}
          <SectionBlock
            step="03"
            title="진단 실행 — 총점 + 8개 지표 점수"
            description="추천 가중치로 데이터를 평가합니다. 총점과 함께 어느 지표에서 점수가 깎였는지 한눈에 보입니다."
          >
            <Flex gap={16} wrap="wrap">
              <Screenshot src={scoreImg} alt="진단 총점 결과" />
              <Screenshot src={metricImg} alt="지표별 상세 점수" />
            </Flex>
          </SectionBlock>

          {/* STEP 04 */}
          <SectionBlock
            step="04"
            title="AI 개선 가이드 — 무엇을 어떻게 고칠지"
            description="단순히 점수만 보여주지 않습니다. 약점이 발견된 지표마다 RAG가 구체적인 개선 방법을 우선순위로 제시합니다."
          >
            <Flex gap={16} wrap="wrap">
              <Screenshot src={guide1Img} alt="개선 가이드 1" />
              <Screenshot src={guide2Img} alt="개선 가이드 2" />
              <Screenshot src={guide3Img} alt="개선 가이드 3" />
            </Flex>
          </SectionBlock>

          {/* STEP 05 — 재진단 (강조 + 어노테이션 화살표) */}
          <SectionBlock
            step="05"
            title="개선된 데이터로 재진단"
            description="가이드대로 데이터를 보완한 뒤 동일 가중치·동일 평가 기준으로 다시 진단합니다."
            emphasized
          >
            <Flex gap={32} wrap="wrap" align="stretch">
              {/* 좌측: 재진단 화면 */}
              <div style={{ flex: '1 1 320px', maxWidth: 460 }}>
                <Screenshot src={retryImg} alt="재진단 업로드 화면" />
              </div>

              {/* 우측: 신뢰성 콜아웃 묶음 */}
              <div
                style={{
                  flex: '1 1 280px',
                  minWidth: 260,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                {/* 핵심 메시지 카드 */}
                <div
                  style={{
                    background: '#fff',
                    borderLeft: `4px solid ${BRAND.colors.primary}`,
                    padding: '18px 20px',
                    borderRadius: 10,
                    boxShadow: '0 4px 12px rgba(24, 95, 165, 0.08)',
                  }}
                >
                  <div
                    style={{
                      color: BRAND.colors.primary,
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      letterSpacing: 0.5,
                      marginBottom: 6,
                    }}
                  >
                    재진단 핵심 원리
                  </div>
                  <h4
                    style={{
                      fontSize: BRAND.fontSize.subtitle,
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primaryDark,
                      margin: '0 0 10px 0',
                      lineHeight: 1.4,
                    }}
                  >
                    점수 상승 = <span style={{ color: BRAND.colors.primary }}>순수한 데이터 개선 효과</span>
                  </h4>
                  <p
                    style={{
                      fontSize: BRAND.fontSize.bodySmall,
                      color: '#3F4A5C',
                      lineHeight: 1.7,
                      margin: 0,
                    }}
                  >
                    재진단은{' '}
                    <strong style={{ color: BRAND.colors.primaryDark }}>
                      부모 진단의 가중치를 그대로 사용
                    </strong>
                    합니다. 사용자가 마음대로 가중치를 바꿀 수 없도록 막혀 있어요. 평가 잣대가 고정되기 때문에
                    점수 차이가 데이터 개선 때문인지, 기준이 바뀐 탓인지 헷갈릴 일이 없습니다.
                  </p>
                </div>

                {/* 대비 비교 카드: 잠금 X vs 잠금 O */}
                <div
                  style={{
                    background: '#fff',
                    borderRadius: 10,
                    padding: '14px 16px',
                    border: '1px solid #E6EDF5',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primaryDark,
                      letterSpacing: 0.5,
                      marginBottom: 10,
                    }}
                  >
                    왜 가중치 잠금이 중요한가요?
                  </div>
                  <Flex gap={10} wrap="wrap">
                    <div
                      style={{
                        flex: '1 1 140px',
                        background: BRAND.colors.highlights.warning.bg,
                        padding: '10px 12px',
                        borderRadius: 8,
                        fontSize: BRAND.fontSize.bodySmall,
                        color: BRAND.colors.highlights.warning.text,
                        lineHeight: 1.5,
                      }}
                    >
                      <strong>가중치 바뀜</strong>
                      <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>
                        점수가 올라도 데이터 덕인지 평가가 후해진 건지 알 수 없음
                      </div>
                    </div>
                    <div
                      style={{
                        flex: '1 1 140px',
                        background: BRAND.colors.highlights.success.bg,
                        padding: '10px 12px',
                        borderRadius: 8,
                        fontSize: BRAND.fontSize.bodySmall,
                        color: BRAND.colors.highlights.success.text,
                        lineHeight: 1.5,
                      }}
                    >
                      <strong>가중치 고정 ✓</strong>
                      <div style={{ fontSize: 12, marginTop: 4, opacity: 0.85 }}>
                        점수 차이는 오직 데이터 품질 변화에서 발생
                      </div>
                    </div>
                  </Flex>
                </div>

                {/* 신뢰성 태그 */}
                <Flex gap={8} wrap="wrap">
                  {['가중치 잠금', '동일 평가 기준', '비교 가능한 점수'].map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background: BRAND.colors.highlights.success.bg,
                        color: BRAND.colors.highlights.success.text,
                        fontSize: 11,
                        fontWeight: BRAND.fontWeight.semibold,
                        padding: '4px 10px',
                        borderRadius: 999,
                      }}
                    >
                      ✓ {tag}
                    </span>
                  ))}
                </Flex>
              </div>
            </Flex>
          </SectionBlock>

          {/* STEP 06 */}
          <SectionBlock
            step="06"
            title="재진단 결과 — 개선 효과 비교"
            description="부모 진단 vs. 재진단 결과를 나란히 비교합니다. 어느 지표가 얼마나 올랐는지, 어떤 가이드가 효과적이었는지 한 화면에서 확인할 수 있습니다."
          >
            <Flex gap={32} wrap="wrap" align="stretch">
              <div style={{ flex: '1 1 320px', maxWidth: 480 }}>
                <Screenshot src={retryResultImg} alt="재진단 결과 비교" />
              </div>
              <div
                style={{
                  flex: '1 1 260px',
                  minWidth: 240,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: 22,
                }}
              >
                <div>
                  <div
                    style={{
                      color: BRAND.colors.primary,
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      letterSpacing: 0.5,
                      marginBottom: 10,
                    }}
                  >
                    화면에서 확인할 수 있는 정보
                  </div>
                  <ul
                    style={{
                      fontSize: BRAND.fontSize.body,
                      color: '#3F4A5C',
                      lineHeight: 2,
                      paddingLeft: 18,
                      margin: 0,
                    }}
                  >
                    <li>
                      <strong style={{ color: BRAND.colors.primaryDark }}>총점 변화</strong>를 부모/자식 나란히
                      표시.
                    </li>
                    <li>
                      지표별로{' '}
                      <strong style={{ color: BRAND.colors.primaryDark }}>증감 폭(Δ)</strong>이 색상으로 표시되어
                      어떤 개선이 효과적이었는지 한눈에 파악.
                    </li>
                    <li>가이드별 기여도를 추적해 다음 사이클 우선순위를 정할 수 있습니다.</li>
                  </ul>
                </div>

                {/* 비교 미니 카드 (수치 예시) */}
                <Flex gap={10} wrap="wrap">
                  <div
                    style={{
                      flex: '1 1 110px',
                      background: '#fff',
                      border: '1px solid #E6EDF5',
                      borderRadius: 10,
                      padding: '10px 12px',
                    }}
                  >
                    <div style={{ fontSize: 10, color: '#7A8FA5', letterSpacing: 0.5 }}>부모 진단</div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: BRAND.fontWeight.bold,
                        color: BRAND.colors.primaryDark,
                        lineHeight: 1.2,
                      }}
                    >
                      89.07
                    </div>
                  </div>
                  <div
                    style={{
                      flex: '1 1 110px',
                      background: BRAND.colors.highlights.success.bg,
                      borderRadius: 10,
                      padding: '10px 12px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 10,
                        color: BRAND.colors.highlights.success.text,
                        letterSpacing: 0.5,
                      }}
                    >
                      재진단 (▲ +6.08)
                    </div>
                    <div
                      style={{
                        fontSize: 22,
                        fontWeight: BRAND.fontWeight.bold,
                        color: BRAND.colors.highlights.success.text,
                        lineHeight: 1.2,
                      }}
                    >
                      95.15
                    </div>
                  </div>
                </Flex>

                <div
                  style={{
                    background: BRAND.colors.highlights.success.bg,
                    color: BRAND.colors.highlights.success.text,
                    padding: '16px 18px',
                    borderRadius: 10,
                    fontSize: BRAND.fontSize.bodySmall,
                    lineHeight: 1.9,
                  }}
                >
                  <strong>가중치가 동일하기 때문에</strong> 여기서 보이는 점수 상승은 "평가 기준이 후해졌다"가
                  아니라
                  <br />
                  <strong>"데이터가 진짜로 개선됐다"</strong>는 신호입니다.
                </div>
              </div>
            </Flex>
          </SectionBlock>
        </Flex>
      </div>
    </section>
  );
}
