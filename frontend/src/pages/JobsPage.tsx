import { useEffect, useState, useCallback, useRef } from 'react';
import { Table, Tag, Typography, Empty, Button, Popconfirm, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { jobsApi, type JobStatusResponse } from '../api/jobs';
import { subscribeJobUpdates } from '../api/sse';

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

  const fetchJobs = useCallback(async () => {
    try {
      const res = await jobsApi.getList();
      setJobs(res.data.data);
    } catch {
      // 에러 무시
    } finally {
      setLoading(false);
    }
  }, []);

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

  const unsubscribeRef = useRef<(() => void) | null>(null);

  // 초기 목록 로드
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const res = await jobsApi.getList();
        setJobs(res.data.data);
      } catch {
        // 에러 무시
      } finally {
        setLoading(false);
      }
    };
    loadJobs();
  }, []);

  // SSE 구독 관리: pending 작업 유무에 따라 연결/해제
  useEffect(() => {
    const hasPending = jobs.some(
      (job) => job.status === 'PENDING' || job.status === 'PROCESSING'
    );

    if (hasPending && !unsubscribeRef.current) {
      // 진행 중인 작업이 있고 아직 구독 안 했으면 → 구독 시작
      unsubscribeRef.current = subscribeJobUpdates(
        (event) => {
          // SSE 데이터로 로컬 상태 즉시 업데이트
          setJobs((prev) =>
            prev.map((job) =>
              job.jobId === event.jobId
                ? { ...job, status: event.status, dataType: event.dataType ?? job.dataType }
                : job
            )
          );
        },
        () => {
          // SSE 에러 시 구독 해제 후 재시도
          unsubscribeRef.current = null;
          fetchJobs();
        }
      );
    } else if (!hasPending && unsubscribeRef.current) {
      // 모든 작업 완료 → 구독 해제
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, [jobs, fetchJobs]);

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, []);

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
