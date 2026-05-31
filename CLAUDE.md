# CLAUDE.md — 작업 워크플로우

> 이 파일은 Claude Code 가 모든 세션 시작 시 자동 로드하는 **글로벌 instruction**.
> 핵심 룰: **모든 작업은 백그라운드 agent 로 병렬화 강제**. 메인 세션은 사용자 입력 대기.

---

## 1. 트랙 분류 (모든 요청은 4 트랙 중 하나 이상)

| 트랙 | 무엇 | 1차 참조 | 산출물 위치 |
|---|---|---|---|
| **develop** | 코드 작성/수정/리팩터/디버그 (FE/BE/auth/db) | `docs/develop/*-developer.md`, `docs/global-guide/develop/backend-develop.md` (BE 단일 가이드) | 코드 + `docs/global-guide/develop/specs/{fe,be,db}/*` 갱신 |
| **planner** | 기능 정의 / IA / feature spec / endpoint spec / qa-checklist | `docs/global-guide/plan/*.md` (TBD) | `docs/domain/{name}/prd/*.md` |
| **designer** | Figma MCP 비교 / 디자인 토큰 / wireframe 검증 | `docs/global-guide/design/*.md` (TBD) | `docs/domain/{name}/design/*.md` |
| **ops** | devops / db migration / CI / 배포 / 환경설정 / 보안정책 / 트랙 외 작업 | `docs/ops/*.md` (TBD) | `docs/ops/*.md`, `sql/`, `application*.properties` |

한 요청에 여러 트랙이 섞이면 **트랙별 agent 분리**.

---

## 2. 병렬화 강제 룰 (이 세션의 절대 룰)

1. **모든 작업은 백그라운드 agent 로 분리** — **메인 세션은 입력 대기 / HITL 처리 / 결과 검증만**. 작업이 있으면 무조건 백그라운드 agent. (사용자 별도 지시 없어도 default — Auto Mode 가정)
2. **요청 들어오면 즉시**:
   - (a) 트랙 식별 (1~N 개)
   - (b) 트랙별/병렬 가능 단위로 백그라운드 agent 디스패치 (`run_in_background: true`)
   - (c) 메인 세션은 입력 대기 진입
3. **단일 자명 작업**(파일 1개 1줄 수정 등) 도 가능하면 백그라운드. 메인 세션 부담 최소화. **메인 직접 처리는 § 2-8 의 예외만**
4. **agent 역할 분리** — 동일 파일 충돌 회피:
   - 한 파일군 = 한 agent 가 Edit. 나머지는 Read only
   - 검증/문서화는 Read only agent
5. **agent 디스패치 시 brief 필수** (각 agent 는 컨텍스트 모름):
   - 목적 / 산출물 위치 / 작업 범위 / 제약 (Edit 가능 여부 / 회피할 영역) / 출력 형식
   - **진행상황 stream** — 단계 ≥ 3, 예상 시간 ≥ 5분 인 백그라운드 sub-agent 는 `progress.log` 룰 적용 + 메인이 `Monitor` 띄움. 룰: [.claude/conventions/agent-progress.md](.claude/conventions/agent-progress.md)
6. **메인 어시스턴트 진행 로그 (필수)** — 모든 작업 완료 단위마다 `.claude/.progress/claude-YYYYMMDD.log` 에 1줄 append.
   - **하루 1 파일** — 같은 일자의 모든 사용자 요청·작업이 동일 파일에 누적
   - 포맷: `YYYY-MM-DD HH:MM:SS | (N/M) | {작업 내용} | {상태} [| ref:{ref}]`
   - 새 사용자 요청 시작 시 구분 표시 줄 권장 (`# === 17:28 사용자 요청: ... ===`)
   - 상세 룰: [.claude/conventions/agent-progress.md](.claude/conventions/agent-progress.md) § 7
   - **sub-agent 완료 시 sub-agent log 를 claude-*.log 에 통합 + 원본 삭제** (백그라운드 agent 위임). 상세 룰: [.claude/conventions/agent-progress.md](.claude/conventions/agent-progress.md) § 8
