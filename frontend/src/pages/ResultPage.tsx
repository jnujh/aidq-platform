import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Descriptions, Spin, Result, Button, Typography, Card, Divider } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { resultsApi, type JobResultResponse } from '../api/results';

const { Title, Paragraph } = Typography;

export default function ResultPage() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<JobResultResponse | null>(null);
  const [report, setReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await resultsApi.getResult(Number(jobId));
        setResult(res.data.data);

        // 리포트 조회 (없으면 무시)
        if (res.data.data.reportS3Key) {
          try {
            const reportRes = await resultsApi.getReport(Number(jobId));
            setReport(reportRes.data.data);
          } catch {
            // 리포트 없어도 결과는 표시
          }
        }
      } catch (err: any) {
        const code = err.response?.data?.error?.code;
        if (code === 'JOB_NOT_COMPLETED') {
          setError('진단이 아직 진행 중입니다. 잠시 후 다시 확인해주세요.');
        } else if (code === 'JOB_NOT_FOUND') {
          setError('존재하지 않는 작업입니다.');
        } else {
          setError(err.response?.data?.error?.message || '결과를 불러오는데 실패했습니다.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [jobId]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: 80 }}><Spin size="large" /></div>;
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

  return (
    <div>
      <Title level={4} style={{ marginBottom: 24 }}>진단 결과</Title>
      <Descriptions bordered column={1}>
        <Descriptions.Item label="작업 ID">{result.jobId}</Descriptions.Item>
        <Descriptions.Item label="종합 점수">
          <span style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
            {result.totalScore}점
          </span>
        </Descriptions.Item>
        <Descriptions.Item label="생성일시">
          {new Date(result.createdAt).toLocaleString('ko-KR')}
        </Descriptions.Item>
      </Descriptions>

      {report && (
        <>
          <Divider />
          <Card
            title={<><FileTextOutlined /> LLM 분석 리포트</>}
            style={{ marginTop: 24 }}
          >
            <pre style={{
              lineHeight: 1.8,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'inherit',
              fontSize: '14px',
              margin: 0,
            }}>
              {report}
            </pre>
          </Card>
        </>
      )}

      {!report && result.reportS3Key === null && (
        <>
          <Divider />
          <Card style={{ marginTop: 24, textAlign: 'center' }}>
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
