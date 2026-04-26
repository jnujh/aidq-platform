import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Slider, Button, Typography, Alert, Spin, Divider, message } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import { weightsApi } from '../api/weights';
import { jobsApi } from '../api/jobs';

const { Title, Text, Paragraph } = Typography;

const METRIC_LABELS: Record<string, string> = {
  completeness: '완전성 (결측치)',
  uniqueness: '유일성 (중복)',
  validity: '유효성 (형식)',
  consistency: '일관성 (표현)',
  outlier_ratio: '이상치 비율',
  class_balance: '클래스 균형',
  feature_correlation: '피처 상관관계',
  value_accuracy: '값 정확성',
};

const DEFAULT_WEIGHTS: Record<string, number> = {
  completeness: 0.20, uniqueness: 0.15, validity: 0.10,
  consistency: 0.10, outlier_ratio: 0.05,
  class_balance: 0.05, feature_correlation: 0.05,
  value_accuracy: 0.30,
};

interface UploadState {
  file: File;
  jobName?: string;
  purpose?: string;
}

export default function WeightsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const uploadState = location.state as UploadState | null;

  const [weights, setWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS);
  const [reasoning, setReasoning] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [recommending, setRecommending] = useState(false);
  const [recommended, setRecommended] = useState(false);

  useEffect(() => {
    if (!uploadState) {
      navigate('/jobs/upload');
      return;
    }

    if (uploadState.purpose) {
      fetchRecommendation(uploadState.purpose);
    }
  }, []);

  const fetchRecommendation = async (purpose: string) => {
    setRecommending(true);
    try {
      const res = await weightsApi.recommend(purpose);
      setWeights(res.data.data.weights);
      setReasoning(res.data.data.reasoning);
      setRecommended(true);
    } catch {
      message.warning('가중치 추천에 실패했습니다. 기본 가중치를 사용합니다.');
    } finally {
      setRecommending(false);
    }
  };

  const handleSliderChange = (metric: string, value: number) => {
    setWeights(prev => ({ ...prev, [metric]: value / 100 }));
  };

  const handleSubmit = async (useWeights: Record<string, number>) => {
    if (!uploadState) return;
    setLoading(true);
    try {
      await jobsApi.submit(uploadState.file, uploadState.jobName, uploadState.purpose);
      message.success('진단이 시작되었습니다.');
      navigate('/jobs');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || '업로드에 실패했습니다.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const totalWeight = Object.values(weights).reduce((sum, v) => sum + v, 0);

  if (!uploadState) return null;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <Title level={4}>
        <ExperimentOutlined /> 평가지표 가중치 설정
      </Title>

      {recommending ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
          <Paragraph style={{ marginTop: 16 }}>LLM이 사용 목적을 분석 중입니다...</Paragraph>
        </div>
      ) : (
        <>
          {recommended && reasoning && (
            <Alert
              type="info"
              showIcon
              message="LLM 추천 이유"
              description={reasoning}
              style={{ marginBottom: 24 }}
            />
          )}

          <Card>
            {Object.entries(METRIC_LABELS).map(([key, label]) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text>{label}</Text>
                  <Text strong>{Math.round((weights[key] || 0) * 100)}%</Text>
                </div>
                <Slider
                  min={0}
                  max={100}
                  value={Math.round((weights[key] || 0) * 100)}
                  onChange={(v) => handleSliderChange(key, v)}
                  tooltip={{ formatter: (v) => `${v}%` }}
                />
              </div>
            ))}

            <Divider />

            <div style={{ textAlign: 'center' }}>
              <Text type={Math.abs(totalWeight - 1.0) < 0.01 ? 'success' : 'danger'}>
                합계: {Math.round(totalWeight * 100)}%
                {Math.abs(totalWeight - 1.0) >= 0.01 && ' (합계가 100%가 되어야 합니다)'}
              </Text>
            </div>
          </Card>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'center' }}>
            <Button
              type="primary"
              size="large"
              onClick={() => handleSubmit(weights)}
              loading={loading}
              disabled={Math.abs(totalWeight - 1.0) >= 0.01}
            >
              이 설정으로 진단 시작
            </Button>
            <Button
              size="large"
              onClick={() => handleSubmit(DEFAULT_WEIGHTS)}
              loading={loading}
            >
              기본 가중치로 진단
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
