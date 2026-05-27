import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Descriptions,
  Form,
  Input,
  Progress,
  Result,
  Spin,
  Typography,
  Upload,
  message,
} from 'antd';
import { InboxOutlined, ReloadOutlined } from '@ant-design/icons';
import type { UploadFile } from 'antd';
import { jobsApi, type JobStatusResponse } from '../api/jobs';
import { uploadsApi } from '../api/uploads';
import { BRAND } from '../config/brand';

const { Dragger } = Upload;
const { Title, Paragraph, Text } = Typography;

export default function RetryPage() {
  const { parentJobId } = useParams<{ parentJobId: string }>();
  const navigate = useNavigate();
  const parentIdNum = Number(parentJobId);

  const [parent, setParent] = useState<JobStatusResponse | null>(null);
  const invalidId = !Number.isFinite(parentIdNum);
  const [loading, setLoading] = useState(!invalidId);
  const [loadError, setLoadError] = useState<string | null>(invalidId ? '잘못된 작업 ID 입니다.' : null);

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [jobName, setJobName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  useEffect(() => {
    if (!Number.isFinite(parentIdNum)) {
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await jobsApi.getStatus(parentIdNum);
        if (cancelled) return;
        setParent(res.data.data);
        // 기본 작업명 후보: 부모 jobName + "(재진단)"
        if (res.data.data.jobName) {
          setJobName(`${res.data.data.jobName} (재진단)`);
        }
      } catch (err: unknown) {
        if (cancelled) return;
        const axiosErr = err as { response?: { data?: { error?: { code?: string; message?: string } } } };
        const code = axiosErr.response?.data?.error?.code;
        if (code === 'JOB_NOT_FOUND') setLoadError('존재하지 않는 작업입니다.');
        else if (code === 'FORBIDDEN') setLoadError('이 작업에 접근할 권한이 없습니다.');
        else setLoadError(axiosErr.response?.data?.error?.message || '부모 작업 정보를 불러오지 못했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [parentIdNum]);

  const handleRetry = async () => {
    if (fileList.length === 0) {
      message.warning('새로 진단할 파일을 선택해주세요.');
      return;
    }
    if (!parent) return;

    if (parent.status !== 'DONE') {
      message.error('완료된 작업에 대해서만 재진단이 가능합니다.');
      return;
    }

    const file = (fileList[0] as unknown as { originFileObj: File }).originFileObj;
    setSubmitting(true);
    setUploadPercent(0);
    try {
      // 1) Presigned URL 발급
      const presignRes = await uploadsApi.presign(file.name, file.type || 'application/octet-stream');
      const { uploadUrl, s3Key } = presignRes.data.data;

      // 2) S3에 직접 업로드
      await uploadsApi.uploadToS3(uploadUrl, file, (percent) => setUploadPercent(percent));

      // 3) 재진단 시작
      const res = await uploadsApi.retryStart(
        parentIdNum,
        s3Key,
        file.name,
        jobName.trim() || undefined,
      );
      message.success('재진단이 시작되었습니다.');
      navigate(`/results/${res.data.data.jobId}`);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: { code?: string; message?: string } } } };
      const code = axiosErr.response?.data?.error?.code;
      if (code === 'EMPTY_FILE') message.error('빈 파일은 업로드할 수 없습니다.');
      else if (code === 'JOB_PARENT_NOT_COMPLETED') {
        message.error('완료된 작업에 대해서만 재진단이 가능합니다.');
      } else {
        message.error(axiosErr.response?.data?.error?.message || '재진단 요청에 실패했습니다.');
      }
    } finally {
      setSubmitting(false);
      setUploadPercent(0);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 80 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (loadError || !parent) {
    return (
      <Result
        status="info"
        title={loadError ?? '부모 작업 정보를 찾을 수 없습니다.'}
        extra={
          <Button type="primary" onClick={() => navigate('/jobs')}>
            작업 목록으로 돌아가기
          </Button>
        }
      />
    );
  }

  const weightEntries = parent.weights
    ? Object.entries(parent.weights)
    : [];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <Title level={4} style={{ marginBottom: 8, color: BRAND.colors.primaryDark }}>
        진단 재시도
      </Title>
      <Paragraph type="secondary" style={{ marginBottom: 24 }}>
        부모 진단과 <Text strong>동일한 평가지표 및 가중치</Text>로 새 파일을 진단합니다.
        결과는 부모와 나란히 비교됩니다.
      </Paragraph>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
        message="가중치는 부모 진단의 값을 그대로 사용합니다"
        description="동일 조건에서 데이터 개선의 효과를 측정하기 위해 가중치·사용 목적은 수정할 수 없습니다."
      />

      <Descriptions
        title="부모 진단 정보 (읽기 전용)"
        bordered
        column={1}
        size="small"
        style={{ marginBottom: 16 }}
        labelStyle={{ width: 160, background: BRAND.colors.surfaces.subtle }}
      >
        <Descriptions.Item label="부모 작업 ID">{parent.jobId}</Descriptions.Item>
        {parent.jobName && (
          <Descriptions.Item label="부모 작업 이름">{parent.jobName}</Descriptions.Item>
        )}
        <Descriptions.Item label="원본 파일">{parent.originalFilename}</Descriptions.Item>
        <Descriptions.Item label="사용 목적">
          {parent.purpose || <Text type="secondary">— 미입력 —</Text>}
        </Descriptions.Item>
        <Descriptions.Item label="가중치">
          {weightEntries.length === 0 ? (
            <Text type="secondary">기본 가중치 사용</Text>
          ) : (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {weightEntries.map(([k, v]) => (
                <span
                  key={k}
                  style={{
                    background: BRAND.colors.badges.purposeA.bg,
                    color: BRAND.colors.badges.purposeA.text,
                    padding: '4px 10px',
                    borderRadius: 999,
                    fontSize: 12,
                  }}
                >
                  {k} · {(v * 100).toFixed(0)}%
                </span>
              ))}
            </div>
          )}
        </Descriptions.Item>
      </Descriptions>

      <Form layout="vertical" style={{ marginTop: 24 }}>
        <Form.Item label="새 작업 이름 (선택)">
          <Input
            placeholder="예: 이탈 분석 (재진단)"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            size="large"
          />
        </Form.Item>

        <Form.Item label="새 데이터 파일">
          <Dragger
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList }) => setFileList(fileList.slice(-1))}
            maxCount={1}
            accept=".csv,.xlsx,.xls,.json"
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">파일을 드래그하거나 클릭하여 선택하세요</p>
            <p className="ant-upload-hint">CSV, Excel, JSON 파일을 지원합니다.</p>
          </Dragger>
        </Form.Item>
      </Form>

      {submitting && uploadPercent > 0 && (
        <Progress percent={uploadPercent} status="active" style={{ marginBottom: 16 }} />
      )}

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 16 }}>
        <Button onClick={() => navigate(`/results/${parent.jobId}`)}>
          부모 결과로 돌아가기
        </Button>
        <Button
          type="primary"
          size="large"
          icon={<ReloadOutlined />}
          onClick={handleRetry}
          loading={submitting}
          disabled={fileList.length === 0}
        >
          재진단 시작
        </Button>
      </div>
    </div>
  );
}
