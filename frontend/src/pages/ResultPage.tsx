import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Divider,
  Flex,
  Result,
  Spin,
  Typography,
} from 'antd';
import { FileTextOutlined, ReloadOutlined } from '@ant-design/icons';
import Markdown from 'react-markdown';
import { resultsApi, type JobResultResponse, type ParentResultDto } from '../api/results';
import { getErrorCode, getErrorMessage } from '../utils/errorHandler';
import { BRAND } from '../config/brand';
import ScoreDonut from '../components/charts/ScoreDonut';
import MetricBarList, { type MetricItem } from '../components/charts/MetricBarList';

const { Title, Paragraph, Text } = Typography;

type ParsedMetric = {
  label: string;
  score: number;
  weight?: number;
};

// 워커가 만든 결과 JSON 구조는 영역 외(RAG/워커). 흔한 두 형태를 방어적으로 수용:
//   (1) { metrics: [{label, score, weight?}, ...] }  / 키 이름은 name 또는 key 도 허용
//   (2) { scores: { label1: 92, label2: 85, ... } }
// 어느 쪽도 아니면 빈 배열을 반환하여 막대 없이 totalScore 만 표시.
function parseMetrics(rawJson: string | null): ParsedMetric[] {
  if (!rawJson) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return [];
  }
  if (!parsed || typeof parsed !== 'object') return [];
  const obj = parsed as Record<string, unknown>;

  const metricsArr = (obj.metrics ?? obj.items ?? obj.details) as unknown;
  if (Array.isArray(metricsArr)) {
    return metricsArr
      .map((m): ParsedMetric | null => {
        if (!m || typeof m !== 'object') return null;
        const row = m as Record<string, unknown>;
        const label = (row.label ?? row.name ?? row.key) as unknown;
        const score = (row.score ?? row.value) as unknown;
        const weight = row.weight as unknown;
        if (typeof label !== 'string' || typeof score !== 'number') return null;
        return {
          label,
          score,
          weight: typeof weight === 'number' ? weight : undefined,
        };
      })
      .filter((x): x is ParsedMetric => x !== null);
  }

  const scoresObj = (obj.scores ?? obj.metric_scores) as unknown;
  if (scoresObj && typeof scoresObj === 'object') {
    return Object.entries(scoresObj as Record<string, unknown>)
      .filter(([, v]) => typeof v === 'number')
      .map(([k, v]) => ({ label: k, score: v as number }));
  }

  return [];
}

function formatWeight(weight: number | undefined): string | undefined {
  if (weight === undefined) return undefined;
  if (weight <= 1) return `${Math.round(weight * 100)}%`;
  return `${Math.round(weight)}%`;
}

function toMetricItems(metrics: ParsedMetric[]): MetricItem[] {
  return metrics.map((m) => ({
    label: m.label,
    score: m.score,
    weight: formatWeight(m.weight),
    color: m.score >= 80 ? 'primary' : m.score >= 60 ? 'muted' : 'warning',
  }));
}

function toComparisonItems(
  before: ParsedMetric[],
  after: ParsedMetric[],
): MetricItem[] {
  const beforeMap = new Map(before.map((m) => [m.label, m]));
  return after.map((m) => {
    const prev = beforeMap.get(m.label);
    const delta = prev !== undefined ? m.score - prev.score : null;
    const color: MetricItem['color'] =
      delta === null
        ? 'muted'
        : delta > 0
          ? 'positive'
          : delta < 0
            ? 'negative'
            : 'muted';
    const deltaText =
      delta === null
        ? undefined
        : delta > 0
          ? `+${delta.toFixed(0)}`
          : delta === 0
            ? '±0'
            : `${delta.toFixed(0)}`;
    return {
      label: m.label,
      score: m.score,
      weight: formatWeight(m.weight),
      color,
      delta: deltaText,
    };
  });
}

export default function ResultPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<JobResultResponse | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await resultsApi.getResult(Number(jobId));
        if (cancelled) return;
        setResult(res.data.data);

        if (res.data.data.reportS3Key) {
          try {
            const reportRes = await resultsApi.getReport(Number(jobId));
            if (!cancelled) setReport(reportRes.data.data);
          } catch {
            // 리포트 없어도 결과는 표시
          }
        }
      } catch (err) {
        if (cancelled) return;
        const code = getErrorCode(err);
        if (code === 'JOB_NOT_COMPLETED') {
          setError('진단이 아직 진행 중입니다. 잠시 후 다시 확인해주세요.');
        } else if (code === 'JOB_NOT_FOUND') {
          setError('존재하지 않는 작업입니다.');
        } else {
          setError(getErrorMessage(err, '결과를 불러오는데 실패했습니다.'));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  const childMetrics = useMemo(
    () => parseMetrics(result?.resultDetail ?? null),
    [result],
  );
  const parentMetrics = useMemo(
    () => parseMetrics(result?.parent?.resultDetail ?? null),
    [result],
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <Result
        status="info"
        title={error}
        extra={
          <Button type="primary" onClick={() => navigate('/jobs')}>
            작업 목록으로 돌아가기
          </Button>
        }
      />
    );
  }

  if (!result) return null;

  const score = Number(result.totalScore);
  const isRetryChild = !!result.parent;
  const cardBase = {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
  } as const;

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto' }}>
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap={12}
        style={{ marginBottom: 16 }}
      >
        <div>
          <Title level={4} style={{ margin: 0, color: BRAND.colors.primaryDark }}>
            진단 결과
          </Title>
          <Text type="secondary">
            작업 ID #{result.jobId}
            {isRetryChild && (
              <> · 부모 #{result.parent!.jobId} 의 재진단</>
            )}
            {' · '}
            {new Date(result.createdAt).toLocaleString('ko-KR')}
          </Text>
        </div>
        <Button
          type="primary"
          icon={<ReloadOutlined />}
          onClick={() => navigate(`/jobs/${result.jobId}/retry`)}
        >
          이 데이터를 개선해서 재진단
        </Button>
      </Flex>

      {isRetryChild ? (
        <ComparisonSection
          parent={result.parent!}
          afterScore={score}
          parentMetrics={parentMetrics}
          childMetrics={childMetrics}
          cardBase={cardBase}
        />
      ) : (
        <SingleResultSection
          score={score}
          metrics={childMetrics}
          cardBase={cardBase}
        />
      )}

      {report && (
        <>
          <Divider />
          <Card
            title={<><FileTextOutlined /> LLM 분석 리포트</>}
            style={{ marginTop: 24, borderRadius: 12 }}
          >
            <div style={{
              lineHeight: 1.8,
              fontSize: 14,
            }}>
              <Markdown>{report}</Markdown>
            </div>
          </Card>
        </>
      )}

      {!report && result.reportS3Key === null && (
        <>
          <Divider />
          <Card style={{ marginTop: 24, textAlign: 'center', borderRadius: 12 }}>
            <Paragraph type="secondary">
              LLM 리포트가 아직 생성되지 않았습니다.
            </Paragraph>
          </Card>
        </>
      )}

      <div style={{ marginTop: 24 }}>
        <Button onClick={() => navigate('/jobs')}>작업 목록으로</Button>
      </div>
    </div>
  );
}

