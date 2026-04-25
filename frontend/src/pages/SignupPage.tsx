import { Form, Input, Button, Card, Typography, message } from 'antd';
import { MailOutlined, LockOutlined, UserOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth';
import { useState } from 'react';

const { Title, Text } = Typography;

export default function SignupPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { email: string; password: string; nickname: string }) => {
    setLoading(true);
    try {
      await authApi.signup(values);
      message.success('회원가입 성공! 로그인해주세요.');
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || '회원가입에 실패했습니다.';
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card style={{ width: 400 }}>
      <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
        Scorecard 회원가입
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
          rules={[
            { required: true, message: '비밀번호를 입력해주세요' },
            { min: 6, message: '비밀번호는 6자 이상이어야 합니다' },
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="비밀번호" size="large" />
        </Form.Item>
        <Form.Item
          name="nickname"
          rules={[{ required: true, message: '닉네임을 입력해주세요' }]}
        >
          <Input prefix={<UserOutlined />} placeholder="닉네임" size="large" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large" loading={loading}>
            회원가입
          </Button>
        </Form.Item>
      </Form>
      <Text style={{ display: 'block', textAlign: 'center' }}>
        이미 계정이 있으신가요? <Link to="/login">로그인</Link>
      </Text>
    </Card>
  );
}
