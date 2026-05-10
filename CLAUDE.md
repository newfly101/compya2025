# CLAUDE.md — 작업 워크플로우

> 이 파일은 Claude Code 가 모든 세션 시작 시 자동 로드하는 **글로벌 instruction**.
> 핵심 룰: **모든 작업은 백그라운드 agent 로 병렬화 강제**. 메인 세션은 사용자 입력 대기.

---

## 1. 트랙 분류 (모든 요청은 4 트랙 중 하나 이상)

| 트랙 | 무엇 | 1차 참조 | 산출물 위치 |
|---|---|---|---|
| **develop** | 코드 작성/수정/리팩터/디버그 (FE/BE/auth/db) | `docs/develop/*-developer.md` | 코드 + `docs/specs/{fe,be}/*` 갱신 |
| **planner** | 기능 정의 / IA / feature spec / endpoint spec / qa-checklist | `docs/planner/*.md` (TBD) | `docs/prd/domains/*.md`, `docs/prd/_meta/*.md` |
| **designer** | Figma MCP 비교 / 디자인 토큰 / wireframe 검증 | `docs/designer/*.md` (TBD) | `docs/prd/wireframes/*.md`, `docs/prd/design-sync/*.md` |
| **ops** | devops / db migration / CI / 배포 / 환경설정 / 보안정책 / 트랙 외 작업 | `docs/ops/*.md` (TBD) | `docs/ops/*.md`, `sql/`, `application*.properties` |

한 요청에 여러 트랙이 섞이면 **트랙별 agent 분리**.

---

## 2. 병렬화 강제 룰 (이 세션의 절대 룰)

1. **모든 작업은 백그라운드 agent 로 분리** — 메인 세션은 분류 + 디스패치 + 결과 검증만
2. **요청 들어오면 즉시**:
   - (a) 트랙 식별 (1~N 개)
   - (b) 트랙별/병렬 가능 단위로 백그라운드 agent 디스패치
   - (c) 메인 세션은 입력 대기 진입 (`run_in_background: true`)
3. **단일 자명 작업**(파일 1개 1줄 수정 등) 도 가능하면 백그라운드. 메인 세션 부담 최소화
4. **agent 역할 분리** — 동일 파일 충돌 회피:
   - 한 파일군 = 한 agent 가 Edit. 나머지는 Read only
   - 검증/문서화는 Read only agent
5. **agent 디스패치 시 brief 필수** (각 agent 는 컨텍스트 모름):
   - 목적 / 산출물 위치 / 작업 범위 / 제약 (Edit 가능 여부 / 회피할 영역) / 출력 형식
6. **결과 보고 받으면**:
   - (a) 산출물 검증 (`Read`/`Bash ls/wc`)
   - (b) Task 완료 처리
   - (c) 사용자에게 핵심 결과만 짧게 (200자 내)
7. **예외 — 메인에서 직접 처리**:
   - 사용자가 명시적으로 "메인에서 해" 요청
   - 즉답 가능한 단순 질문 (코드 위치 안내, 짧은 설명)
   - agent 결과 보고 후 후속 메시지

---

## 3. 트랙별 1차 ↔ 깊이 참조 매핑

```
docs/
├── develop/                # 1차 (Claude 작업 진입점)
│   ├── frontend-developer.md
│   ├── auth-developer.md
│   └── backend-developer.md   (TBD)
├── planner/                # 1차 (TBD)
├── designer/               # 1차 (TBD)
├── ops/                    # 1차 (TBD)
├── specs/                  # 깊이 (develop 트랙에서 참조)
│   ├── fe/  (frontend-structure, module-conventions, api-calls, dead-suspects)
│   └── be/  (backend-structure, endpoints, services, auth-and-flags, dead-suspects, unused-apis)
├── prd/                    # 깊이 (planner/designer 산출물)
│   ├── domains/
│   ├── wireframes/
│   ├── design-sync/
│   └── _meta/
└── reconciliation/         # 차이 조정 보고
```

**규칙**:
- 메인 세션은 1차만 읽음 (토큰/사고 비용 최소화)
- 깊이 참조는 agent 가 필요 시 본인 컨텍스트에서 읽음
- 1차 가이드 = 함축 (200~350줄 권장). 깊이 참조 = 풀 명세

---

## 4. 산출물 위치 룰

