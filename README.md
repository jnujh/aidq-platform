# Scorecard — AI-Ready 데이터 품질 진단 플랫폼

데이터셋을 업로드하면, 품질을 자동 진단하고 LLM이 개선 가이드를 생성하는 플랫폼입니다.

## 핵심 기능

- **파일 업로드** — CSV 파일을 드래그앤드롭으로 업로드
- **자동 진단** — 8개 품질 지표(completeness, uniqueness, validity 등)로 종합 점수 산출
- **맞춤 진단** — 사용 목적에 따라 LLM이 평가지표 가중치를 추천 (구현 중)
- **LLM 리포트** — 진단 결과를 자연어로 해석하고 개선 방향 제시 (구현 중)
- **비동기 처리** — RabbitMQ 기반 메시지 큐로 진단 요청/결과 비동기 처리

## 아키텍처

```
[React + antd]  →  [Spring Boot API]  →  [MySQL]
                         ↓
                    [RabbitMQ]
                    ↙        ↘
          diagnosis.queue   result.queue
                ↓                ↑
          [Python Worker — DSC Engine v3.2]
                         ↓
                       [S3]
```

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Spring Boot 4.0.5, Java 17, Spring Security, Spring Data JPA |
| Frontend | React 19, TypeScript, Vite, Ant Design |
| Database | MySQL 8.0 |
| Message Queue | RabbitMQ 3 |
| Object Storage | AWS S3 (로컬: LocalStack) |
| 진단 엔진 | Python 3.11, DSC Engine v3.2 (pandas, scipy) |
| LLM | Google Gemini (프로토타입) → Claude Haiku (운영) |
| Auth | JWT (JJWT, HMAC-SHA256) |
| Infra | Docker Compose, AWS EC2 (t3.small), GitHub Actions CI/CD |

## 빠른 시작

### 로컬 개발

```bash
# 1) 인프라 실행 (MySQL, RabbitMQ, LocalStack, 진단 엔진)
docker compose up -d

# 2) 백엔드 실행
./gradlew bootRun

# 3) 프론트엔드 실행
cd frontend && npm install && npm run dev
```

- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:8080
- RabbitMQ 관리: http://localhost:15672 (guest/guest)

### 운영 배포 (EC2)

```bash
docker-compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

## 환경변수

`.env` 파일 필요:

```
DB_URL=jdbc:mysql://localhost:3306/scorecard?useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true
DB_USERNAME=root
DB_PASSWORD=root
JWT_SECRET=your-secret-key
AWS_S3_ENDPOINT=http://localhost:4566
AWS_S3_BUCKET=scorecard-uploads
AWS_REGION=ap-northeast-2
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
```

## API 엔드포인트

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/users/signup` | 회원가입 | - |
| POST | `/api/users/login` | 로그인 | - |
| POST | `/api/jobs/submit` | 파일 업로드 + 진단 시작 | JWT |
| GET | `/api/jobs/list` | 내 작업 목록 | JWT |
| GET | `/api/jobs/{jobId}/status` | 작업 상태 조회 | JWT |
| DELETE | `/api/jobs/{jobId}` | 작업 삭제 | JWT |
| GET | `/api/results/{jobId}` | 진단 결과 조회 | JWT |
| GET | `/api/results/{jobId}/report` | LLM 리포트 조회 | JWT |

## 프로젝트 구조

```
scorecard/
├── src/main/java/com/geomsahaejo/scorecard/   # Spring Boot 백엔드
│   ├── auth/           # 인증 (회원가입, 로그인)
│   ├── user/           # 사용자 엔티티
│   ├── job/            # 작업 관리 (업로드, 상태, 삭제)
│   ├── jobresult/      # 진단 결과 조회
│   ├── global/         # 공통 (보안, 예외, 응답 포맷)
│   └── infrastructure/ # S3, RabbitMQ 연동
├── frontend/                                   # React 프론트엔드
│   └── src/
│       ├── api/        # Axios API 호출
│       ├── pages/      # 페이지 컴포넌트
│       ├── components/ # 공통 컴포넌트
│       └── stores/     # 인증 상태 관리
├── engine/                                     # DSC 진단 엔진
│   ├── dsc_engine.py   # 8개 품질 지표 계산
│   └── worker.py       # RabbitMQ Consumer
├── docker-compose.yml                          # 로컬 개발용
├── docker-compose.prod.yml                     # 운영 배포용
└── .github/workflows/deploy.yml                # CI/CD
```

## 팀

| 이름 | 역할 |
|------|------|
| 이지훈 | 웹 플랫폼 개발 (Spring Boot, React, 인프라) |
| 고준서 | 데이터 품질 진단 엔진 개발 (DSC v3.2) |
| 김동훈 | 프론트엔드 / API 개발 |

## 문서

- `PRD.md` — 시스템 설계, 인터페이스 계약, API 스펙
- `develop.md` — 작업 기록, 진행 현황
- `CLAUDE.md` — AI 어시스턴트 컨텍스트
- `docs/fastapi-integration-spec.md` — 진단 엔진 연동 스펙
