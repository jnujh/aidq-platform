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
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

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
    title: '비동기 작업 큐 + 폴링',
    body: '업로드 즉시 작업 ID 발급, 무거운 진단은 백엔드에서 처리, 프론트는 결과만 폴링 — 사용자는 기다리지 않고 다른 작업 가능.',
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
      </div>
    </section>
  );
}
