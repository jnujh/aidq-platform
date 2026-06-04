import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Slider, Button, Typography, Spin, Divider, message } from 'antd';
import { ExperimentOutlined } from '@ant-design/icons';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { weightsApi } from '../api/weights';
import { uploadsApi } from '../api/uploads';
import { getErrorMessage } from '../utils/errorHandler';

const { Title, Text, Paragraph } = Typography;

// 모달리티별 지표 라벨 (엔진/RAG 지표 키와 일치).
const METRIC_LABELS_BY_TYPE: Record<string, Record<string, string>> = {
  tabular: {
    completeness: '완전성 (결측치)', uniqueness: '유일성 (중복)', validity: '유효성 (형식)',
    consistency: '일관성 (표현)', outlier_ratio: '이상치 비율', class_balance: '클래스 균형',
    feature_correlation: '피처 상관관계', value_accuracy: '값 정확성',
  },
  image: {
    completeness_image: '완전성 (마스킹)', uniqueness: '유일성 (중복)', validity: '유효성 (로드)',
    consistency: '일관성 (색/크기)', outlier_ratio: '이상치 (밝기)', class_balance: '클래스 균형',
    feature_correlation: '피처 상관', label_consistency: '라벨 일관성',
    feature_informativeness: '피처 정보량', sample_quality_image: '이미지 품질(블러/대비)',
  },
  text: {
    completeness_text: '완전성 (토큰)', uniqueness: '유일성 (중복)', validity: '유효성 (인코딩)',
    consistency: '일관성 (길이분포)', outlier_ratio: '이상치 (길이)', class_balance: '클래스 균형',
    feature_correlation: '피처 상관', label_consistency: '라벨 일관성',
    feature_informativeness: '피처 정보량', sample_quality_text: '텍스트 품질(TTR/길이)',
  },
};

// 모달리티별 기본 가중치 (엔진 DEFAULT_WEIGHTS_* 와 동일, 합계 1.0).
const DEFAULT_WEIGHTS_BY_TYPE: Record<string, Record<string, number>> = {
  tabular: {
    completeness: 0.20, uniqueness: 0.15, validity: 0.10, consistency: 0.10,
    outlier_ratio: 0.05, class_balance: 0.05, feature_correlation: 0.05, value_accuracy: 0.30,
  },
  image: {
    completeness_image: 0.15, uniqueness: 0.10, validity: 0.05, consistency: 0.05,
    outlier_ratio: 0.05, class_balance: 0.10, feature_correlation: 0.05,
    label_consistency: 0.20, feature_informativeness: 0.10, sample_quality_image: 0.15,
  },
  text: {
    completeness_text: 0.15, uniqueness: 0.10, validity: 0.05, consistency: 0.05,
    outlier_ratio: 0.05, class_balance: 0.10, feature_correlation: 0.05,
    label_consistency: 0.20, feature_informativeness: 0.10, sample_quality_text: 0.15,
  },
};

interface UploadState {
  s3Key: string;
  originalFilename: string;
  jobName?: string;
  purpose?: string;
  dataType?: string;       // 'tabular' | 'image' | 'text'
  textColumn?: string;
  labelColumn?: string;
}

export default function WeightsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const uploadState = location.state as UploadState | null;

  const modality = uploadState?.dataType || 'tabular';
  const METRIC_LABELS = METRIC_LABELS_BY_TYPE[modality] ?? METRIC_LABELS_BY_TYPE.tabular;
  const DEFAULT_WEIGHTS = DEFAULT_WEIGHTS_BY_TYPE[modality] ?? DEFAULT_WEIGHTS_BY_TYPE.tabular;

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
      const fetchRecommendation = async (purpose: string) => {
        setRecommending(true);
        try {
          const res = await weightsApi.recommend(purpose, modality);
          setWeights(res.data.data.weights);
          setReasoning(res.data.data.reasoning);
          setRecommended(true);
        } catch {
          message.warning('가중치 추천에 실패했습니다. 기본 가중치를 사용합니다.');
        } finally {
          setRecommending(false);
        }
      };
      fetchRecommendation(uploadState.purpose);
    }
  }, [uploadState, navigate]);

  const handleSliderChange = (metric: string, value: number) => {
    setWeights(prev => ({ ...prev, [metric]: value / 100 }));
  };

  const handleSubmit = async (useWeights: Record<string, number>) => {
    if (!uploadState) return;
    setLoading(true);
    try {
      const spec =
        modality === 'tabular'
          ? undefined
          : {
              dataType: modality,
              ...(uploadState.textColumn ? { textColumn: uploadState.textColumn } : {}),
              ...(uploadState.labelColumn ? { labelColumn: uploadState.labelColumn } : {}),
            };
      await uploadsApi.startJob(
        uploadState.s3Key, uploadState.originalFilename, uploadState.jobName,
        uploadState.purpose, useWeights, spec,
      );
      message.success('맞춤 가중치로 진단이 시작되었습니다.');
      navigate('/jobs');
    } catch (err) {
      message.error(getErrorMessage(err, '업로드에 실패했습니다.'));
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
            <Card
              title="평가지표 가중치 설정 가이드"
              style={{ marginBottom: 24, background: '#f0f5ff', border: '1px solid #adc6ff' }}
            >
              <div className="markdown-content" style={{ lineHeight: 1.85, fontSize: '15px' }}>
                <Markdown remarkPlugins={[remarkGfm]}>{reasoning}</Markdown>
              </div>
            </Card>
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
