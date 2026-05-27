import { useState } from 'react';
import { Upload, Button, message, Typography, Input, Form, Progress } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { uploadsApi } from '../api/uploads';
import { getErrorMessage } from '../utils/errorHandler';
import type { UploadFile } from 'antd';

const { Dragger } = Upload;
const { Text } = Typography;
const { TextArea } = Input;

export default function UploadPage() {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [jobName, setJobName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('파일을 선택해주세요.');
      return;
    }

    const file = (fileList[0] as unknown as { originFileObj: File }).originFileObj;
    setLoading(true);
    setUploadPercent(0);

    try {
      // 1) Presigned URL 발급
      const presignRes = await uploadsApi.presign(file.name, file.type || 'application/octet-stream');
      const { uploadUrl, s3Key } = presignRes.data.data;

      // 2) S3에 직접 업로드 (진행률 표시)
      await uploadsApi.uploadToS3(uploadUrl, file, (percent) => setUploadPercent(percent));

      if (purpose) {
        // 사용 목적이 있으면 → 가중치 추천 화면으로 이동
        navigate('/jobs/weights', {
          state: {
            s3Key,
            originalFilename: file.name,
            jobName: jobName || undefined,
            purpose,
          },
        });
      } else {
        // 사용 목적이 없으면 → 바로 기본 가중치로 진단
        await uploadsApi.startJob(s3Key, file.name, jobName || undefined);
        message.success('파일 업로드 성공! 진단이 시작됩니다.');
        navigate('/jobs');
      }
    } catch (err) {
      message.error(getErrorMessage(err, '파일 업로드에 실패했습니다.'));
    } finally {
      setLoading(false);
      setUploadPercent(0);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Form layout="vertical">
        <Form.Item label="작업 이름">
          <Input
            placeholder="예: 고객 이탈 분석용 데이터"
            value={jobName}
            onChange={(e) => setJobName(e.target.value)}
            size="large"
          />
        </Form.Item>

        <Form.Item label="사용 목적">
          <TextArea
            placeholder="예: 이 데이터로 고객 이탈 예측 모델을 만들 거야"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            rows={3}
          />
        </Form.Item>

        <Form.Item label="데이터 파일">
          <Dragger
            fileList={fileList}
            beforeUpload={() => false}
            onChange={({ fileList }) => setFileList(fileList.slice(-1))}
            maxCount={1}
            accept=".csv,.xlsx,.xls,.json"
            disabled={loading}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">파일을 드래그하거나 클릭하여 선택하세요</p>
            <p className="ant-upload-hint">CSV, Excel, JSON 파일을 지원합니다.</p>
          </Dragger>
        </Form.Item>
      </Form>

      {loading && uploadPercent > 0 && (
        <Progress percent={uploadPercent} status="active" style={{ marginBottom: 16 }} />
      )}

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button
          type="primary"
          size="large"
          onClick={handleUpload}
          loading={loading}
          disabled={fileList.length === 0}
        >
          {loading ? 'S3에 업로드 중...' : '업로드 및 진단 시작'}
        </Button>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text type="secondary">
          사용 목적을 입력하면 LLM이 맞춤 평가지표 가중치를 추천합니다.
        </Text>
      </div>
    </div>
  );
}
