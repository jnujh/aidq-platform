import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { authStore } from '../stores/authStore';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      authStore.setToken(res.data.data.accessToken);
      message.success('로그인 성공');
      navigate('/jobs');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || '로그인에 실패했습니다.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ width: 400 }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
        Scorecard 로그인
      </Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[
            { required: true, message: '이메일을 입력해주세요' },
            { type: 'email', message: '유효한 이메일을 입력해주세요' },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="이메일" size="large" />
        </Form.Item>
        <Form.Item
          name="password"
          rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            로그인
          </Button>
        </Form.Item>
      </Form>
      <Text style={{ display: 'block', textAlign: 'center' }}>
        계정이 없으신가요? <Link to="/signup">회원가입</Link>
      </Text>
    </Card>
  );
}
