import { Flex } from 'antd';
import { IconPhoneCall, IconBuildingBank, IconShieldLock } from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

type Anomaly = {
  label: string;
  badgeBg: string;
  badgeText: string;
  visual: React.ReactNode;
  title: string;
  desc: string;
};

type UseCase = {
  Icon: typeof IconPhoneCall;
  domain: string;
  title: string;
  body: string;
  signals: string[];
};

const USECASES: UseCase[] = [
  {
    Icon: IconPhoneCall,
    domain: '보이스피싱 통화',
    title: '정상 통화 속에 섞인 사기 패턴',
    body: '통화 시간·발신지·키워드 분포에서 평소와 다른 패턴을 자동 식별합니다',
    signals: ['통화 길이 이상치', '의심 키워드 빈도', '발신 번호 다양성'],
  },
  {
    Icon: IconBuildingBank,
    domain: '은행 거래 데이터',
    title: '평소와 다른 이상 거래 탐지',
    body: '금액·시간·빈도의 분포 일탈을 잡아 부정 거래 신호를 조기에 발견합니다',
    signals: ['거래 금액 분포 일탈', '비정상 시간대 거래', '연속 시도 패턴'],
  },
  {
    Icon: IconShieldLock,
    domain: '사이버 보안 로그',
    title: '정상 트래픽 속 공격 시도',
    body: '평균에서 크게 벗어난 요청 패턴·접근 빈도를 이상치로 분류합니다',
    signals: ['요청 빈도 폭증', '비정상 IP 분포', '접근 경로 이탈'],
  },
];

const ANOMALIES: Anomaly[] = [
  {
    label: '결측',
    badgeBg: '#FCE4D6',
    badgeText: '#7A3A0E',
    visual: (
      <span style={{ fontSize: 44, letterSpacing: 6 }}>
        👤👤<span style={{ opacity: 0.18 }}>👤</span>👤👤
      </span>
    ),
    title: '있어야 할 데이터가 빠짐',
    desc: '값이 누락된 자리를 채워야 모델이 안정적으로 학습합니다',
  },
  {
    label: '중복',
    badgeBg: '#FFF2C6',
    badgeText: '#6B4E10',
    visual: <span style={{ fontSize: 44, letterSpacing: 6 }}>👤👤👤👤👤</span>,
    title: '같은 데이터가 여러 번 등장',
    desc: '겹친 행은 분포를 왜곡하고 평가 신뢰도를 떨어뜨립니다',
  },
  {
    label: '이상치',
    badgeBg: '#FBD9D9',
    badgeText: '#7A1E1E',
    visual: (
      <span style={{ fontSize: 44, letterSpacing: 6 }}>
        👤👤🤖👤👤
      </span>
    ),
    title: '분포에서 크게 벗어난 값',
    desc: '사람들 사이에 섞인 봇/이상 패턴 — 잡음인지 의미 있는 신호인지 구분이 필요합니다',
  },
  {
    label: '라벨 오류',
    badgeBg: '#E0E7FF',
    badgeText: '#1E3A8A',
    visual: (
      <span style={{ fontSize: 44, display: 'inline-flex', alignItems: 'center', gap: 10 }}>
        <span>👤</span>
        <span style={{ fontSize: 28, color: '#999' }}>→</span>
        <span style={{ filter: 'grayscale(0.4)' }}>🤖</span>
      </span>
    ),
    title: '잘못 붙은 라벨',
    desc: '학습 신호 자체가 오염되어 가장 큰 영향을 미칩니다',
  },
];

