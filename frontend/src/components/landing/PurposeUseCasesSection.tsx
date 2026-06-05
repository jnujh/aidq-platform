import { Flex } from 'antd';
import {
  IconChartLine,
  IconClock,
  IconCircleDot,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';
import scatterImg from '../../assets/research/chart1_scatter_dsc_vs_f1.png';
import lineImg from '../../assets/research/chart2_level_vs_dsc_f1.png';
import clusterImg from '../../assets/research/cluster_kmeans.png';
import anomalyImg from '../../assets/research/anomaly_comparison.png';

const USE_CASES: Array<{
  Icon: typeof IconChartLine;
  title: string;
  body: string;
  examples: string;
  issues: string[];
  focus: string;
  chart: string;
  chartCaption: string;
}> = [
  {
    Icon: IconChartLine,
    title: '회귀 모델',
    body: '아파트 가격, 매출, 수율 같이 연속된 숫자를 맞히는 작업입니다.',
    examples: '예: 부동산 가격 예측 (House Prices), 의료비 산정 (Medical Cost), 자전거 수요 (Bike Sharing)',
    issues: [
      '극단값 1개가 회귀선을 통째로 흔드는 outlier 민감도',
      '로그-정규 분포·왜도(skewness)로 인한 선형 가정 위반',
      'GarageArea / GarageCars 같은 다중공선성 피처',
    ],
    focus: '이상치 · 값 정확성(분포) · 피처 상관 가중치 ↑',
    chart: scatterImg,
    chartCaption: 'DSC 점수 ↔ F1-score 산점도 — 회귀 적합도 시각화',
  },
  {
    Icon: IconClock,
    title: '시계열 예측',
    body: '주가, 수요량, 트래픽처럼 시간 순서가 살아있어야 의미가 있는 작업입니다.',
    examples: '예: 매장 매출 (Rossmann), 웹 트래픽 (Web Traffic), 자전거 수요 (Bike Sharing)',
    issues: [
      '결측 타임스탬프 / 중복 타임스탬프 / 시간 순서 깨짐',
      '학습-테스트 분할 시 미래 정보 누수(Data Leakage)',
      '계절성·트렌드 누락 → 동일 패턴 반복 학습',
    ],
    focus: '시간 일관성 · 분포 균형 · 데이터 누수 차단',
    chart: lineImg,
    chartCaption: '오염 레벨에 따른 DSC·F1 추이 — 시계열 패턴 분석',
  },
  {
    Icon: IconCircleDot,
    title: '클러스터링·세분화',
    body: '고객 그룹화, 사용 패턴 묶기처럼 정답 라벨 없이 비슷한 것끼리 묶는 작업입니다.',
    examples: '예: 쇼핑몰 고객 세그멘테이션 (Mall Customer), 온라인 리테일 RFM (Online Retail)',
    issues: [
      '중복 행이 하나의 클러스터를 인위적으로 비대화',
      '스케일 불일치(연봉 vs 나이) → KMeans 거리 왜곡',
      '범주형 카디널리티 폭증 → 차원의 저주',
    ],
    focus: '고유성 · 피처 스케일 · 특성 다양성 점검',
    chart: clusterImg,
    chartCaption: 'K-Means 군집 분포 (Gaussian / Anisotropic / Unequal variance) — scikit-learn 예제',
  },
  {
    Icon: IconAlertTriangle,
    title: '이상 탐지',
    body: '사기 거래, 설비 고장, 보안 이벤트처럼 드문 케이스를 찾아내는 작업입니다.',
    examples: '예: 신용카드 사기 (Credit Card Fraud · 0.17%), 네트워크 침입 (IEEE-CIS Fraud)',
    issues: [
      '양성 클래스 0.1~3%로 극단적 불균형 — accuracy 무용',
      '노이즈와 진짜 이상치 구분 어려움 (모델 종류별 영향 다름)',
      '라벨 노이즈 → false positive·negative 폭증',
    ],
    focus: 'minority class 보존 · label_consistency · 이상치 정밀 분석',
    chart: anomalyImg,
    chartCaption: '5종 이상탐지 알고리즘 비교 — 정상(파랑) vs 이상(주황) — scikit-learn 예제',
  },
];

export default function PurposeUseCasesSection() {
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
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%', wordBreak: 'keep-all' }}>
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
            MORE USE CASES
          </div>
          <h2
            style={{
              fontSize: BRAND.fontSize.titleMedium,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 10,
            }}
          >
            분류 외에도, 데이터를 쓰는 방식은 다양합니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            회귀·시계열·군집·이상탐지 — 목적이 바뀌면 봐야 할 지표와 가중치도 함께 바뀝니다.
          </p>
        </div>

        <Flex vertical gap={24}>
          {USE_CASES.map(({ Icon, title, body, examples, issues, focus, chart, chartCaption }) => (
            <div
              key={title}
              style={{
                background: '#fff',
                border: '1px solid #E8EEF5',
                borderRadius: 18,
                overflow: 'hidden',
              }}
            >
              <Flex wrap="wrap" align="stretch">
                {/* 좌측: 차트 */}
                <div
                  style={{
                    flex: '1 1 360px',
                    minWidth: 280,
                    background: BRAND.colors.surfaces.subtle,
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 10,
                    borderRight: '1px solid #E8EEF5',
                  }}
                >
                  <img
                    src={chart}
                    alt={`${title} 시각화`}
                    style={{
                      maxWidth: '100%',
                      maxHeight: 260,
                      objectFit: 'contain',
                      display: 'block',
                    }}
                  />
                  <div
                    style={{
                      fontSize: 11,
                      color: '#7A8FA5',
                      textAlign: 'center',
                      lineHeight: 1.4,
                      maxWidth: 360,
                    }}
                  >
                    {chartCaption}
                  </div>
                </div>

                {/* 우측: 설명 */}
                <div
                  style={{
                    flex: '1 1 420px',
                    minWidth: 300,
                    padding: '28px 30px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 14,
                  }}
                >
                  <Flex align="center" gap={14}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 12,
                        background: BRAND.colors.surfaces.cardBlue,
                        color: BRAND.colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flex: '0 0 auto',
                      }}
                    >
                      <Icon size={26} stroke={2} />
                    </div>
                    <div
                      style={{
                        fontSize: BRAND.fontSize.titleSmall,
                        fontWeight: BRAND.fontWeight.bold,
                        color: BRAND.colors.primaryDark,
                        lineHeight: 1.25,
                      }}
                    >
                      {title}
                    </div>
                  </Flex>

                  <div
                    style={{
                      fontSize: BRAND.fontSize.body,
                      color: '#3F4A5C',
                      lineHeight: 1.7,
                    }}
                  >
                    {body}
                  </div>

                  {/* 실제 사용 예시 */}
                  <div
                    style={{
                      background: BRAND.colors.surfaces.subtle,
                      padding: '10px 14px',
                      borderRadius: 10,
                      fontSize: BRAND.fontSize.bodySmall,
                      color: BRAND.colors.primaryDark,
                      lineHeight: 1.6,
                      fontStyle: 'italic',
                    }}
                  >
                    {examples}
                  </div>

                  {/* 자주 발생하는 품질 문제 */}
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        color: '#7A8FA5',
                        fontWeight: BRAND.fontWeight.bold,
                        letterSpacing: 0.4,
                        marginBottom: 8,
                      }}
                    >
                      이 작업에서 자주 깨지는 지점
                    </div>
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: 18,
                        fontSize: BRAND.fontSize.bodySmall,
                        color: '#5A6678',
                        lineHeight: 1.75,
                      }}
                    >
                      {issues.map((issue) => (
                        <li key={issue}>{issue}</li>
                      ))}
                    </ul>
                  </div>

                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: 14,
                      borderTop: '1px dashed #E8EEF5',
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        color: BRAND.colors.primary,
                        fontWeight: BRAND.fontWeight.bold,
                        letterSpacing: 0.4,
                        marginBottom: 4,
                      }}
                    >
                      플랫폼이 자동으로 강조하는 항목
                    </div>
                    <div
                      style={{
                        fontSize: BRAND.fontSize.bodySmall,
                        color: BRAND.colors.primaryDark,
                        fontWeight: BRAND.fontWeight.semibold,
                        lineHeight: 1.55,
                      }}
                    >
                      {focus}
                    </div>
                  </div>
                </div>
              </Flex>
            </div>
          ))}
        </Flex>
      </div>
    </section>
  );
}
