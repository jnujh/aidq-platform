import { useState } from 'react';
import { Upload, Button, message, Typography } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jobsApi } from '../api/jobs';
import type { UploadFile } from 'antd';

const { Dragger } = Upload;
const { Text } = Typography;

export default function UploadPage() {
  const navigate = useNavigate();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('파일을 선택해주세요.');
      return;
    }

    const file = fileList[0] as unknown as { originFileObj: File };
    setLoading(true);
    try {
      await jobsApi.submit(file.originFileObj);
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
        <p className="ant-upload-hint">
          CSV, Excel, JSON 파일을 지원합니다.
        </p>
      </Dragger>

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
          업로드된 파일은 자동으로 데이터 품질 진단이 시작됩니다.
        </Text>
      </div>
    </div>
  );
}
