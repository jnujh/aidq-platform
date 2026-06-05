import { Layout } from 'antd';
import LandingHeader from '../components/landing/LandingHeader';
import SectionFrame from '../components/landing/SectionFrame';
import HeroSection from '../components/landing/HeroSection';
import ProblemSection from '../components/landing/ProblemSection';
import DefinitionSection from '../components/landing/DefinitionSection';
import RagBriefSection from '../components/landing/RagBriefSection';
import BigNumbersSection from '../components/landing/BigNumbersSection';
import WhyItMattersSection from '../components/landing/WhyItMattersSection';
import FinalCTASection from '../components/landing/FinalCTASection';

const { Content } = Layout;

export default function LandingPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <LandingHeader />
      <Content>
        <SectionFrame><HeroSection /></SectionFrame>
        <SectionFrame id="problem"><ProblemSection /></SectionFrame>
        <SectionFrame id="definition"><DefinitionSection /></SectionFrame>
        <SectionFrame id="why"><WhyItMattersSection /></SectionFrame>
        <SectionFrame id="rag"><RagBriefSection /></SectionFrame>
        <SectionFrame id="numbers"><BigNumbersSection /></SectionFrame>
        <SectionFrame id="cta"><FinalCTASection /></SectionFrame>
      </Content>
    </Layout>
  );
}
