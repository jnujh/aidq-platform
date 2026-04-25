import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, theme } from 'antd';
import {
  UnorderedListOutlined,
  UploadOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UploadPage from './pages/UploadPage';
import JobsPage from './pages/JobsPage';
import ResultPage from './pages/ResultPage';
import { authStore } from './stores/authStore';

const { Sider, Header, Content } = Layout;

function AuthLayout() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Routes>
      </Content>
    </Layout>
  );
}

function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    authStore.removeToken();
    navigate('/login');
  };

  const getPageTitle = () => {
    if (location.pathname === '/jobs') return '내 작업 목록';
    if (location.pathname === '/jobs/upload') return '파일 업로드';
    if (location.pathname.startsWith('/results')) return '진단 결과';
    return '';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" breakpoint="lg" collapsedWidth={0}>
        <div style={{ padding: '16px', fontWeight: 'bold', fontSize: '18px', textAlign: 'center', borderBottom: '1px solid #f0f0f0' }}>
          Scorecard
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          onClick={({ key }) => navigate(key)}
          items={[
            { key: '/jobs', icon: <UnorderedListOutlined />, label: '작업 목록' },
            { key: '/jobs/upload', icon: <UploadOutlined />, label: '파일 업로드' },
          ]}
        />
        <div style={{ position: 'absolute', bottom: 16, width: '100%', padding: '0 16px' }}>
          <Button block icon={<LogoutOutlined />} onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', borderBottom: '1px solid #f0f0f0' }}>
          <h2 style={{ margin: 0, fontSize: '20px' }}>{getPageTitle()}</h2>
        </Header>
        <Content style={{ margin: '24px', padding: '24px', background: '#fff', borderRadius: '8px', minHeight: 'auto' }}>
          <Routes>
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/jobs/upload" element={<UploadPage />} />
            <Route path="/results/:jobId" element={<ResultPage />} />
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}

function AppRouter() {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  if (isAuthPage) {
    return <AuthLayout />;
  }

  if (!authStore.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
}

export default App;
