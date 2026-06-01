# Scorecard — AI-Ready 데이터 품질 진단 플랫폼

데이터셋을 업로드하면, 품질을 자동 진단하고 RAG 기반 LLM이 개선 가이드를 생성하는 플랫폼입니다.

## 핵심 기능

- **Presigned URL 직접 업로드** — 서버를 거치지 않고 S3에 직접 업로드 (대용량 지원)
- **RAG 기반 맞춤 가중치 추천** — 사용 목적에 따라 ChromaDB 검색 + Claude Haiku가 가중치 추천
- **자동 진단** — 8개 품질 지표(completeness, uniqueness, validity 등)로 종합 점수 산출
- **RAG 기반 개선 리포트** — 진단 결과를 자연어로 해석하고 참조 문서와 함께 개선 방향 제시
- **SSE 실시간 알림** — 폴링 없이 진단 완료 시 즉시 알림
- **비동기 처리** — RabbitMQ 기반 메시지 큐로 진단 요청/결과 비동기 처리
- **대용량 병렬 진단** — Celery chord로 CSV를 청크 분할 → Worker 병렬 진단 → 합산 (OOM 없는 스트리밍, Spring Boot 변경 0)

## 아키텍처

```
[React + Ant Design]  →  [Nginx (리버스 프록시)]
                               ↓
                        [Spring Boot API]  →  [MySQL]
                          ↓         ↓
                    [RabbitMQ]    [RAG Service (FastAPI)]
                    ↙        ↘         ↓
          diagnosis.queue   result.queue  [ChromaDB] + [Claude Haiku]
                ↓                ↑
          [Bridge → Celery chord 병렬 진단 (DSC v3.2)]  ←→ [Redis]
            분할 → process_chunk × N → 합산
                         ↓
                       [S3]
```

> 소용량(<32MB)은 단건 처리, 대용량은 256MB 청크로 스트리밍 분할 후 chord 병렬 진단.
> 결과 메시지 형식은 기존과 동일해 Spring Boot 변경 없음.

## 기술 스택

| 영역 | 기술 |
|------|------|
| Backend | Spring Boot 4.0.5, Java 17, Spring Security, Spring Data JPA |
| Frontend | React 19, TypeScript, Vite, Ant Design |
| Database | MySQL 8.0 |
| Message Queue | RabbitMQ 3 |
| Object Storage | AWS S3 (로컬: LocalStack) |
| 진단 엔진 | Python 3.11, DSC Engine v3.2 (pandas, scipy) |
| 병렬 처리 | Celery 5.4 (chord/group), Redis 7 (result backend) |
| RAG | ChromaDB, LangChain, sentence-transformers (all-MiniLM-L6-v2) |
| LLM | Claude Haiku (Anthropic API) |
| 실시간 통신 | SSE (Server-Sent Events) |
| Auth | JWT (JJWT, HMAC-SHA256) |
| Infra | Docker Compose, AWS EC2 (t3.small, Elastic IP), GitHub Actions CI/CD |

## 운영 환경 접속

```
http://3.39.50.163
```

## 로컬 개발 환경 세팅

### 사전 요구사항

- **Docker Desktop** (MySQL, RabbitMQ, LocalStack, RAG, Engine 실행용)
- **Java 17** (Spring Boot 백엔드)
- **Node.js 20** (React 프론트엔드)

### Step 1: 환경변수 설정

프로젝트 루트에 `.env` 파일을 생성합니다.

```properties
# Database
DB_URL=jdbc:mysql://localhost:3306/scorecard?useSSL=false&serverTimezone=Asia/Seoul&allowPublicKeyRetrieval=true
DB_USERNAME=scorecard_user
DB_PASSWORD=scorecard_password

# S3 (LocalStack)
AWS_S3_ENDPOINT=http://localhost:4566
AWS_S3_BUCKET=scorecard-uploads
AWS_ACCESS_KEY_ID=test
AWS_SECRET_ACCESS_KEY=test
AWS_REGION=ap-northeast-2

# RabbitMQ
RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672

# JWT (팀원에게 공유받기)
JWT_SECRET=<팀원에게 공유받은 값>

# Claude API (RAG 서비스용 — 팀원에게 공유받기)
ANTHROPIC_API_KEY=<팀원에게 공유받은 값>
```

### Step 2: Docker 인프라 실행

```bash
docker compose up -d
```

| 서비스 | 포트 | 용도 |
|--------|------|------|
| MySQL | 3306 | 데이터베이스 |
| RabbitMQ | 5672, 15672 | 메시지 큐 (15672: 관리 UI, guest/guest) |
| LocalStack | 4566 | 로컬 S3 대체 |
| Redis | 6379 | Celery result backend (병렬 부분결과 수집) |
| RAG Service | 8001 | RAG 가중치 추천 + LLM 리포트 |
| Engine | - | DSC 진단 워커 (Celery Worker + Bridge) |