7. **결과 보고 받으면**:
   - (a) 산출물 검증 (`Read`/`Bash ls/wc`)
   - (b) Task 완료 처리 + claude-*.log 1줄 추가
   - (c) 사용자에게 핵심 결과만 짧게 (200자 내)
8. **예외 — 메인에서 직접 처리**:
   - 사용자가 명시적으로 "메인에서 해" 요청
   - 즉답 가능한 단순 질문 (코드 위치 안내, 짧은 설명)
   - 워크플로우 룰 / 메모리 / CLAUDE.md / 컨벤션 같은 메타 갱신 (사용자 직접 확인 필요) — **단 갱신 작업이 5분/3단계 이상이면 백그라운드**
   - agent 결과 보고 후 후속 메시지

---

## 3. 트랙별 1차 ↔ 깊이 참조 매핑

```
docs/
├── domain/                  # 도메인 단위 entry (planner/designer/develop 산출물)
│   ├── legacy/              # 참고용 (PC 버전 — 보존, prd-* 라인)
│   └── {feature}/{prd,design,develop}/   # 신규 라인
├── develop/                 # (위치 유지) 글로벌 개발자 가이드
│   ├── frontend-developer.md
│   ├── auth-developer.md
│   └── backend-developer.md   (TBD)
├── global-guide/            # 전역 참조 (신규)
│   ├── plan/                  (TBD)
│   ├── design/                (TBD)
│   └── develop/specs/{be,db,fe}/   # 코드 reference (신규)
└── ops/                     # 1차 (TBD)
```

⚠️ `docs/specs/` 는 옛 위치 (stale, phase out 예정 — `docs/global-guide/develop/specs/` 로 새로 작성됨)
⚠️ `docs/prd/` 는 prd-* 보존 라인 — 손대지 않음 (`docs/domain/legacy/` 로도 일부 이동됨)

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
| 도메인 기능 기획 | `docs/domain/{feature}/prd/*.md` |
| 도메인 wireframe / 디자인 | `docs/domain/{feature}/design/*.md` |
| 도메인 BE/FE 통합 / 통합검증 | `docs/domain/{feature}/develop/*.md` |
| BE 개발자 가이드 (1차) | `docs/global-guide/develop/backend-develop.md` |
| BE 코드 reference | `docs/global-guide/develop/specs/be/*.md` |
| DB reference | `docs/global-guide/develop/specs/db/*.md` |
| FE 코드 reference | `docs/global-guide/develop/specs/fe/*.md` |
| 개발자 컨벤션 가이드 | `docs/develop/*.md` (위치 유지) |
| (legacy) PC 버전 PRD | `docs/domain/legacy/*.md` |
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
- **`docs/develop/*`, `docs/global-guide/plan/*` 등** — 코드 컨벤션, 프로세스, 트랙 가이드. 사람도 읽고 Claude 도 참조
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
- ❌ 메인 세션이 직접 코드/문서 광범위 Edit — 항상 agent 디스패치
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
- ✅ `docs/global-guide/develop/backend-develop.md` (BE 단일 1차 가이드)
- ⏳ `docs/global-guide/plan/*.md` (ia / feature-spec / endpoint-spec / qa-checklist)
- ⏳ `docs/global-guide/design/*.md` (figma-sync / token-spec)
- ⏳ `docs/ops/*.md` (deploy / env / security-policy)

작성 시: 200~350줄, 표/체크리스트/짧은 코드 위주, history 서술 제거, "신규 추가 N단계 체크리스트" 필수 포함.

---

## 11. Agent 모델 정책 (cost 효율)

본 프로젝트 sub-agent 의 default 모델 매핑. agent `.md` frontmatter 의 `model:` 키로 적용. **다음 세션부터 자동 일관 적용**.

