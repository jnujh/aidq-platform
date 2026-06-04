import { Flex } from 'antd';
import {
  IconUpload,
  IconTableShare,
  IconChartHistogram,
  IconChevronRight,
} from '@tabler/icons-react';
import { BRAND } from '../../config/brand';

type Step = {
  step: string;
  title: string;
  body: string;
  Icon: typeof IconUpload;
  preview: React.ReactNode;
};

function MockFileBox() {
  return (
    <div
      style={{
        background: '#fff',
        border: '1px dashed #B0C7DC',
        borderRadius: 10,
        padding: '14px 12px',
        textAlign: 'center',
        fontSize: 12,
        color: '#5A7A95',
        lineHeight: 1.5,
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 4 }}>📄</div>
      seoul_pop.csv
      <br />
      <span style={{ fontSize: 11, color: '#7A8FA5' }}>4.2MB · 18,322 rows</span>
    </div>
  );
}

function MockTable() {
  const headers = ['id', 'age', 'gender', 'income', 'churn'];
  const rows = [
    ['1', '34', 'F', '5,200', '0'],
    ['2', '52', 'M', '7,800', '1'],
    ['3', '29', 'F', '4,100', '0'],
  ];
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E8EEF5',
        borderRadius: 8,
        padding: 8,
        fontSize: 10,
        fontFamily: '"SF Mono","Menlo","Consolas",monospace',
        color: '#333',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: 4,
          marginBottom: 4,
          fontWeight: BRAND.fontWeight.bold,
          color: BRAND.colors.primary,
        }}
      >
        {headers.map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>
      {rows.map((r, i) => (
        <div
          key={i}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: 4,
            padding: '2px 0',
            borderTop: '1px solid #F3F6FA',
          }}
        >
          {r.map((c, j) => (
            <div key={j}>{c}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

function MockProgress() {
  return (
    <div>
      <div
        style={{
          background: '#fff',
          border: '1px solid #E8EEF5',
          borderRadius: 8,
          padding: '10px 12px',
          marginBottom: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 11,
          color: '#444',
        }}
      >
        <span>진단 중...</span>
        <span style={{ color: BRAND.colors.primary, fontWeight: 700 }}>
          78%
        </span>
      </div>
      <div
        style={{
          background: '#EEF2F7',
          height: 6,
          borderRadius: 4,
          overflow: 'hidden',
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: '78%',
            background: BRAND.colors.primary,
            height: '100%',
          }}
        />
      </div>
      <div
        style={{
          fontSize: 11,
          color: '#666',
          lineHeight: 1.5,
        }}
      >
        completeness · uniqueness · ... 8개 지표 계산
      </div>
    </div>
  );
}

const STEPS: Step[] = [
  {
    step: '01',
    title: '파일 업로드',
    body: 'CSV · 엑셀 · JSON · 이미지 ZIP · 텍스트 폴더를 드래그앤드롭으로 업로드',
    Icon: IconUpload,
    preview: <MockFileBox />,
  },
  {
    step: '02',
    title: '데이터 미리보기·확인',
    body: '컬럼 타입·샘플 행을 확인하고 target 컬럼을 자동/수동 지정',
    Icon: IconTableShare,
    preview: <MockTable />,
  },
  {
    step: '03',
    title: '진단 실행',
    body: '8개 지표를 가중 합산해 0~100 점수와 A~D 등급, 우선순위 액션을 출력',
    Icon: IconChartHistogram,
    preview: <MockProgress />,
  },
];

export default function UploadFlowSection() {
  return (
    <section
      style={{
        padding: '80px 40px',
        background: BRAND.colors.surfaces.subtle,
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
            UPLOAD FLOW
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
            이렇게 업로드하고 진단합니다
          </h2>
          <p
            style={{ fontSize: BRAND.fontSize.body, color: '#666', margin: 0 }}
          >
            세 번의 클릭이면 끝 — 데이터 종류와 작업 유형은 자동으로 인식됩니다
          </p>
        </div>

        <Flex gap={16} wrap="wrap" align="stretch">
          {STEPS.map((s, i) => (
            <Flex
              key={s.step}
              gap={12}
              align="stretch"
              style={{ flex: '1 1 280px', minWidth: 0 }}
            >
              <div
                style={{
                  flex: 1,
                  background: '#fff',
                  border: '1px solid #E8EEF5',
                  borderRadius: 16,
                  padding: 22,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                <Flex align="center" gap={10}>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: BRAND.fontWeight.bold,
                      color: BRAND.colors.primary,
                      letterSpacing: 0.5,
                    }}
                  >
                    STEP {s.step}
                  </span>
                  <div
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      background: BRAND.colors.surfaces.cardBlue,
                      color: BRAND.colors.primary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <s.Icon size={16} stroke={2} />
                  </div>
                </Flex>
                <div
                  style={{
                    fontSize: BRAND.fontSize.subtitleSmall,
                    fontWeight: BRAND.fontWeight.semibold,
                    color: BRAND.colors.primaryDark,
                  }}
                >
                  {s.title}
                </div>
                <div
                  style={{
                    fontSize: BRAND.fontSize.bodySmall,
                    color: '#555',
                    lineHeight: 1.55,
                  }}
                >
                  {s.body}
                </div>
                <div style={{ marginTop: 'auto' }}>{s.preview}</div>
              </div>
              {i < STEPS.length - 1 && (
                <Flex
                  align="center"
                  justify="center"
                  style={{ flexShrink: 0, color: '#B0C0CF' }}
                >
                  <IconChevronRight size={28} stroke={2} />
                </Flex>
              )}
            </Flex>
          ))}
        </Flex>
      </div>
    </section>
  );
}
