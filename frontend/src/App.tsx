import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button } from 'antd';
import {
  UnorderedListOutlined,
  UploadOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UploadPage from './pages/UploadPage';
import JobsPage from './pages/JobsPage';
import ResultPage from './pages/ResultPage';
import RetryPage from './pages/RetryPage';
import WeightsPage from './pages/WeightsPage';
import LandingPage from './pages/LandingPage';
import LandingHeader from './components/landing/LandingHeader';
import SectionFrame from './components/landing/SectionFrame';
import PurposeComparisonSection from './components/landing/PurposeComparisonSection';
import AnomalyDetectionSection from './components/landing/AnomalyDetectionSection';
import LLMWeightSection from './components/landing/LLMWeightSection';
import TaskTypeSection from './components/landing/TaskTypeSection';
import UploadFlowSection from './components/landing/UploadFlowSection';
import AutoDetectionSection from './components/landing/AutoDetectionSection';
import CellMatrixSection from './components/landing/CellMatrixSection';
import MetricsSection from './components/landing/MetricsSection';
import ResultPreviewSection from './components/landing/ResultPreviewSection';
import HowItWorksSection from './components/landing/HowItWorksSection';
import JobsListPreviewSection from './components/landing/JobsListPreviewSection';
import PipelineSection from './components/landing/PipelineSection';
import UseCasesSection from './components/landing/UseCasesSection';
import PurposeUseCasesSection from './components/landing/PurposeUseCasesSection';
import SupportedDataSection from './components/landing/SupportedDataSection';
import PollutionDetectionSection from './components/landing/PollutionDetectionSection';
import BeforeAfterSection from './components/landing/BeforeAfterSection';
import ValidationSection from './components/landing/ValidationSection';
import RagSearchSection from './components/landing/RagSearchSection';
import TeamSection from './components/landing/TeamSection';
import FAQSection from './components/landing/FAQSection';
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
    if (location.pathname === '/jobs/weights') return '가중치 설정';
    if (location.pathname.endsWith('/retry')) return '진단 재시도';
    if (location.pathname.startsWith('/results')) return '진단 결과';
    return '';
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="light" breakpoint="lg" collapsedWidth={0}>
        <div
          onClick={() => navigate('/')}
          style={{ padding: '16px', fontWeight: 'bold', fontSize: '18px', textAlign: 'center', borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
        >
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
            <Route path="/jobs/weights" element={<WeightsPage />} />
            <Route path="/jobs/:parentJobId/retry" element={<RetryPage />} />
            <Route path="/results/:jobId" element={<ResultPage />} />
            <Route path="*" element={<Navigate to="/jobs" replace />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

type StandalonePageEntry = { id: string; content: ReactNode };

const STANDALONE_PAGES: Record<string, StandalonePageEntry> = {
  // Platform
  '/platform/service': {
    id: 'service',
    content: (
      <>
        <HowItWorksSection />
        <JobsListPreviewSection />
        <PurposeComparisonSection />
        <AnomalyDetectionSection />
        <LLMWeightSection />
        <TaskTypeSection />
        <SupportedDataSection />
        <UploadFlowSection />
        <AutoDetectionSection />
      </>
    ),
  },
  '/platform/metrics': {
    id: 'metrics',
    content: (
      <>
        <MetricsSection />
        <CellMatrixSection />
      </>
    ),
  },
  '/platform/preview': { id: 'preview', content: <ResultPreviewSection /> },
  '/platform/pipeline': { id: 'pipeline', content: <PipelineSection /> },
  // Solutions
  '/solutions/usecases': {
    id: 'usecases',
    content: (
      <>
        <UseCasesSection />
        <PurposeUseCasesSection />
      </>
    ),
  },
  '/solutions/pollution': { id: 'pollution', content: <PollutionDetectionSection /> },
  '/solutions/beforeafter': { id: 'beforeafter', content: <BeforeAfterSection /> },
  // Research
  '/research/validation': { id: 'validation', content: <ValidationSection /> },
  '/research/rag': { id: 'rag', content: <RagSearchSection /> },
  // Company
  '/company/team': { id: 'team', content: <TeamSection /> },
  '/company/faq': { id: 'faq', content: <FAQSection /> },
};

function StandalonePageLayout({ entry }: { entry: StandalonePageEntry }) {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <LandingHeader />
      <Content>
        <SectionFrame id={entry.id}>{entry.content}</SectionFrame>
      </Content>
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
  const isAuthenticated = authStore.isAuthenticated();

  if (isAuthPage) {
    return <AuthLayout />;
  }

  if (location.pathname === '/') {
    return <LandingPage />;
  }

  const standaloneEntry = STANDALONE_PAGES[location.pathname];
  if (standaloneEntry) {
    return <StandalonePageLayout entry={standaloneEntry} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
}

export default App;