| agent | 모델 | 사유 |
|---|---|---|
| frontend-developer | sonnet | 코드 작성/수정 — 패턴 매칭 중심, Sonnet 충분 |
| backend-developer | sonnet | 동상 |
| developer-analyze | sonnet | 분석 brief self-contained 시 Sonnet 충분 (brief 강화 룰 함께 적용 — agent .md § 12) |
| planner-lite | sonnet | 단일 라운드 통합 기획 — Sonnet 충분 |
| designer-render / designer-review | sonnet | Figma 비교/렌더 — 시각 reasoning 보다 토큰 매핑 중심 |
| **developer-integrate** | **opus** | cross-validate — 다중 결과 통합 + mismatch reasoning 필요 |
| **planner-division** | **opus** | 3라운드 분할 + HITL 운영 — reasoning 깊이 필요 |
| **planner / designer / developer / prd-wireframe-generator** | (`_deprecated_/`) | active 풀 외 — 신규 사용 시 별도 결정 |
| general-purpose | (내장 — Claude Code 매핑 따름) | 직접 변경 불가. brief 강화로 보완 |

### 11.1 메인 어시스턴트 dispatch 시 주의

- **Sonnet agent dispatch** → brief 를 더 self-contained 하게 (체크리스트 / 출력 § 구조 / 회피 영역 / 검증 명시)
- **Opus agent dispatch** → cross-validate / mismatch 탐지 / 사용자 결정 사안 추출이 brief 핵심
- 모델 변경이 필요하면 (예: 특정 라운드만 Opus 로 부스트) `Agent` 도구의 `model` 파라미터로 override 가능

### 11.2 developer-analyze 강화 룰 (Sonnet 다운그레이드 보완)

- 분석문서 § 구조 7항목 강제 (현황 / 발견 / 매핑 / follow-up 우선순위 4단계 / 트랙 / dispatch brief / 자체 평가)
- HITL 4분야 (법무/결제/권한/db/secret) — agent 가 **자체 결정 금지**, 마커만 표시
- 상세: `.claude/agents/developer-analyze.md` § 12

---

## 12. Token Efficiency 룰 (메인 컨텍스트 부담 최소화)

본 세션에서 messages 가 200k+ 누적된 분석 결과 — sub-agent 보고 본문이 메인 컨텍스트로 그대로 흡수되는 게 가장 큰 원인. 다음 룰 강제.

### 12.1 sub-agent 보고 형식 (필수 — 모든 dispatch brief 에 포함)

```
산출 후 메인 보고 — **다음 형식 엄수**:
1. 산출물 경로 (절대 경로 1줄)
2. 핵심 결과 표 (3~7행, 1열당 1줄)
3. build/검증 결과 (1줄)
4. 미해결 / HITL 마커 (있을 때만)

⚠️ 본 보고는 메인 컨텍스트로 흡수됨 — **300줄 이하** 엄수. 상세 내용은 산출 파일에. 진행 단계 나열 / 코드 snippet / 변경 라인별 설명 금지.
```

### 12.2 메인 어시스턴트 Read 룰

| 상황 | 룰 |
|---|---|
| 분석문서 / 가이드 / 큰 산출물 (300줄+) 검증 | **sub-agent 에 위임** (Read + 핵심 요약 보고). 메인 직접 Read X |
| 메인이 직접 Read 해야 할 때 | **§ 단위 offset + limit** — 한 번에 200줄 이내. 첫 100줄 보고 무관하면 종료 |
| 작은 파일 (frontmatter / config / 짧은 보고서) | 메인 직접 Read OK |
| 분석문서 § 7 dispatch brief | 메인 직접 Read 권장 (그대로 sub-agent 에 복붙) — 단 §  단위만 |

### 12.3 메인 응답 룰

- 사용자에게는 **200자 내 핵심만** (이미 기존 § 7 룰 — 재강조)
- 표/체크리스트 우선, 산문 최소화
- agent 보고 본문 그대로 사용자에 forward 금지 — 메인이 1차 가공

### 12.4 세션 분할 권고

- messages 100k 도달 시 — `/compact` 권고 (자동 요약)
- messages 200k 도달 시 — 새 세션 권고 (현재 작업 마무리 후 다음 작업은 신규 세션)
- 단일 사용자 요청이 100k+ context 예상되면 — **시작 시점에 trail (작은 라운드로 분할) 권고**

### 12.5 dispatch brief 자체도 토큰 절약

- brief 가 200줄 이상이면 — 분석문서 § 참조로 대체 (`상세: docs/.../analysis.md § 7.2`)
- 반복 룰은 컨벤션 파일 참조 (`적용 룰: .claude/conventions/responsive-mobile-first.md § 3`)
