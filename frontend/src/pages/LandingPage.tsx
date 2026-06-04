import type { ReactNode } from 'react';
import { Layout } from 'antd';
import LandingHeader from '../components/landing/LandingHeader';
import HeroSection from '../components/landing/HeroSection';
import PartnersSection from '../components/landing/PartnersSection';
import ResearchBackedSection from '../components/landing/ResearchBackedSection';
import ValidationSection from '../components/landing/ValidationSection';
import PurposeComparisonSection from '../components/landing/PurposeComparisonSection';
import PurposeUseCasesSection from '../components/landing/PurposeUseCasesSection';
import UseCasesSection from '../components/landing/UseCasesSection';
import SupportedDataSection from '../components/landing/SupportedDataSection';
import PollutionDetectionSection from '../components/landing/PollutionDetectionSection';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import MetricsSection from '../components/landing/MetricsSection';
import ResultPreviewSection from '../components/landing/ResultPreviewSection';
import BeforeAfterSection from '../components/landing/BeforeAfterSection';
import AIAssistantSection from '../components/landing/AIAssistantSection';
import RagSearchSection from '../components/landing/RagSearchSection';
import PipelineSection from '../components/landing/PipelineSection';
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
        <SectionFrame id="partners"><PartnersSection /></SectionFrame>
        <SectionFrame id="researchbacked"><ResearchBackedSection /></SectionFrame>
        <SectionFrame id="validation"><ValidationSection /></SectionFrame>
        <SectionFrame id="service"><PurposeComparisonSection /></SectionFrame>
        <SectionFrame id="usecases"><PurposeUseCasesSection /></SectionFrame>
        <SectionFrame><UseCasesSection /></SectionFrame>
        <SectionFrame id="datatypes"><SupportedDataSection /></SectionFrame>
        <SectionFrame id="pollution"><PollutionDetectionSection /></SectionFrame>
        <SectionFrame id="guide"><HowItWorksSection /></SectionFrame>
        <SectionFrame id="metrics"><MetricsSection /></SectionFrame>
        <SectionFrame id="preview"><ResultPreviewSection /></SectionFrame>
        <SectionFrame id="beforeafter"><BeforeAfterSection /></SectionFrame>
        <SectionFrame id="ai"><AIAssistantSection /></SectionFrame>
        <SectionFrame id="rag"><RagSearchSection /></SectionFrame>
        <SectionFrame id="pipeline"><PipelineSection /></SectionFrame>
        <SectionFrame><ComparisonSection /></SectionFrame>
        <SectionFrame id="cases"><TestimonialsSection /></SectionFrame>
        <SectionFrame id="faq"><FAQSection /></SectionFrame>
        <SectionFrame id="cta"><FinalCTASection /></SectionFrame>
      </Content>
    </Layout>
  );
}
