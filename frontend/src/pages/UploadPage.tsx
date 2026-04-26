import { useState } from 'react';
import { Upload, Button, message, Typography, Input, Form } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/jobs';
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

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('파일을 선택해주세요.');
      return;
    }

    const file = fileList[0] as unknown as { originFileObj: File };
    setLoading(true);
    try {
      await jobsApi.submit(file.originFileObj, jobName || undefined, purpose || undefined);
      message.success('파일 업로드 성공! 진단이 시작됩니다.');
      navigate('/jobs');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || '파일 업로드에 실패했습니다.';
      message.error(msg);
    } finally {
      setLoading(false);
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
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">파일을 드래그하거나 클릭하여 선택하세요</p>
            <p className="ant-upload-hint">CSV, Excel, JSON 파일을 지원합니다.</p>
          </Dragger>
        </Form.Item>
      </Form>

      <div style={{ marginTop: 24, textAlign: 'center' }}>
        <Button
          type="primary"
          size="large"
          onClick={handleUpload}
          loading={loading}
          disabled={fileList.length === 0}
        >
          업로드 및 진단 시작
        </Button>
      </div>

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text type="secondary">
          사용 목적을 입력하면 LLM이 맞춤 평가지표를 추천합니다. (추후 지원)
        </Text>
      </div>
    </div>
  );
}
