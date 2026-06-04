import { Layout } from 'antd';
import LandingHeader from '../components/landing/LandingHeader';
import SectionFrame from '../components/landing/SectionFrame';
import HeroSection from '../components/landing/HeroSection';
import PartnersSection from '../components/landing/PartnersSection';
import ValidationSection from '../components/landing/ValidationSection';
import FinalCTASection from '../components/landing/FinalCTASection';

const { Content } = Layout;

export default function LandingPage() {
  return (
    <Layout style={{ minHeight: '100vh', background: '#fff' }}>
      <LandingHeader />
      <Content>
        <SectionFrame><HeroSection /></SectionFrame>
        <SectionFrame id="partners"><PartnersSection /></SectionFrame>
        <SectionFrame id="validation-summary"><ValidationSection /></SectionFrame>
        <SectionFrame id="cta"><FinalCTASection /></SectionFrame>
      </Content>
    </Layout>
  );
}
