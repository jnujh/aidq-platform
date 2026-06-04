import { Flex } from 'antd';
import {
  IconUpload,
  IconCloud,
  IconRulerMeasure,
  IconSearch,
  IconRobot,
  IconReportAnalytics,
  IconBolt,
  IconLock,
  IconRefresh,
  IconBrandGithub,
  IconBrandReact,
  IconBrandPython,
  IconBrandDocker,
  IconCoffee,
  IconCode,
  IconExternalLink,
  IconShieldLock,
  IconCpu,
  IconRocket,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

const GITHUB_URL = 'https://github.com/jnujh/aidq-platform';

type Stage = {
  Icon: typeof IconUpload;
  label: string;
  sub: string;
};

const STAGES: Stage[] = [
  { Icon: IconUpload, label: '업로드', sub: 'Presigned URL → S3 직접 전송' },
  { Icon: IconCloud, label: 'S3 저장', sub: '원본 분리·진단 후 자동 삭제' },
  { Icon: IconRulerMeasure, label: '품질 측정', sub: 'DSC 엔진 8개 지표 계산' },
  { Icon: IconSearch, label: 'RAG 검색', sub: 'ISO·Kaggle·기법 문서 임베딩 검색' },
  { Icon: IconRobot, label: 'LLM 생성', sub: '맥락+근거를 받아 분석 리포트 생성' },
  { Icon: IconReportAnalytics, label: '결과 출력', sub: '점수·등급·개선 가이드' },
];

const PARALLEL_NOTES: Array<{ Icon: typeof IconBolt; title: string; body: string }> = [
  {
    Icon: IconBolt,
    title: '품질 측정 ⟷ RAG 검색 병렬 실행',
    body: 'DSC 엔진이 지표를 계산하는 동안 RAG가 관련 문서를 동시에 검색해 진단 총 소요 시간을 단축합니다.',
  },
  {
    Icon: IconRefresh,
    title: '비동기 작업 큐 + SSE 실시간 알림',
    body: '업로드 즉시 작업 ID 발급, 무거운 진단은 백엔드에서 처리. 결과가 나오면 SSE(Server-Sent Events)로 즉시 푸시 — 폴링 없이 화면이 자동 갱신됩니다.',
  },
  {
    Icon: IconLock,
    title: '원본 자동 정리',
    body: '진단이 끝나면 S3의 원본 파일을 자동 삭제. 사용자 데이터를 필요 이상으로 보관하지 않습니다.',
  },
];

function StageCard({ Icon, label, sub, index }: Stage & { index: number }) {
  return (
    <div
      style={{
        flex: '1 1 0',
        minWidth: 140,
        background: '#fff',
        border: '1px solid #E8EEF5',
        borderRadius: 14,
        padding: '20px 14px',
        textAlign: 'center',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 8,
          left: 10,
          fontSize: 11,
          color: '#aaa',
          fontWeight: BRAND.fontWeight.semibold,
        }}
      >
        {String(index + 1).padStart(2, '0')}
      </div>
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: BRAND.colors.surfaces.cardBlue,
          color: BRAND.colors.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 10px',
        }}
      >
        <Icon size={22} stroke={2} />
      </div>
      <div
        style={{
          fontSize: BRAND.fontSize.body,
          fontWeight: BRAND.fontWeight.semibold,
          color: BRAND.colors.primaryDark,
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 12,
          color: '#666',
          lineHeight: 1.4,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div
      aria-hidden
      style={{
        flexShrink: 0,
        alignSelf: 'center',
        color: BRAND.colors.primary,
        fontSize: 18,
        fontWeight: BRAND.fontWeight.semibold,
        padding: '0 4px',
      }}
    >
      →
    </div>
  );
}

type TechStack = {
  category: string;
  Icon: typeof IconCode;
  color: string;
  items: string[];
};

const TECH_STACKS: TechStack[] = [
  {
    category: 'Frontend',
    Icon: IconBrandReact,
    color: '#149ECA',
    items: ['React 19', 'Vite', 'TypeScript', 'Ant Design 5', 'React Router'],
  },
  {
    category: 'Backend',
    Icon: IconCoffee,
    color: '#5382A1',
    items: ['Java 17', 'Spring Boot 4.0.5', 'Spring Security · JWT', 'Spring Data JPA', 'AWS SDK v2'],
  },
  {
    category: '진단 엔진',
    Icon: IconBrandPython,
    color: '#3776AB',
    items: ['Python 3.11 · DSC v3.2', 'pandas · scipy', 'Celery 5.4 (chord/group)', 'ResNet18 (이미지)', 'DistilBERT (텍스트)'],
  },
  {
    category: 'RAG · LLM',
    Icon: IconRobot,
    color: '#7A5AF8',
    items: ['FastAPI', 'ChromaDB', 'all-MiniLM-L6-v2', 'Claude Haiku (Anthropic)'],
  },
  {
    category: 'Infra',
    Icon: IconBrandDocker,
    color: '#2496ED',
    items: ['Docker Compose', 'RabbitMQ 3', 'MySQL 8', 'Redis 7', 'LocalStack (S3 dev)', 'AWS EC2 + GH Actions'],
  },
];

type RepoEntry = { path: string; desc: string };

const REPO_TREE: RepoEntry[] = [
  { path: 'frontend/', desc: 'React 19 SPA — 랜딩·업로드·진단 결과·재진단·SSE 클라이언트' },
  { path: 'src/main/java/', desc: 'Spring Boot 4 API — 인증(JWT)·작업·결과·Presigned URL·SSE 알림' },
  { path: 'engine/', desc: 'DSC v3.2 진단 엔진 — Celery chord byte-range 병렬, Bridge(pika→Celery)' },
  { path: 'engine/dsc_cells/', desc: '비정형 셀 — 이미지(ResNet18)·텍스트(DistilBERT) 모달리티별 지표' },
  { path: 'rag-service/', desc: 'FastAPI — ChromaDB 검색 + Claude Haiku 가중치 추천·리포트 생성' },
  { path: 'rag-service/data/docs/', desc: 'RAG 참조 문서 — ISO·Kaggle·기법 가이드·비정형 데이터셋' },
  { path: 'infra/localstack/', desc: 'S3 버킷·CORS·라이프사이클 init 스크립트' },
  { path: 'docker-compose.yml', desc: '로컬 전체 스택 한 번에 기동 (MySQL·RabbitMQ·LocalStack·Redis·RAG·Engine)' },
  { path: 'docs/sessions/', desc: '세션별 설계 기록 — parallel-engine·sse·rag·infra' },
];

type ParallelDesign = {
  badge: string;
  title: string;
  body: string;
};

const PARALLEL_DESIGNS: ParallelDesign[] = [
  {
    badge: '01',
    title: 'byte-range 분산 읽기 — 직렬 분할 제거',
    body: '코디네이터는 파일을 통독하지 않습니다. 헤더 + 흩뿌린 샘플로 전역 통계만 만들고, 각 워커가 S3 Range GET으로 자기 구간만 직접 읽어 처리. 1GB 파일에서도 직렬 준비 단계가 1초 미만이고, 청크 파일을 디스크에 만들지도 않습니다.',
  },
  {
    badge: '02',
    title: 'Celery chord — group + aggregate',
    body: 'group(process_chunk × N) → aggregate_results 콜백. N개 워커가 동시에 부분 지표를 계산하고, 콜백이 합산해 최종 점수를 만듭니다. 파일 크기에 비례하던 진단 시간이 워커 수에 반비례로 줄어듭니다.',
  },
  {
    badge: '03',
    title: 'Sentinel 패턴 — chord hang 방지',
    body: 'process_chunk가 어떤 예외를 만나도 raise 하지 않고 {"_error": ...} sentinel을 반환합니다. 덕분에 청크 하나가 실패해도 chord 콜백은 반드시 실행되어, 작업이 무한 대기 상태에 빠지는 사고가 0건.',
  },
  {
    badge: '04',
    title: '따옴표-줄바꿈 안전 폴백',
    body: 'CSV 따옴표 안에 줄바꿈이 있으면 byte-range로 자를 때 행이 깨질 수 있습니다. 코디네이터가 이를 감지하면 단일 워커 스트리밍 모드(2-패스 reservoir 샘플링)로 자동 폴백 — 속도는 양보해도 정확성을 보장.',
  },
  {
    badge: '05',
    title: '워커 수평확장 — Spring 변경 0',
    body: 'docker compose --scale engine=N 한 줄로 워커를 늘리면 Celery가 자동 분배합니다. 결과 메시지 형식이 기존과 동일하기 때문에 Spring Boot 백엔드는 코드 한 줄도 바뀌지 않습니다.',
  },
];

type OpsCard = {
  Icon: typeof IconShieldLock;
  title: string;
  body: string;
};

const OPS_CARDS: OpsCard[] = [
  {
    Icon: IconShieldLock,
    title: 'HTTPS · TLS 종료 (nginx + Let\'s Encrypt)',
    body: '프론트엔드 nginx에서 TLS를 종료하고 백엔드로는 HTTP로만 전달합니다. HTTP 요청은 자동으로 HTTPS로 리다이렉트되고, Let\'s Encrypt 인증서로 운영 도메인 전체가 암호화 통신.',
  },
  {
    Icon: IconCpu,
    title: '세분화 진단 — groupBreakdown',
    body: '총점만 보여주는 게 아닙니다. 지표별로 어떤 그룹·컬럼에서 점수가 깎였는지 LLM 리포트가 이름과 수치로 단정해 알려줍니다. "어디부터 손대야 하는지" 가 즉시 보입니다.',
  },
  {
    Icon: IconRocket,
    title: 'GitHub Actions CI/CD + EC2 운영',
    body: 'main 브랜치 push 시 자동으로 빌드·테스트·EC2 배포까지 진행됩니다. Elastic IP로 고정된 운영 도메인에서 24/7 서비스 중.',
  },
];

export default function PipelineSection() {
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
            ARCHITECTURE
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
            데이터가 흐르는 길
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            업로드부터 개선 가이드까지 6단계. 무거운 단계는 백엔드에서 비동기·병렬로 돌립니다.
          </p>
        </div>

        <div
          style={{
            background: BRAND.colors.surfaces.subtle,
            borderRadius: 18,
            padding: '28px 24px',
            marginBottom: 28,
          }}
        >
          <Flex
            gap={6}
            align="stretch"
            wrap="wrap"
            justify="space-between"
          >
            {STAGES.map((s, i) => (
              <Flex key={s.label} align="stretch" style={{ flex: '1 1 0', minWidth: 0 }}>
                <StageCard {...s} index={i} />
                {i < STAGES.length - 1 && <Arrow />}
              </Flex>
            ))}
          </Flex>

          <div
            style={{
              marginTop: 18,
              padding: '10px 14px',
              background: '#fff',
              border: `1px dashed ${BRAND.colors.primary}55`,
              borderRadius: 10,
              fontSize: 12,
              color: BRAND.colors.primaryDark,
              textAlign: 'center',
              fontWeight: BRAND.fontWeight.semibold,
            }}
          >
            ↑ 03 품질 측정 ⟷ 04 RAG 검색 — 동시에 실행되어 진단 시간 단축
          </div>
        </div>

        <Flex gap={16} wrap="wrap" align="stretch">
          {PARALLEL_NOTES.map(({ Icon, title, body }) => (
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
                gap: 10,
              }}
            >
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
                <Icon size={18} stroke={2} />
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

        {/* ── 병렬 처리 심층 설계 ── */}
        <div style={{ marginTop: 56 }}>
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
              PARALLEL ENGINE
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
              대용량 파일은 어떻게 빨라지나
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#666',
                margin: 0,
                lineHeight: 1.6,
                maxWidth: 760,
                marginLeft: 'auto',
                marginRight: 'auto',
              }}
            >
              파일이 임계치(<strong style={{ color: BRAND.colors.primaryDark }}>32MB</strong>) 이상이면 자동으로 Celery chord 분산
              파이프라인이 켜집니다. 청크 파일을 미리 만들지 않고, 각 워커가 S3에서 자기 구간만 직접
              읽어 부분 지표를 계산한 뒤 합산합니다.
            </p>
          </div>

          {/* 라우팅 표시 칩 */}
          <Flex gap={12} justify="center" wrap="wrap" style={{ marginBottom: 24 }}>
            <div
              style={{
                background: '#fff',
                border: '1px solid #E8EEF5',
                borderRadius: 999,
                padding: '8px 16px',
                fontSize: BRAND.fontSize.bodySmall,
                color: BRAND.colors.primaryDark,
                fontWeight: BRAND.fontWeight.semibold,
              }}
            >
              <span style={{ opacity: 0.65 }}>{'< 32MB '}</span>→ 단건 처리 (compute_dsc)
            </div>
            <div
              style={{
                background: BRAND.colors.surfaces.cardBlue,
                border: `1px solid ${BRAND.colors.primary}66`,
                borderRadius: 999,
                padding: '8px 16px',
                fontSize: BRAND.fontSize.bodySmall,
                color: BRAND.colors.primary,
                fontWeight: BRAND.fontWeight.bold,
              }}
            >
              ≥ 32MB → chord(group(process_chunk × N) → aggregate_results)
            </div>
          </Flex>

          {/* 5개 설계 카드 */}
          <Flex gap={16} wrap="wrap" align="stretch">
            {PARALLEL_DESIGNS.map(({ badge, title, body }) => (
              <div
                key={badge}
                style={{
                  flex: '1 1 280px',
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <Flex align="center" gap={10}>
                  <span
                    style={{
                      background: BRAND.colors.primary,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      letterSpacing: 0.5,
                      padding: '4px 10px',
                      borderRadius: 6,
                    }}
                  >
                    {badge}
                  </span>
                  <div
                    style={{
                      fontSize: BRAND.fontSize.body,
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primaryDark,
                      lineHeight: 1.4,
                    }}
                  >
                    {title}
                  </div>
                </Flex>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#5A6678',
                    lineHeight: 1.75,
                  }}
                >
                  {body}
                </div>
              </div>
            ))}
          </Flex>

          {/* 메시지 호환성 강조 */}
          <div
            style={{
              marginTop: 18,
              padding: '14px 18px',
              background: BRAND.colors.surfaces.subtle,
              border: `1px dashed ${BRAND.colors.primary}55`,
              borderRadius: 10,
              fontSize: BRAND.fontSize.bodySmall,
              color: BRAND.colors.primaryDark,
              textAlign: 'center',
              lineHeight: 1.6,
            }}
          >
            <strong>결과 메시지 형식 동일</strong> — 병렬 모드 도입 후에도 Spring Boot의 결과 컨슈머는
            한 줄도 바뀌지 않았습니다. 워커는 데이터·메시지 계약만 지키면 자유롭게 진화 가능.
          </div>
        </div>

        {/* ── 운영·신뢰성 보강 ── */}
        <div style={{ marginTop: 56 }}>
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
              OPERATIONS & RELIABILITY
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
              운영 환경에서도 검증된 보강
            </h3>
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
              로컬 개발에서 끝나지 않습니다. 보안·정밀도·배포까지 운영 단계의 디테일도 함께 챙겼습니다.
            </p>
          </div>

          <Flex gap={16} wrap="wrap" align="stretch">
            {OPS_CARDS.map(({ Icon, title, body }) => (
              <div
                key={title}
                style={{
                  flex: '1 1 280px',
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
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
                    lineHeight: 1.4,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#5A6678',
                    lineHeight: 1.75,
                  }}
                >
                  {body}
                </div>
              </div>
            ))}
          </Flex>
        </div>

        {/* ── 기술 스택 ── */}
        <div style={{ marginTop: 56 }}>
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
              TECH STACK
            </div>
            <h3
              style={{
                fontSize: BRAND.fontSize.titleSmall,
                fontWeight: BRAND.fontWeight.semibold,
                color: BRAND.colors.primaryDark,
                margin: 0,
              }}
            >
              5개 계층 · 검증된 오픈소스로 구성
            </h3>
          </div>

          <Flex gap={16} wrap="wrap" align="stretch">
            {TECH_STACKS.map(({ category, Icon, color, items }) => (
              <div
                key={category}
                style={{
                  flex: '1 1 200px',
                  minWidth: 180,
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <Flex align="center" gap={10} style={{ marginBottom: 14 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: `${color}1A`,
                      color,
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
                    {category}
                  </div>
                </Flex>
                <Flex vertical gap={6}>
                  {items.map((item) => (
                    <div
                      key={item}
                      style={{
                        fontSize: BRAND.fontSize.bodySmall,
                        color: '#5A6678',
                        lineHeight: 1.6,
                        paddingLeft: 12,
                        position: 'relative',
                      }}
                    >
                      <span
                        style={{
                          position: 'absolute',
                          left: 0,
                          top: '50%',
                          width: 4,
                          height: 4,
                          borderRadius: '50%',
                          background: color,
                          transform: 'translateY(-50%)',
                        }}
                      />
                      {item}
                    </div>
                  ))}
                </Flex>
              </div>
            ))}
          </Flex>
        </div>

        {/* ── 리포지토리 구조 + GitHub ── */}
        <div style={{ marginTop: 56 }}>
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
              SOURCE CODE
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
              모든 코드는 오픈소스로 공개돼 있습니다
            </h3>
            <p
              style={{
                fontSize: BRAND.fontSize.body,
                color: '#666',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              진단 로직·가중치 추천 프롬프트·서비스 구성 — 숨기는 부분 없이 GitHub에서 확인할 수 있습니다.
            </p>
          </div>

          <Flex gap={20} wrap="wrap" align="stretch">
            {/* 디렉토리 맵 */}
            <div
              style={{
                flex: '2 1 360px',
                background: '#fff',
                border: '1px solid #E8EEF5',
                borderRadius: 14,
                padding: 24,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: BRAND.fontWeight.bold,
                  color: BRAND.colors.primary,
                  letterSpacing: 0.5,
                  marginBottom: 14,
                }}
              >
                REPOSITORY STRUCTURE
              </div>
              <Flex vertical gap={10}>
                {REPO_TREE.map(({ path, desc }) => (
                  <Flex key={path} gap={14} align="flex-start">
                    <code
                      style={{
                        flex: '0 0 auto',
                        background: BRAND.colors.surfaces.subtle,
                        color: BRAND.colors.primaryDark,
                        padding: '3px 10px',
                        borderRadius: 6,
                        fontSize: 12,
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                        fontWeight: BRAND.fontWeight.semibold,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {path}
                    </code>
                    <span
                      style={{
                        fontSize: BRAND.fontSize.bodySmall,
                        color: '#5A6678',
                        lineHeight: 1.6,
                      }}
                    >
                      {desc}
                    </span>
                  </Flex>
                ))}
              </Flex>
            </div>

            {/* GitHub 카드 */}
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: '1 1 240px',
                background: BRAND.colors.primaryDark,
                color: '#fff',
                borderRadius: 14,
                padding: 24,
                textDecoration: 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: 16,
                transition: 'transform 0.15s ease',
              }}
            >
              <div>
                <Flex align="center" gap={10} style={{ marginBottom: 12 }}>
                  <IconBrandGithub size={28} stroke={1.8} />
                  <div
                    style={{
                      fontSize: BRAND.fontSize.subtitle,
                      fontWeight: BRAND.fontWeight.bold,
                    }}
                  >
                    GitHub
                  </div>
                </Flex>
                <div
                  style={{
                    fontSize: BRAND.fontSize.body,
                    lineHeight: 1.6,
                    opacity: 0.92,
                  }}
                >
                  전체 코드 · 이슈 · 변경 이력을 확인하고 직접 클론·실행해볼 수 있습니다.
                </div>
              </div>
              <div
                style={{
                  background: 'rgba(255,255,255,0.12)',
                  padding: '10px 14px',
                  borderRadius: 10,
                  fontSize: 12,
                  fontFamily:
                    'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                  wordBreak: 'break-all',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <IconExternalLink size={14} stroke={2} />
                github.com/jnujh/aidq-platform
              </div>
            </a>
          </Flex>
        </div>

      </div>
    </section>
  );
}