export default function AnomalyDetectionSection() {
  return (
    <section
      style={{
        padding: '80px 40px',
        background: '#fff',
        flex: 1,
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <div style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div
            style={{
              color: BRAND.colors.primary,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 0.5,
              marginBottom: 12,
            }}
          >
            ANOMALY DETECTION
          </div>
          <h2
            style={{
              fontSize: 26,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
              marginBottom: 10,
            }}
          >
            데이터 오염을 자동으로 찾아냅니다
          </h2>
          <p
            style={{
              fontSize: BRAND.fontSize.body,
              color: '#666',
              margin: 0,
            }}
          >
            네 가지 대표 오염 패턴 — 결측 · 중복 · 이상치 · 라벨 오류
          </p>
        </div>

        <Flex gap={20} wrap="wrap" align="stretch" style={{ marginBottom: 56 }}>
          {ANOMALIES.map((a) => (
            <div
              key={a.label}
              style={{
                flex: '1 1 240px',
                minWidth: 0,
                background: BRAND.colors.surfaces.subtle,
                border: '1px solid #E8EEF5',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <span
                style={{
                  alignSelf: 'flex-start',
                  background: a.badgeBg,
                  color: a.badgeText,
                  fontSize: 12,
                  fontWeight: BRAND.fontWeight.bold,
                  padding: '4px 12px',
                  borderRadius: 999,
                  letterSpacing: 0.2,
                }}
              >
                {a.label}
              </span>
              <div
                style={{
                  background: '#fff',
                  borderRadius: 12,
                  padding: '20px 12px',
                  textAlign: 'center',
                  minHeight: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #f0f0f0',
                }}
              >
                {a.visual}
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.body,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primaryDark,
                  lineHeight: 1.3,
                }}
              >
                {a.title}
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#555',
                  lineHeight: 1.55,
                }}
              >
                {a.desc}
              </div>
            </div>
          ))}
        </Flex>

        {/* 도메인 사례 */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div
            style={{
              color: BRAND.colors.primary,
              fontSize: 11,
              fontWeight: BRAND.fontWeight.semibold,
              letterSpacing: 0.5,
              marginBottom: 10,
            }}
          >
            REAL-WORLD APPLICATIONS
          </div>
          <div
            style={{
              fontSize: BRAND.fontSize.subtitle,
              fontWeight: BRAND.fontWeight.semibold,
              color: BRAND.colors.primaryDark,
              margin: 0,
            }}
          >
            이런 도메인에서 자주 활용됩니다
          </div>
        </div>

        <Flex gap={20} wrap="wrap" align="stretch">
          {USECASES.map((u) => (
            <div
              key={u.domain}
              style={{
                flex: '1 1 320px',
                minWidth: 0,
                background: '#fff',
                border: '1px solid #E8EEF5',
                borderRadius: 16,
                padding: 26,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <Flex align="center" gap={12}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 12,
                    background: BRAND.colors.surfaces.cardBlue,
                    color: BRAND.colors.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <u.Icon size={22} stroke={2} />
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: BRAND.fontWeight.bold,
                    color: BRAND.colors.primary,
                    letterSpacing: 0.5,
                  }}
                >
                  {u.domain}
                </span>
              </Flex>
              <div
                style={{
                  fontSize: BRAND.fontSize.subtitleSmall,
                  fontWeight: BRAND.fontWeight.semibold,
                  color: BRAND.colors.primaryDark,
                  lineHeight: 1.3,
                }}
              >
                {u.title}
              </div>
              <div
                style={{
                  fontSize: BRAND.fontSize.bodySmall,
                  color: '#555',
                  lineHeight: 1.55,
                }}
              >
                {u.body}
              </div>
              <div
                style={{
                  marginTop: 'auto',
                  borderTop: '1px solid #F0F4F8',
                  paddingTop: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: BRAND.fontWeight.bold,
                    color: '#888',
                    letterSpacing: 0.3,
                    marginBottom: 6,
                  }}
                >
                  잡아내는 신호
                </div>
                <Flex gap={6} wrap="wrap">
                  {u.signals.map((s) => (
                    <span
                      key={s}
                      style={{
                        background: BRAND.colors.surfaces.subtle,
                        color: '#444',
                        fontSize: 11,
                        padding: '3px 9px',
                        borderRadius: 6,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </Flex>
              </div>
            </div>
          ))}
        </Flex>
      </div>
    </section>
  );
}
