import { Flex } from 'antd';
import {
  IconBrain,
  IconBuildingBank,
  IconSchool,
  IconHeartbeat,
  IconShoppingCart,
  IconBuildingFactory2,
  IconChartHistogram,
  IconBulb,
  IconAlertCircle,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';
import financeImg from '../../assets/금융.png';
import medicalImg from '../../assets/의료.png';
import factoryImg from '../../assets/제조.png';
import recommendImg from '../../assets/추천.png';
import publicDataImg from '../../assets/공공데이터.png';
import academicImg from '../../assets/졸업.png';

type Vertical = {
  Icon: typeof IconBrain;
  category: string;
  title: string;
  scenario: string;
  problem: string;
  impact: string;
  img: string;
  imgFit?: 'cover' | 'contain';
};

const VERTICALS: Vertical[] = [
  {
    Icon: IconBuildingBank,
    category: '금융 · 신용평가',
    title: '신용 리스크 · 사기 탐지',
    scenario: '신용도 분류, 카드 사기 탐지, 대출 부도 예측 모델 학습용 데이터',
    problem: '사기 클래스 비율 0.1~3%로 극단적 불균형, 카테고리 표기 불일치',
    impact: 'minority class 보존을 자동 강조, 클래스 불균형 가중치 ↑',
    img: financeImg,
  },
  {
    Icon: IconHeartbeat,
    category: '의료 · 헬스케어',
    title: '임상 보조 · 환자 분류',
    scenario: 'EMR 기반 진단 보조, 약물 처방 분류, 의료영상 라벨링',
    problem: '체계적 결측(MNAR), 라벨러 간 일관성 차이, 희귀 케이스 라벨 오류',
    impact: 'cleanlab 기반 라벨 오류 탐지, MNAR 패턴 경고',
    img: medicalImg,
  },
  {
    Icon: IconBuildingFactory2,
    category: '제조 · 품질관리',
    title: '불량 예측 · 수율 최적화',
    scenario: '센서 시계열 기반 불량 예측, 공정 파라미터 최적화 모델',
    problem: '센서 노이즈로 인한 이상치, 정상 변동과 진짜 이상 신호 구분 어려움',
    impact: '이상치 비율 진단 + 모델 타입별 영향도 가이드',
    img: factoryImg,
  },
  {
    Icon: IconShoppingCart,
    category: '이커머스 · 마케팅',
    title: '이탈 예측 · 추천 시스템',
    scenario: '고객 이탈 예측, CTR 예측, 상품 추천, 세그멘테이션',
    problem: '동일 고객 중복 행, 카테고리 폭증, 학습-운영 분포 차이(drift)',
    impact: '중복 데이터 누수 감지, 카디널리티 폭증 경고',
    img: recommendImg,
    imgFit: 'contain',
  },
  {
    Icon: IconBuildingBank,
    category: '공공 · 연구',
    title: '개방 데이터 · 정책 분석',
    scenario: '공공데이터포털 개방 전 검증, 정책 효과 분석 데이터셋',
    problem: '표준 표기 미준수, 결측 표시 다양(NA·null·-1·999), 시간 형식 혼재',
    impact: 'ISO/IEC 25012·5259 기반 표준 적합성 진단',
    img: publicDataImg,
  },
  {
    Icon: IconSchool,
    category: '학술 · 캡스톤',
    title: '논문·졸업 프로젝트 데이터',
    scenario: '캡스톤 데이터셋 사전 점검, 논문 실험 재현성 확보',
    problem: '학습 단계의 데이터 누수, 클래스 균형 미확인, 라벨 일관성 검증 없음',
    impact: '학습 전 8개 지표 자동 점검, 개선 우선순위 자동 제안',
    img: academicImg,
  },
];

type ImpactExample = {
  Icon: typeof IconBrain;
  before: string;
  after: string;
  insight: string;
};

const IMPACT_EXAMPLES: ImpactExample[] = [
  {
    Icon: IconChartHistogram,
    before: '70:30 클래스 불균형 · 점수 70.2',
    after: 'SMOTE 적용 + minority 보강 · 점수 88.5',
    insight: '재진단은 동일 가중치로 비교되어 점수 상승이 데이터 개선 신호임을 보장',
  },
  {
    Icon: IconAlertCircle,
    before: '센서 이상치 12% · linear 모델 RMSE 폭증',
    after: '이상치 변환·트리 기반 모델 추천 후 RMSE 안정화',
    insight: '같은 데이터라도 모델 타입에 따라 outlier 영향이 달라 — 진단이 이를 알려줌',
  },
  {
    Icon: IconBulb,
    before: '라벨러 간 불일치 라벨 4.7%',
    after: 'cleanlab 의심 라벨 검토·재라벨링 후 0.8%',
    insight: 'label_consistency 지표가 ImageNet 수준 골드 스탠다드에서도 오류 발견',
  },
];

export default function UseCasesSection() {
  return (
    <section style={{ padding: '80px 40px', background: '#fff' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* 헤더 */}
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
            USE CASES
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
            어떤 분야에서 어떻게 쓰이고 있나요?
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
            모델 학습 전 데이터 품질 검증이 필요한 모든 도메인에서 활용할 수 있습니다.
            분야마다 <strong style={{ color: BRAND.colors.primaryDark }}>치명적인 데이터 품질 문제</strong>가 다르고,
            플랫폼은 사용 목적을 보고 그에 맞춰 가중치를 잡습니다.
          </p>
        </div>

        {/* 산업 vertical 6장 */}
        <Flex gap={20} wrap="wrap" align="stretch" style={{ marginBottom: 56 }}>
          {VERTICALS.map(({ Icon, category, title, scenario, problem, impact, img, imgFit }) => (
            <div
              key={category}
              style={{
                flex: '1 1 320px',
                minWidth: 280,
                background: '#fff',
                border: '1px solid #E8EEF5',
                borderRadius: 18,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* 이미지 배너 */}
              <div
                style={{
                  width: '100%',
                  height: 160,
                  overflow: 'hidden',
                  background: BRAND.colors.surfaces.subtle,
                  position: 'relative',
                }}
              >
                <img
                  src={img}
                  alt={category}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: imgFit ?? 'cover',
                    display: 'block',
                  }}
                />
              </div>

              <div
                style={{
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                  flex: 1,
                }}
              >
                <Flex align="center" gap={12}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      background: BRAND.colors.surfaces.cardBlue,
                      color: BRAND.colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flex: '0 0 auto',
                    }}
                  >
                    <Icon size={22} stroke={1.8} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: BRAND.colors.primary,
                        fontWeight: BRAND.fontWeight.bold,
                        letterSpacing: 0.4,
                        marginBottom: 2,
                      }}
                    >
                      {category}
                    </div>
                    <div
                      style={{
                        fontSize: BRAND.fontSize.subtitleSmall,
                        fontWeight: BRAND.fontWeight.bold,
                        color: BRAND.colors.primaryDark,
                        lineHeight: 1.3,
                      }}
                    >
                      {title}
                    </div>
                  </div>
                </Flex>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#7A8FA5',
                      fontWeight: BRAND.fontWeight.semibold,
                      letterSpacing: 0.3,
                      marginBottom: 4,
                    }}
                  >
                    쓰임새
                  </div>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.bodySmall,
                      color: '#3F4A5C',
                      lineHeight: 1.6,
                    }}
                  >
                    {scenario}
                  </div>
                </div>

                <div>
                  <div
                    style={{
                      fontSize: 11,
                      color: '#7A8FA5',
                      fontWeight: BRAND.fontWeight.semibold,
                      letterSpacing: 0.3,
                      marginBottom: 4,
                    }}
                  >
                    자주 발생하는 데이터 품질 문제
                  </div>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.bodySmall,
                      color: '#5A6678',
                      lineHeight: 1.6,
                    }}
                  >
                    {problem}
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 'auto',
                    paddingTop: 12,
                    borderTop: '1px dashed #E8EEF5',
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      color: BRAND.colors.primary,
                      fontWeight: BRAND.fontWeight.semibold,
                      letterSpacing: 0.3,
                      marginBottom: 4,
                    }}
                  >
                    플랫폼의 진단 효과
                  </div>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.bodySmall,
                      color: BRAND.colors.primaryDark,
                      lineHeight: 1.6,
                      fontWeight: BRAND.fontWeight.semibold,
                    }}
                  >
                    {impact}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </Flex>

        {/* Before → After 임팩트 예시 */}
        <div style={{ marginBottom: 56 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div
              style={{
                color: BRAND.colors.primary,
                fontSize: 11,
                fontWeight: BRAND.fontWeight.semibold,
                letterSpacing: 0.5,
                marginBottom: 10,
              }}
            >
              IMPACT EXAMPLES
            </div>
            <h3
              style={{
                fontSize: BRAND.fontSize.titleSmall,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primaryDark,
                margin: 0,
                marginBottom: 8,
              }}
            >
              진단·개선·재진단 한 사이클의 효과
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#666',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              실제 사용자가 가이드를 적용한 뒤 재진단을 돌렸을 때 본 변화 패턴들.
            </p>
          </div>

          <Flex gap={16} wrap="wrap" align="stretch">
            {IMPACT_EXAMPLES.map(({ Icon, before, after, insight }, idx) => (
              <div
                key={idx}
                style={{
                  flex: '1 1 300px',
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: BRAND.colors.surfaces.cardBlue,
                    color: BRAND.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={22} stroke={2} />
                </div>

                <div
                  style={{
                    background: BRAND.colors.surfaces.subtle,
                    color: '#5A6678',
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: BRAND.fontSize.bodySmall,
                    lineHeight: 1.55,
                    borderLeft: '3px solid #CBD3E0',
                  }}
                >
                  <span style={{ fontWeight: BRAND.fontWeight.bold, color: '#3F4A5C' }}>Before:</span> {before}
                </div>
                <div
                  style={{
                    background: BRAND.colors.surfaces.cardBlue,
                    color: BRAND.colors.primaryDark,
                    padding: '10px 12px',
                    borderRadius: 8,
                    fontSize: BRAND.fontSize.bodySmall,
                    lineHeight: 1.55,
                    borderLeft: `3px solid ${BRAND.colors.primary}`,
                  }}
                >
                  <span style={{ fontWeight: BRAND.fontWeight.bold, color: BRAND.colors.primary }}>After:</span> {after}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: BRAND.colors.primaryDark,
                    lineHeight: 1.7,
                    fontStyle: 'italic',
                    paddingTop: 4,
                  }}
                >
                  💡 {insight}
                </div>
              </div>
            ))}
          </Flex>
        </div>

        {/* 시작 가이드 */}
        <div
          style={{
            background: BRAND.colors.surfaces.subtle,
            borderRadius: 18,
            padding: '32px 28px',
          }}
        >
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                color: BRAND.colors.primary,
                fontSize: 11,
                fontWeight: BRAND.fontWeight.semibold,
                letterSpacing: 0.5,
                marginBottom: 8,
              }}
            >
              GETTING STARTED
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
              어떤 데이터로 처음 진단해보면 좋을까?
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#5A6678',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              아래 조건이면 가장 빠르게 진단·개선 사이클을 한 바퀴 돌려볼 수 있습니다.
            </p>
          </div>

          <Flex gap={16} wrap="wrap" align="stretch">
            {[
              {
                num: '01',
                title: '추천 데이터 크기',
                body: '수백 행 ~ 1GB. 32MB 이상은 자동으로 byte-range 병렬 진단으로 라우팅됩니다.',
              },
              {
                num: '02',
                title: '추천 데이터 형식',
                body: '정형은 CSV·Excel·JSON, 이미지는 클래스별 폴더 ZIP, 텍스트는 텍스트 열·라벨 열이 있는 CSV.',
              },
              {
                num: '03',
                title: '사용 목적 작성 팁',
                body: '"이 데이터로 무엇을 예측할지" 한 문장이면 충분. 구체적일수록(예: "minority class 정밀도가 중요") 가중치가 정밀해집니다.',
              },
            ].map(({ num, title, body }) => (
              <div
                key={num}
                style={{
                  flex: '1 1 280px',
                  background: '#fff',
                  borderRadius: 12,
                  padding: 20,
                  border: '1px solid #E8EEF5',
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    fontWeight: BRAND.fontWeight.black,
                    color: BRAND.colors.primary,
                    lineHeight: 1,
                    marginBottom: 10,
                    opacity: 0.85,
                  }}
                >
                  {num}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.body,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primaryDark,
                    marginBottom: 6,
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
      </div>
    </section>
  );
}