type CardBase = { background: string; borderRadius: number; padding: number };

function SingleResultSection({
  score,
  metrics,
  cardBase,
}: {
  score: number;
  metrics: ParsedMetric[];
  cardBase: CardBase;
}) {
  const items = toMetricItems(metrics);
  return (
    <div
      style={{
        background: BRAND.colors.surfaces.subtle,
        borderRadius: 16,
        padding: 20,
      }}
    >
      <Flex gap={20} align="stretch" wrap="wrap">
        <div
          style={{
            ...cardBase,
            flex: 1,
            minWidth: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ScoreDonut score={score} caption="TOTAL SCORE" />
        </div>
        <div
          style={{
            ...cardBase,
            flex: 1.6,
            minWidth: 320,
          }}
        >
          {items.length > 0 ? (
            <MetricBarList title="항목별 점수" items={items} />
          ) : (
            <Text type="secondary">항목별 점수 데이터가 없습니다.</Text>
          )}
        </div>
      </Flex>
    </div>
  );
}

function ComparisonSection({
  parent,
  afterScore,
  parentMetrics,
  childMetrics,
  cardBase,
}: {
  parent: ParentResultDto;
  afterScore: number;
  parentMetrics: ParsedMetric[];
  childMetrics: ParsedMetric[];
  cardBase: CardBase;
}) {
  const beforeScore = Number(parent.totalScore);
  const totalDelta = afterScore - beforeScore;
  const comparisonItems = toComparisonItems(parentMetrics, childMetrics);
  const canCompareMetrics = comparisonItems.length > 0;

  const deltaColor =
    totalDelta > 0
      ? BRAND.colors.highlights.success.text
      : totalDelta < 0
        ? '#D24545'
        : '#666';
  const deltaLabel =
    totalDelta > 0
      ? `+${totalDelta.toFixed(1)}점 개선`
      : totalDelta < 0
        ? `${totalDelta.toFixed(1)}점 하락`
        : '변화 없음';

  return (
    <div
      style={{
        background: BRAND.colors.surfaces.subtle,
        borderRadius: 16,
        padding: 20,
      }}
    >
      <Alert
        type="info"
        showIcon
        message="부모 진단과 동일한 평가지표·가중치로 비교 중"
        style={{ marginBottom: 16 }}
      />

      <Flex gap={20} align="stretch" wrap="wrap" style={{ marginBottom: 20 }}>
        <div
          style={{
            ...cardBase,
            flex: 1,
            minWidth: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ScoreDonut
            score={beforeScore}
            caption={`BEFORE  ·  #${parent.jobId}`}
            accentColor="#9AA5B4"
          />
        </div>
        <div
          style={{
            ...cardBase,
            flex: 1,
            minWidth: 240,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <ScoreDonut
            score={afterScore}
            caption="AFTER"
            accentColor={BRAND.colors.primary}
          />
        </div>
        <div
          style={{
            ...cardBase,
            flex: 0.8,
            minWidth: 200,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <Text type="secondary" style={{ fontSize: 12, letterSpacing: 0.5 }}>
            CHANGE
          </Text>
          <div
            style={{
              fontSize: 32,
              fontWeight: BRAND.fontWeight.semibold,
              color: deltaColor,
              lineHeight: 1,
            }}
          >
            {totalDelta > 0 ? `+${totalDelta.toFixed(1)}` : totalDelta.toFixed(1)}
          </div>
          <Text style={{ color: deltaColor, fontWeight: BRAND.fontWeight.semibold }}>
            {deltaLabel}
          </Text>
        </div>
      </Flex>

      <div style={{ ...cardBase }}>
        {canCompareMetrics ? (
          <MetricBarList
            title="항목별 변화 (After 기준 · 괄호는 부모 대비 증감)"
            items={comparisonItems}
          />
        ) : (
          <Text type="secondary">
            항목별 점수 데이터가 부족하여 비교 막대를 표시할 수 없습니다.
          </Text>
        )}
      </div>
    </div>
  );
}
