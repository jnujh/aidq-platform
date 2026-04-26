import { useEffect, useState, useRef } from 'react';
import { Table, Tag, Typography, Empty, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jobsApi, type JobStatusResponse } from '../api/jobs';

const { Text } = Typography;

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  PENDING: { color: 'blue', label: '대기 중' },
  PROCESSING: { color: 'orange', label: '진단 중' },
  DONE: { color: 'green', label: '완료' },
  FAILED: { color: 'red', label: '실패' },
};

export default function JobsPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<JobStatusResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<number | null>(null);

  const fetchJobs = async () => {
    try {
      const res = await jobsApi.getList();
      setJobs(res.data.data);
    } catch {
      // 에러 무시 (폴링 중 일시적 에러 가능)
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (jobId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await jobsApi.delete(jobId);
      message.success('작업이 삭제되었습니다.');
      fetchJobs();
    } catch {
      message.error('삭제에 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    const hasPending = jobs.some(
      (job) => job.status === 'PENDING' || job.status === 'PROCESSING'
    );

    if (hasPending) {
      intervalRef.current = window.setInterval(fetchJobs, 3000);
    }

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [jobs]);

  const columns = [
    {
      title: '작업 이름',
      dataIndex: 'jobName',
      key: 'jobName',
      ellipsis: true,
      render: (name: string | null, record: JobStatusResponse) =>
        name || <Text type="secondary">{record.originalFilename}</Text>,
    },
    {
      title: '파일명',
      dataIndex: 'originalFilename',
      key: 'originalFilename',
      ellipsis: true,
      width: 200,
    },
    {
      title: '데이터 유형',
      dataIndex: 'dataType',
      key: 'dataType',
      width: 120,
      render: (dataType: string | null) => dataType || <Text type="secondary">판별 전</Text>,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = STATUS_CONFIG[status] || { color: 'default', label: status };
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '생성일시',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (date: string) => new Date(date).toLocaleString('ko-KR'),
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_: unknown, record: JobStatusResponse) => (
        <Popconfirm
          title="이 작업을 삭제하시겠습니까?"
          onConfirm={(e) => handleDelete(record.jobId, e as unknown as React.MouseEvent)}
          onCancel={(e) => e?.stopPropagation()}
          okText="삭제"
          cancelText="취소"
        >
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            size="small"
            onClick={(e) => e.stopPropagation()}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <Table
      dataSource={jobs}
      columns={columns}
      rowKey="jobId"
      loading={loading}
      locale={{ emptyText: <Empty description="아직 업로드한 작업이 없습니다" /> }}
      onRow={(record) => ({
        onClick: () => {
          if (record.status === 'DONE') {
            navigate(`/results/${record.jobId}`);
          }
        },
        style: {
          cursor: record.status === 'DONE' ? 'pointer' : 'default',
        },
      })}
    />
  );
}
