# CLAUDE.md — 컴프야펀 (COMPYAFUN) 작업 허브

> Claude Code 가 세션마다 자동 로드하는 유일한 진입점. **규칙 본문은 여기 없다** — `.claude/rules/` 가 경로별로 자동 실리고, 운영 절차는 `.claude/conventions/` 에 있다. 이 파일은 100줄 안에 유지한다.

## 0. 프로젝트

컴투스프로야구 팬을 위한 비공식 데이터 사이트. 쿠폰·이벤트·공지 모음 + 게임 데이터(스킬·구종·선수·레전드 재료) 검색. 이용자·제약·원칙: `PRODUCT.md`.

| 항목 | 값 |
|---|---|
| BE | Java 21 · Spring Boot 3 · MyBatis · MariaDB. **JPA 아님.** `src/main/java/com/dawne/com2usbaseball` |
| FE | React 19 · Redux Toolkit 2 · Vite 7 · JS/JSX. **TS 아님.** `web/src` |
| DB | ⚠️ **test = prod 동일 인스턴스.** DDL 은 즉시 운영 반영 → 항상 사용자 승인 + ops 트랙 |
| 환경 | Windows 10 · PowerShell 5.1(`&&` 미지원, `;` + `if ($?)`) · Bash 도 사용 가능 |
| 버전 | 기능 `vX.Y.Z` / 플랫폼 `platform-X.Y` 두 축. 기준선 `v2.0.0 (platform-2.0)` |

## 1. 규칙이 어디서 오나

| 위치 | 로드 | 내용 |
|---|---|---|
| `.claude/rules/common/*.md` | 항상 | docs-policy · file-split · hitl-markers · commit-version · git-scope · domain-naming |
| `.claude/rules/be/*.md` | `src/main/**` 를 읽을 때 | BE 규칙 · 구조 지도 |
| `.claude/rules/fe/*.md` | `web/src/**` 를 읽을 때 | FE 구조 · store · 디자인 값 · 디자인 검사 · 광고 · 뱃지 |
| `.claude/conventions/*.md` | 메인 세션이 Read / dispatch brief 에서 지정 | tool-routing · agent-progress · file-locks · release-procedure |
| `.claude/agents/*.md` · `workflows/` · `templates/` · `references/` | Claude Code 규약대로 | agent 정의 · 병렬 워크플로 · 문서 템플릿 · agent 전용 자료 |

@.claude/conventions/tool-routing.md

sub-agent 에게는 path 규칙 자동 적용을 믿지 말고 **brief 에 Read 할 rules 파일을 명시**한다 (예: `Read .claude/rules/fe/fe-store.md`).

## 2. 트랙 4개 — 모든 요청은 하나 이상

| 트랙 | 무엇 | 산출물 | 버전 영향 |
|---|---|---|---|
| **develop** | 코드 작성·수정·리팩터·디버그 | 코드 + `docs/features/<f>/history.md` | 기능 또는 플랫폼 |
| **planner** | 기능 정의·IA·spec | `docs/features/<f>/spec.md` | 기록 안 함 (develop 반영 시) |
| **designer** | Figma MCP 조작·디자인 토큰·화면 검증 | `docs/features/<f>/design.md` + Figma | 기록 안 함 |
| **ops** | DB 마이그레이션·CI·배포·환경·보안 | `sql/` · `application*.properties` · `.github/` | 플랫폼 또는 무영향 |

한 요청에 트랙이 섞이면 트랙별 agent 분리. 도구 선택은 위 `tool-routing` 표를 위에서부터 읽고 처음 걸린 줄에서 멈춘다.

## 3. 메인 세션의 절대 룰

