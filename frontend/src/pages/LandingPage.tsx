import { Layout } from 'antd';
import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';
import PartnersSection from '../components/landing/PartnersSection';
import ResearchBackedSection from '../components/landing/ResearchBackedSection';
import PurposeComparisonSection from '../components/landing/PurposeComparisonSection';

const { Content } = Layout;

export default function LandingPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <LandingHeader />
      <Content>
        <HeroSection />
        <PartnersSection />
        <ResearchBackedSection />
        <PurposeComparisonSection />
      </Content>
    </Layout>
  );
}
