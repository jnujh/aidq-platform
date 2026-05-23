import type { ReactNode } from 'react';
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
import ComparisonSection from '../components/landing/ComparisonSection';
import TestimonialsSection from '../components/landing/TestimonialsSection';
import FAQSection from '../components/landing/FAQSection';
import FinalCTASection from '../components/landing/FinalCTASection';

const { Content } = Layout;

function SectionFrame({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <div
      id={id}
      style={{
        minHeight: 'calc(100vh - 72px)',
        scrollMarginTop: 80,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
    >
      {children}
    </div>
  );
}

export default function LandingPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <LandingHeader />
      <Content>
        <SectionFrame><HeroSection /></SectionFrame>
        <SectionFrame><PartnersSection /></SectionFrame>
        <SectionFrame><ResearchBackedSection /></SectionFrame>
        <SectionFrame id="service"><PurposeComparisonSection /></SectionFrame>
        <SectionFrame><UseCasesSection /></SectionFrame>
        <SectionFrame><SupportedDataSection /></SectionFrame>
        <SectionFrame><PollutionDetectionSection /></SectionFrame>
        <SectionFrame id="guide"><HowItWorksSection /></SectionFrame>
        <SectionFrame id="metrics"><MetricsSection /></SectionFrame>
        <SectionFrame><PurposeInputSection /></SectionFrame>
        <SectionFrame><ResultPreviewSection /></SectionFrame>
        <SectionFrame><BeforeAfterSection /></SectionFrame>
        <SectionFrame><AIAssistantSection /></SectionFrame>
        <SectionFrame><ComparisonSection /></SectionFrame>
        <SectionFrame id="cases"><TestimonialsSection /></SectionFrame>
        <SectionFrame><FAQSection /></SectionFrame>
        <SectionFrame><FinalCTASection /></SectionFrame>
      </Content>
    </Layout>
  );
}
