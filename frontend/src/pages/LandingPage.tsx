import { Layout } from 'antd';
import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';

const { Content } = Layout;

export default function LandingPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <LandingHeader />
      <Content>
        <HeroSection />
      </Content>
    </Layout>
  );
}