### Step 3: RAG 인덱싱 (최초 1회)

```bash
docker exec scorecard-rag python scripts/index_documents.py
```

### Step 4: 백엔드 + 프론트엔드 실행

```bash
./gradlew bootRun                # http://localhost:8080
cd frontend && npm install && npm run dev   # http://localhost:5173
```

### 테스트

```bash
./gradlew test
```

## API 엔드포인트

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/api/users/signup` | 회원가입 | - |
| POST | `/api/users/login` | 로그인 | - |
| POST | `/api/uploads/presign` | S3 Presigned URL 발급 | JWT |
| POST | `/api/jobs/start` | 진단 시작 | JWT |
| POST | `/api/jobs/submit` | 파일 업로드 + 진단 (레거시) | JWT |
| GET | `/api/jobs/list` | 내 작업 목록 | JWT |
| GET | `/api/jobs/{jobId}/status` | 작업 상태 조회 | JWT |
| DELETE | `/api/jobs/{jobId}` | 작업 삭제 | JWT |
| GET | `/api/results/{jobId}` | 진단 결과 조회 | JWT |
| GET | `/api/results/{jobId}/report` | LLM 리포트 조회 | JWT |
| GET | `/api/jobs/subscribe` | SSE 실시간 알림 | JWT (쿼리) |
| POST | `/api/weights/recommend` | RAG 가중치 추천 | JWT |

## 프로젝트 구조

```
scorecard/
├── src/main/java/.../scorecard/    # Spring Boot 백엔드
│   ├── auth/           # 인증 (회원가입, 로그인)
│   ├── user/           # 사용자 엔티티
│   ├── job/            # 작업 관리 (업로드, Presigned URL, 상태, 삭제)
│   ├── jobresult/      # 진단 결과 조회
│   ├── global/         # 공통 (보안, 예외, 응답 포맷)
│   └── infrastructure/ # S3, RabbitMQ, SSE, LLM 연동
├── frontend/                       # React 프론트엔드
│   └── src/
│       ├── api/        # Axios API 호출 + SSE 클라이언트
│       ├── pages/      # 페이지 컴포넌트
│       ├── components/ # 공통 컴포넌트
│       └── stores/     # 인증 상태 관리
├── engine/                         # DSC 진단 엔진 (Celery 병렬)
│   ├── dsc_engine.py   # 8개 품질 지표 + 청크별 부분 지표 계산
│   ├── celery_app.py   # Celery 앱 설정 (broker=RabbitMQ, backend=Redis)
│   ├── partitioner.py  # 스트리밍 분할 + reservoir 샘플링
│   ├── aggregator.py   # 부분 결과 합산 → 최종 점수
│   ├── tasks.py        # Celery 태스크 (coordinator/process_chunk/aggregate)
│   ├── bridge.py       # pika → Celery 브릿지
│   └── worker.py       # (레거시) 단일 RabbitMQ Consumer — 폴백
├── rag-service/                    # RAG 서비스 (FastAPI)
│   ├── rag/
│   │   ├── retriever.py   # ChromaDB 벡터 검색
│   │   └── generator.py   # Claude Haiku 응답 생성
│   ├── scripts/
│   │   └── index_documents.py
│   └── data/docs/         # RAG 참조 문서
├── docker-compose.yml              # 로컬 개발용
├── docker-compose.prod.yml         # 운영 배포용
└── docs/                           # 프로젝트 문서
    └── sessions/                   # 세션별 작업 기록
        ├── parallel-engine/        # 병렬 엔진 설계 + 구현
        ├── sse/                    # SSE 설계 + 구현
        ├── rag/                    # RAG 시스템
        ├── infra/                  # 인프라 세팅
        └── setup/                  # 초기 세팅
```

## 팀

| 이름 | 역할 |
|------|------|
| 이지훈 | 웹 플랫폼 개발 (Spring Boot, React, RAG, 인프라) |
| 고준서 | 데이터 품질 진단 엔진 개발 (DSC v3.2) |
| 김동훈 | 프론트엔드 / API 개발 |

## 문서

- `docs/PRD.md` — 시스템 설계, 인터페이스 계약
- `docs/develop.md` — PHASE별 진행 현황
- `docs/architecture.md` — 기술 스택, 아키텍처, 패키지 구조
- `docs/api-endpoints.md` — API 엔드포인트 목록
- `docs/conventions.md` — 코드 컨벤션, 빌드 명령, 환경변수
- `docs/sessions/` — 작업 세션 기록
