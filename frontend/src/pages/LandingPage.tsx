import { Layout } from 'antd';
import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';
import PartnersSection from '../components/landing/PartnersSection';
import ResearchBackedSection from '../components/landing/ResearchBackedSection';
import PurposeComparisonSection from '../components/landing/PurposeComparisonSection';
import UseCasesSection from '../components/landing/UseCasesSection';
import SupportedDataSection from '../components/landing/SupportedDataSection';
import PollutionDetectionSection from '../components/landing/PollutionDetectionSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import MetricsSection from '../components/landing/MetricsSection';
import PurposeInputSection from '../components/landing/PurposeInputSection';
import ResultPreviewSection from '../components/landing/ResultPreviewSection';
import BeforeAfterSection from '../components/landing/BeforeAfterSection';
import AIAssistantSection from '../components/landing/AIAssistantSection';

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
        <UseCasesSection />
        <SupportedDataSection />
        <PollutionDetectionSection />
        <HowItWorksSection />
        <MetricsSection />
        <PurposeInputSection />
        <ResultPreviewSection />
        <BeforeAfterSection />
        <AIAssistantSection />
      </Content>
    </Layout>
  );
}