1. **작업은 백그라운드 agent 로.** 메인은 트랙 식별 → dispatch(`run_in_background: true`) → 입력 대기 → HITL 처리 → 결과 검증만. 메인 직접 처리는: 즉답 · 메타 갱신(CLAUDE.md·rules·메모리, 단 3단계/5분 미만) · agent 보고 후 후속 메시지 · 사용자가 "메인에서 해" 라고 한 것
2. **한 파일군 = Edit agent 하나.** 나머지는 Read only. dispatch 전 `.claude/.locks/` 검사 → `conventions/file-locks.md`
3. **brief 필수** — 목적 · 산출물 경로 · 범위 · Edit 가능 여부 · 회피 영역 · Read 할 rules · 버전 영향 · 보고 형식(§ 5). 단계 ≥ 3 또는 5분 이상이면 progress.log + Monitor → `conventions/agent-progress.md`
4. **진행 로그** — 요청 단위마다 `.claude/.progress/claude-YYYYMMDD.log` 에 1줄. sub-agent 완료 시 그 로그를 흡수 + 원본 삭제
5. **master 직접 커밋·푸시 금지.** 브랜치(`feat/` `fix/` `refactor/` `docs/` `ops/`) → PR → 머지. `--force` 는 승인 사안. **세션 = worktree = 브랜치 = 기능 하나가 기본** — 병렬 세션은 `claude --worktree`, 같은 디렉터리에 세션 둘은 금지
   **커밋은 이 세션이 고친 파일만** `git add <경로>` 로 (`-A`/`.`/`-a` 금지). **`docs/**`·`*.md` 는 사용자가 명시적으로 문서 커밋을 지시했을 때만** `ALLOW_DOCS=1` 로 스테이징 — 그 외엔 빼고 보고에 한 줄. 코드는 범주별(sql/be/web) 분리, md 는 `.claude` → `docs` → 그 밖의 md 순으로 갈래마다 브랜치 1회. 상세 `rules/common/git-scope.md`, hook 이 강제
6. **파괴적 작업은 항상 확인** — DB drop/DDL · 환경변수 · git force · 파일 대량 삭제. HITL 마커 🔴 는 답변 전 확정하지 않는다
7. **결과 보고 받으면** 산출물 존재 확인 → 로그 1줄 → `CHANGELOG.md` `[Unreleased]` 갱신 판단(기능·플랫폼 영향 시만) → 사용자에게 200자 내 핵심

## 4. 문서 — 새 파일은 딱 둘

① 새 기능 → `docs/features/<f>/{spec,design,history}.md` ② 여러 기능에 걸친 결정 → `docs/decisions/NNNN-slug.md`. 버그 수정·리팩터·리뷰·감사·실측은 **기존 파일 갱신**. 작업 문서는 `.claude/.progress/<branch>/` 에 두고 머지 전 삭제(PR 본문 첨부). 사람 창작물(디자인 html·기획 md·엑셀)은 `drafts/<branch>/` 에 두고 통합 단계에서 삭제. 템플릿은 `.claude/templates/` 만. 상세 `rules/common/docs-policy.md`.

`docs/` 는 포트폴리오(사람이 읽음), `.claude/` 는 운영(agent 가 읽음). 같은 내용을 두 곳에 적지 않는다.

## 5. 토큰 규율

- sub-agent 보고는 **300줄 이하**: 산출물 경로 1줄 · 핵심 표 3~7행 · 검증 1줄 · 미해결/HITL. 상세는 파일에
- 메인은 300줄+ 파일을 직접 Read 하지 않는다 — sub-agent 에 요약 위임. 직접 읽어야 하면 § 단위 200줄 이내
- brief 가 200줄 넘으면 분석문서 § 참조로 대체. 반복 룰은 rules 파일 경로로
- messages 100k → `/compact`, 200k → 새 세션. 큰 요청은 시작 시 라운드 분할 제안

## 6. 도메인 이름

목록을 외우지 않는다 — `bash .claude/scripts/domain-map.sh` 가 FE 폴더(정본) ↔ BE 패키지 ↔ API 를 뽑는다. 이름 계약·버전 접미 금지·legacy 일몰은 `rules/common/domain-naming.md`. `community` 는 동결(수정 금지). 삭제된 도메인 이름은 예시로 쓰지 않는다.

## 7. Agent 모델

sonnet: `frontend-developer` `backend-developer` `developer-analyze` `planner-lite` `designer-render` `designer-review` — brief 를 self-contained 하게(체크리스트·출력 §·회피 영역·검증).
opus: `developer-integrate` `planner-division` — cross-validate · mismatch · 사용자 결정 추출이 brief 핵심.
`_deprecated_/` 의 `planner` `designer` `developer` `prd-wireframe-generator` 는 사용 안 함.

## 8. 안티패턴

메인이 코드 광범위 Edit · Edit agent 둘이 같은 파일군 · brief 없는 dispatch · agent 끝난 뒤 메인이 같은 영역 재수정 · 트랙 외 작업을 develop 에 끼워넣기 · master 직접 커밋 · agent 보고 본문을 사용자에게 그대로 전달 · `docs/` 에 리뷰·감사 폴더 신설.
