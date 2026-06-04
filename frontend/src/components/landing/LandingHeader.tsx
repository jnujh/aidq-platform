import { useState } from 'react';
import { Layout, Menu, Button, Typography, Flex } from 'antd';
import { useNavigate } from 'react-router-dom';
import { BRAND } from '../../config/brand';
import { authStore } from '../../stores/authStore';

const { Header } = Layout;
const { Text } = Typography;

const menuItems = [
  {
    key: 'platform',
    label: 'Platform',
    children: [
      { key: 'service', label: 'AI 진단 가이드' },
      { key: 'metrics', label: '측정 지표' },
      { key: 'preview', label: '진단 결과 미리보기' },
      { key: 'pipeline', label: '시스템 구조' },
    ],
  },
  {
    key: 'solutions',
    label: 'Solutions',
    children: [
      { key: 'usecases', label: '활용 분야' },
      { key: 'pollution', label: '데이터 오염 자동 감지' },
      { key: 'beforeafter', label: '개선 전/후 비교' },
    ],
  },
  {
    key: 'research',
    label: 'Research',
    children: [
      { key: 'validation', label: '검증된 진단 정확도' },
      { key: 'researchbacked', label: '근거 기반 점수' },
      { key: 'rag', label: '검색 기반 답변' },
    ],
  },
  {
    key: 'company',
    label: 'Company',
    children: [
      { key: 'cases', label: '고객 사례' },
      { key: 'faq', label: '자주 묻는 질문' },
      { key: 'cta', label: '문의·시작하기' },
    ],
  },
];

const ROUTE_FOR_KEY: Record<string, string> = {
  // Platform 하위
  service: '/platform/service',
  metrics: '/platform/metrics',
  preview: '/platform/preview',
  pipeline: '/platform/pipeline',
  // Solutions 하위
  usecases: '/solutions/usecases',
  datatypes: '/solutions/datatypes',
  pollution: '/solutions/pollution',
  beforeafter: '/solutions/beforeafter',
  // Research 하위
  validation: '/research/validation',
  researchbacked: '/research/researchbacked',
  rag: '/research/rag',
  ai: '/research/ai',
  // Company 하위
  cases: '/company/cases',
  faq: '/company/faq',
  cta: '/company/cta',
};

export default function LandingHeader() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    authStore.isAuthenticated()
  );

  const handleLogout = () => {
    authStore.removeToken();
    setIsAuthenticated(false);
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    const route = ROUTE_FOR_KEY[key];
    if (route) navigate(route);
  };

  return (
    <Header
      style={{
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        padding: '0 48px',
        height: 72,
        lineHeight: 'normal',
        display: 'flex',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}
    >
      <Flex
        align="center"
        justify="space-between"
        style={{ width: '100%', maxWidth: 1280, margin: '0 auto' }}
      >
        <Flex
          align="center"
          gap={10}
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              background: BRAND.colors.primary,
              borderRadius: 8,
            }}
          />
          <Text
            style={{
              fontSize: BRAND.fontSize.subtitle,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
            }}
          >
            {BRAND.name}
          </Text>
        </Flex>

        <Menu
          mode="horizontal"
          items={menuItems}
          selectable={false}
          onClick={handleMenuClick}
          style={{
            border: 'none',
            background: 'transparent',
            fontSize: BRAND.fontSize.body,
            fontWeight: BRAND.fontWeight.semibold,
            flex: 1,
            justifyContent: 'center',
            minWidth: 0,
          }}
        />

        <Flex align="center" gap={20}>
          {isAuthenticated ? (
            <>
              <Button
                type="primary"
                onClick={() => navigate('/jobs')}
                style={{
                  background: BRAND.colors.primary,
                  borderColor: BRAND.colors.primary,
                  fontWeight: BRAND.fontWeight.semibold,
                  fontSize: BRAND.fontSize.body,
                  height: 42,
                  paddingInline: 22,
                  borderRadius: 8,
                }}
              >
                내 작업으로
              </Button>
              <Text
                onClick={handleLogout}
                style={{
                  fontSize: BRAND.fontSize.body,
                  fontWeight: BRAND.fontWeight.semibold,
                  cursor: 'pointer',
                  color: '#333',
                }}
              >
                로그아웃
              </Text>
            </>
          ) : (
            <>
              <Text
                onClick={() => navigate('/login')}
                style={{
                  fontSize: BRAND.fontSize.body,
                  fontWeight: BRAND.fontWeight.semibold,
                  cursor: 'pointer',
                  color: '#333',
                }}
              >
                로그인
              </Text>
              <Button
                type="primary"
                onClick={() => navigate('/signup')}
                style={{
                  background: BRAND.colors.primary,
                  borderColor: BRAND.colors.primary,
                  fontWeight: BRAND.fontWeight.semibold,
                  fontSize: BRAND.fontSize.body,
                  height: 42,
                  paddingInline: 22,
                  borderRadius: 8,
                }}
              >
                시작하기
              </Button>
            </>
          )}
        </Flex>
      </Flex>
    </Header>
  );
}