| 작업 | 위치 |
|---|---|
| FE 코드 | `web/src/**` |
| BE 코드 | `src/main/java/**`, `src/main/resources/**` |
| FE 컨벤션 갱신 | `docs/specs/fe/*` |
| BE 컨벤션 갱신 | `docs/specs/be/*` |
| 도메인 기능 기획 | `docs/prd/domains/{domain}.md` |
| 도메인 wireframe | `docs/prd/wireframes/{domain}.md` |
| 디자인 ↔ 구현 차이 보고 | `docs/prd/design-sync/{domain}.md` |
| 보안 / 환경 / 배포 정책 | `docs/ops/*.md` |
| DB schema | `sql/V2/{site,fun}/*.sql` |

신규 산출물은 **반드시 위 트리 안에**. 임시 파일은 작업 후 삭제.

---

## 5. agent 디스패치 패턴 (실전)

### 5.1 단일 트랙, 분석 + 수정 분리

```
Track A (Edit):  "{도메인} 코드 검증 + 명백 결함 수정"
Track B (Read):  "{도메인} 함축 가이드 docs/develop/{name}-developer.md"
```

### 5.2 멀티 트랙 (개발 + 기획 동시)

```
Track A (planner): "{도메인}.md Part B IA 정립"
Track B (develop): "{도메인} 현재 코드 ↔ Part A 차이 보고서"
Track C (designer): "{도메인} figma ↔ 구현 design-sync 보고서" (live 도메인만)
```

### 5.3 도메인 단위 병렬

```
Track A: domain coupons
Track B: domain events
Track C: domain notices
(같은 작업을 여러 도메인에 병렬 적용)
```

---

## 6. 메모리 vs 가이드 경계

- **auto memory** (`C:\Users\hibee\.claude\projects\D--NewProjects-com2usbaseball\memory\`) — user / feedback / project / reference. 세션 간 영속, 짧은 fact
- **`docs/develop/*`, `docs/planner/*` 등** — 코드 컨벤션, 프로세스, 트랙 가이드. 사람도 읽고 Claude 도 참조
- **`MEMORY.md`** — 메모리 인덱스 (자동 로드)
- **CLAUDE.md** (이 파일) — 워크플로우 룰. 모든 세션 자동 로드

같은 정보를 두 곳에 중복 저장 금지. 코드 컨벤션은 항상 `docs/`, 사용자 개인 선호는 메모리.

---

## 7. 보고 톤

- **메인 세션 응답** — 짧게. 핵심 결과 + 검증 포인트 + 다음 액션. 200자 내 권장
- **agent 보고** — 풍부 OK (메인 세션 외부에서 일어남, 토큰 부담 분리)
- **에러/위험** — 즉시 보고. 사용자 결정 사안은 옵션 제시 (1~2 권고안)

---

## 8. 주의 / 안티패턴

- ❌ 메인 세션이 직접 코드 광범위 Edit — 항상 agent 디스패치
- ❌ agent 가 끝난 후 메인이 동일 영역 추가 Edit — agent 한 번에 끝내기
- ❌ Edit 담당 agent 2개 이상이 같은 파일군 — 충돌
- ❌ agent 에 brief 없이 "그냥 해줘" — 컨텍스트 누락
- ❌ 트랙 외 작업을 도메인 트랙에 끼워넣기 (e.g. CI 설정을 develop 에) — ops 로 분리
- ❌ 1차 가이드를 길게 쓰기 (400줄 초과) — 깊이로 분리
- ❌ 사용자 결정 없이 destructive 작업 (db drop / 환경변수 변경 / git force) — 항상 확인

---

## 9. 환경

- OS: Windows 10, PowerShell 5.1 (`&&`/`||` 미지원, `;` + `if ($?)` 사용)
- Bash 도구도 사용 가능 (POSIX 스크립트)
- 빌드: Gradle (BE), Vite (FE in `web/`)
- DB: MariaDB + MyBatis (JPA 아님)
- 배포 환경: 로컬(`application.properties`) + 운영(`application-prod.properties`)

---

## 10. 트랙별 가이드 작성 순서 (현재 진행)

- ✅ `docs/develop/frontend-developer.md`
- ✅ `docs/develop/auth-developer.md`
- ⏳ `docs/develop/backend-developer.md`
- ⏳ `docs/planner/*.md` (ia / feature-spec / endpoint-spec / qa-checklist)
- ⏳ `docs/designer/*.md` (figma-sync / token-spec)
- ⏳ `docs/ops/*.md` (deploy / env / security-policy)

작성 시: 200~350줄, 표/체크리스트/짧은 코드 위주, history 서술 제거, "신규 추가 N단계 체크리스트" 필수 포함.
