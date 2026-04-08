# CONTRIBUTING.md

# 🤝 Contributing Guide — aidq-platform

> 이 문서는 `aidq-platform` 프로젝트의 커밋 컨벤션, 브랜치 전략, 작업 흐름을 정의합니다.  
> 모든 팀원은 이 가이드를 숙지하고 따라주세요.

---

## 1. 커밋 메시지 컨벤션

### 형식

```text
<type>(<scope>): <한글 subject>
```

### 예시

```text
feat(auth): 로그인 API 구현
fix(job): 파일 업로드 시 500 오류 수정
chore(infra): docker-compose named volume으로 전환
refactor(user): 유저 검증 로직 UserService로 분리
docs: CONTRIBUTING.md 추가
```

---

### Type 목록

| Type | 설명 |
|---|---|
| `feat` | 새로운 기능 추가 |
| `fix` | 버그 수정 |
| `chore` | 빌드, 설정, 인프라 등 기능과 무관한 작업 |
| `docs` | 문서 추가 및 수정 |
| `refactor` | 동작 변경 없이 코드 구조 개선 |
| `test` | 테스트 코드 추가 및 수정 |
| `style` | 포맷팅, 세미콜론 등 코드 스타일 수정 |
| `ci` | CI/CD 파이프라인 관련 수정 |
| `perf` | 성능 개선 |

---

### Scope 목록

| Scope | 설명 |
|---|---|
| `auth` | 인증 / JWT 관련 |
| `user` | 유저 도메인 |
| `job` | 진단 작업 도메인 |
| `result` | 진단 결과 도메인 |
| `infra` | Docker, 인프라 설정 |
| `gradle` | 빌드 설정 |
| `config` | 앱 설정 (application.yml 등) |

> scope는 작업 대상에 맞게 자유롭게 추가 가능합니다.

---

### 규칙

- `type`, `scope`는 **영어 소문자**로 작성
- `subject`는 **한글**로 작성, 마침표 없이 끝내기
- subject는 **50자 이내** 권장
- 명령형으로 작성 (`추가했다` ❌ → `추가` ✅)

---

## 2. 브랜치 전략 — GitHub Flow

### 구조

```text
main
 ├── feat/be-auth-login        ← Spring Boot 기능 작업
 ├── feat/fa-rabbitmq-consumer ← FastAPI 기능 작업
 └── fix/be-job-status-bug     ← 버그 수정
```

### main 브랜치 규칙

- `main`은 **항상 배포 가능한 상태**를 유지합니다.
- `main`에 직접 push하는 것을 **금지**합니다.
- 모든 작업은 **브랜치 생성 → PR → 리뷰 → merge** 순서로 진행합니다.

---

### 브랜치 네이밍

| 패턴 | 용도 | 예시 |
|---|---|---|
| `feat/be-{작업명}` | Spring Boot 기능 개발 | `feat/be-auth-login` |
| `feat/fa-{작업명}` | FastAPI 기능 개발 | `feat/fa-rabbitmq-consumer` |
| `feat/fe-{작업명}` | Frontend 기능 개발 | `feat/fe-upload-page` |
| `fix/{작업명}` | 버그 수정 | `fix/be-jwt-expiry` |
| `chore/{작업명}` | 설정, 인프라 작업 | `chore/docker-named-volume` |
| `docs/{작업명}` | 문서 작업 | `docs/api-spec` |

---

## 3. 작업 흐름 (Workflow)

```bash
# 1. main 최신화
git checkout main
git pull origin main

# 2. 작업 브랜치 생성
git checkout -b feat/be-auth-login

# 3. 작업 후 커밋
git add .
git commit -m "feat(auth): 로그인 API 구현"

# 4. 원격 push
git push origin feat/be-auth-login

# 5. GitHub에서 Pull Request 오픈
#    → 팀원 리뷰 요청 → Approve → main에 merge

# 6. 브랜치 삭제
git branch -d feat/be-auth-login
```

---

## 4. Pull Request 규칙

- PR 제목은 커밋 메시지 형식을 따릅니다: `feat(auth): 로그인 API 구현`
- PR 본문에는 **작업 내용, 변경 이유, 테스트 방법**을 간략히 작성합니다.
- 셀프 리뷰 후 팀원 리뷰를 요청합니다.
- merge 방식은 **Squash and Merge** 또는 **Merge Commit** 중 팀이 합의한 방식을 따릅니다.

---

## 5. 초기 커밋 구조

프로젝트 초기 세팅은 아래 4개의 커밋으로 구성합니다.

```text
chore: .gitignore, .gitattributes, CONTRIBUTING.md 추가
chore(gradle): Gradle wrapper 및 빌드 설정 추가
chore(infra): docker-compose 설정 추가
feat: Spring Boot 애플리케이션 기본 골격 추가
```

---

_Last updated: 2026-04-08_
