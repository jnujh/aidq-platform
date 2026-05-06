import { Layout, Menu, Button, Typography, Flex } from 'antd';
import { BRAND } from '../../config/brand';

const { Header } = Layout;
const { Text } = Typography;

const menuItems = [
  { key: 'service', label: '서비스 소개' },
  { key: 'metrics', label: '진단 항목' },
  { key: 'guide', label: '사용 가이드' },
  { key: 'cases', label: '고객 사례' },
];

export default function LandingHeader() {
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
        <Flex align="center" gap={10}>
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
          <Text
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
        </Flex>
      </Flex>
    </Header>
  );
}
