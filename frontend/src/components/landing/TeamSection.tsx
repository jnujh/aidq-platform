import { Flex } from 'antd';
import {
  IconCpu,
  IconDeviceLaptop,
  IconServer2,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

type Member = {
  Icon: typeof IconCpu;
  name: string;
  role: string;
  stack: string;
  summary: string;
  highlights: string[];
};

const MEMBERS: Member[] = [
  {
    Icon: IconCpu,
    name: '고준서',
    role: '데이터 품질 진단 엔진',
    stack: 'Python · pandas · scipy · DSC v3.2',
    summary:
      '데이터의 사용 목적(분류·회귀·시계열 등)을 반영한 DSC(Data Score Card) 진단 엔진을 설계·구현했습니다. 8개 품질 지표를 ISO/IEC 25012·5259 표준에 매핑해 산출합니다.',
    highlights: [
      'DSC Engine v3.2 — ISO/IEC 25012·5259에 매핑된 8개 품질 지표 알고리즘 설계 및 구현',
      '435회 ML 학습 실험으로 사후 검증 — DSC ↔ F1 Pearson r = 0.598 (p < 1e-43) 통계 입증',
      '정형·이미지·텍스트 × 분류·회귀 모달리티별 9~10개 지표로 분기 (병렬 청크 합산 가능 구조)',
    ],
  },
  {
    Icon: IconDeviceLaptop,
    name: '김동훈',
    role: '프론트엔드 · UI/UX',
    stack: 'React 19 · TypeScript · Vite · Ant Design 5',
    summary:
      '메인 랜딩 페이지와 12개 sub 페이지(Platform/Solutions/Research/Company)를 B2B SaaS 톤으로 설계·구현했습니다. 디자인 토큰 시스템과 콘텐츠 구성을 담당했습니다.',
    highlights: [
      '메인 랜딩 + Platform/Solutions/Research/Company 12개 sub 페이지 — B2B SaaS 톤 설계·구현',
      'BRAND 디자인 토큰(neutral palette · ink hierarchy) + 메가메뉴 + 단독 페이지 라우팅',
      'ResultPage 자동 폴링(JOB_NOT_COMPLETED) · 한국 공공데이터 CP949 인코딩 호환',
    ],
  },
  {
    Icon: IconServer2,
    name: '이지훈',
    role: '백엔드 · 인프라 · RAG',
    stack: 'Spring Boot · Celery · ChromaDB · Docker · AWS',
    summary:
      '웹 플랫폼 백엔드와 병렬 진단 인프라, RAG 서비스를 구축했습니다. Presigned URL 업로드, Celery chord 병렬 처리, 실시간 SSE, HTTPS 운영까지 끝단을 책임집니다.',
    highlights: [
      'Spring Boot 4 + JWT 인증 + Presigned URL 직접 업로드 (서버 우회 → S3)',
      'Celery chord 병렬 진단 + 비정형 map-reduce + byte-range 분산 (워커 수평확장 --scale)',
      'RAG 서비스 — ChromaDB + Claude Haiku 하이브리드 + SSE 실시간 알림 + HTTPS 운영',
    ],
  },
];

export default function TeamSection() {
  return (
    <section
      style={{
        padding: '72px 40px',
        background: BRAND.colors.neutral.page,
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto' }}>
        {/* 헤더 */}
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
            Team Members
          </div>
          <h2
            style={{
              fontSize: 36,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.ink,
              margin: 0,
              marginBottom: 18,
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
            }}
          >
            세 명이 함께 만든 Scorecard
          </h2>
          <p
            style={{
              fontSize: 16,
              color: BRAND.colors.inkMuted,
              margin: 0,
              lineHeight: 1.75,
              maxWidth: 680,
              marginLeft: 'auto',
              marginRight: 'auto',
              wordBreak: 'keep-all',
            }}
          >
            진단 엔진 · 프론트엔드 · 백엔드/인프라
            <br />
            — 각자 한 영역을 끝까지 책임지고, 공통의 인터페이스 계약 위에서 합쳐 만든 결과물입니다.
          </p>
        </div>

        {/* 멤버 카드 */}
        <Flex vertical gap={24}>
          {MEMBERS.map(({ Icon, name, role, stack, summary, highlights }, idx) => (
            <div
              key={name}
              style={{
                background: BRAND.colors.neutral.cardBg,
                border: `1px solid ${BRAND.colors.neutral.border}`,
                borderRadius: 14,
                overflow: 'hidden',
              }}
            >
              <Flex wrap="wrap" align="stretch">
                {/* 좌측: 아바타 + 이름 + 역할 */}
                <div
                  style={{
                    flex: '1 1 280px',
                    minWidth: 260,
                    background: BRAND.colors.neutral.surface,
                    padding: '36px 36px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 18,
                    borderRight: `1px solid ${BRAND.colors.neutral.border}`,
                  }}
                >
                  <Flex align="center" gap={16}>
                    <div
                      style={{
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        background: BRAND.colors.neutral.cardBg,
                        color: BRAND.colors.primary,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${BRAND.colors.neutral.border}`,
                      }}
                    >
                      <Icon size={28} stroke={1.6} />
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
                  <div>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: BRAND.fontWeight.semibold,
                        color: BRAND.colors.ink,
                        marginBottom: 6,
                        letterSpacing: '-0.02em',
                      }}
                    >
                      {name}
                    </div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: BRAND.fontWeight.semibold,
                        color: BRAND.colors.primary,
                        marginBottom: 14,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {role}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: BRAND.colors.inkSoft,
                        lineHeight: 1.65,
                        fontFamily:
                          'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                        letterSpacing: 0,
                      }}
                    >
                      {stack}
                    </div>
                  </div>
                </div>

                {/* 우측: 요약 + 하이라이트 */}
                <div
                  style={{
                    flex: '1.6 1 420px',
                    minWidth: 320,
                    padding: '36px 40px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 20,
                    wordBreak: 'keep-all',
                  }}
                >
                  <p
                    style={{
                      fontSize: 15,
                      color: BRAND.colors.ink,
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {summary}
                  </p>
                  <div
                    style={{
                      fontSize: 10,
                      color: BRAND.colors.inkSoft,
                      fontWeight: BRAND.fontWeight.semibold,
                      letterSpacing: 2.5,
                      textTransform: 'uppercase',
                    }}
                  >
                    Key Contributions
                  </div>
                  <Flex vertical gap={10}>
                    {highlights.map((h, i) => (
                      <Flex key={i} gap={12} align="flex-start">
                        <div
                          style={{
                            flex: '0 0 auto',
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            background: BRAND.colors.neutral.surface,
                            color: BRAND.colors.primary,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 10,
                            fontWeight: BRAND.fontWeight.semibold,
                            border: `1px solid ${BRAND.colors.neutral.border}`,
                            marginTop: 2,
                          }}
                        >
                          {i + 1}
                        </div>
                        <div
                          style={{
                            fontSize: 13.5,
                            color: BRAND.colors.inkMuted,
                            lineHeight: 1.7,
                          }}
                        >
                          {h}
                        </div>
                      </Flex>
                    ))}
                  </Flex>
                </div>
              </Flex>
            </div>
          ))}
        </Flex>

        {/* 푸터 메시지 */}
        <div
          style={{
            marginTop: 40,
            padding: '24px 32px',
            background: BRAND.colors.neutral.surface,
            borderLeft: `3px solid ${BRAND.colors.primary}`,
            fontSize: 14,
            color: BRAND.colors.inkMuted,
            lineHeight: 1.75,
            wordBreak: 'keep-all',
          }}
        >
          <strong style={{ color: BRAND.colors.ink, fontWeight: BRAND.fontWeight.semibold }}>
            인터페이스 계약 우선
          </strong>{' '}
          — 엔진은 Celery 결과 메시지 포맷, 백엔드는 RabbitMQ/SSE 이벤트 스키마,
          프론트는 API 응답 envelope. 세 영역이 같은 계약 위에서 독립적으로 진화할 수
          있도록 설계했습니다.
        </div>
      </div>
    </section>
  );
}
