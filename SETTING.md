# SETTING.md — 신규 사용자 셋업 가이드

> 이 저장소의 **agent 자동화 워크플로우 + Figma 연동 환경** 을 처음 받은 사람이 동일한 결과를 낼 수 있도록 안내.

본 저장소의 핵심 = `.claude/` (agent / skill 정의) + `figma-plugin/` (Figma 자동화) + `CLAUDE.md` (워크플로우 룰) 3종.

---

## 1. 사전 준비물

| 항목 | 버전 / 비고 |
|---|---|
| **Claude Code** | https://claude.com/claude-code — 본 agent 시스템 동작 환경 |
| **Figma Desktop App** | https://www.figma.com/downloads/ — Plugin 실행 + Dev Mode |
| **Node.js** | 18+ (figma-plugin 빌드용 — `tsc`) |
| **Git** | clone / commit |
| **Figma 계정** | 디자인 파일 접근 권한 |

---

## 2. 설치 단계

### 2.1 저장소 clone

```bash
git clone <repo-url>
cd com2usbaseball
```

### 2.2 `.claude/` 자동 인식

Claude Code 는 저장소 root 의 `.claude/` 폴더를 자동 로드. 별도 setup 불필요.

확인:
```
Claude Code 실행 → /agents 명령어로 등록된 agent list 확인
```

등록되어야 하는 agent (총 6개):
- `planner` — 10년차 기획자, reverse / forward 기획
- `designer` — 10년차 디자이너, Figma plugin code 작성
- `developer` — 테크리드, BE/FE 작업 분배 (read-only supervisor)
- `backend-developer` — Spring Boot + MyBatis BE 구현
- `frontend-developer` — React + Redux Toolkit FE 구현
- `prd-wireframe-generator` — 보존 (legacy 라인)

### 2.3 `figma-plugin` 빌드 (1회 + 작업 시 watch)

```bash
cd figma-plugin
npm install       # @figma/plugin-typings + typescript 설치
npm run build     # tsc → code.js 생성
```

작업 중에는 watch 모드 권장 (designer agent 가 `code.ts` 덮어쓸 때마다 자동 컴파일):

```bash
cd figma-plugin
npm run watch     # 별도 터미널에 띄움
```

### 2.4 Figma Desktop 에 plugin 등록 (1회만)

1. Figma Desktop App 실행
2. 메뉴: `Plugins` → `Development` → `Import plugin from manifest…`
3. `<repo>/figma-plugin/manifest.json` 선택
4. plugin list 에 **"Compyafun Designer Bridge"** 가 나타나면 성공

### 2.5 Figma MCP 연결 (Dev Mode read 도구)

본 프로젝트는 Figma Dev Mode MCP (`mcp__figma-dev-mode__*`) 를 read 채널로 사용:
- `get_design_context` — 디자인 토큰 / 노드 분석
- `get_screenshot` — frame 캡처
- `get_metadata` — frame 메타정보

**연결 방법** (Claude Desktop 기준):
1. Figma Desktop → 해당 디자인 파일 열기
2. Dev Mode 토글 ON (오른쪽 상단)
3. Claude Desktop 의 Settings → MCP Servers → Figma Dev Mode 활성화
4. Claude Code 재시작 후 도구 list 에 `mcp__figma-dev-mode__*` 노출 확인

> Claude Code (CLI) 에서 MCP 등록은 `~/.claude.json` 또는 프로젝트 `.claude/mcp.json` 에서. 본 저장소는 MCP config 추적 X (각자 환경 의존).

---

## 3. 워크플로우 개요

```
사용자 요청
   ↓
[1] planner agent (기획)         → docs/domain/{feature}/prd/*.md
   ↓
[2] designer agent (디자인)       → docs/domain/{feature}/design/*.md
                                  → figma-plugin/code.ts (덮어쓰기)
   ↓
   사용자: Ctrl+Alt+P (Figma 에서 plugin 실행) ← 사용자 액션 1회
   ↓
[3] developer agent (분배 plan)   → docs/domain/{feature}/develop/dispatch-plan.md
   ↓
[4] backend-developer + frontend-developer 병렬 → BE/FE 코드 작성
   ↓
[5] developer agent (통합 검증)   → docs/domain/{feature}/develop/integrate-review.md
```

자세한 폴더 구조는 [`docs/README.md`](./docs/README.md) 참조.

---

## 4. 프롬프트 샘플 (신규 사용자용)

> 첫 작업을 시작하는 사용자가 그대로 복사해 쓸 수 있는 한국어 프롬프트 예시. 메인 어시스턴트가 적절한 agent 선택 + dispatch 까지 알아서 처리.

### 4.1 신규 도메인 기획 (forward)

```
{도메인명} 도메인을 신규 기획해줘. planner agent 사용. forward 모드.
사용자 요구: <한 단락 자유 서술>
산출물은 docs/domain/{도메인명}/prd/ 에.
```

### 4.2 기존 코드 → 기획 추출 (reverse)

```
{도메인명} 도메인을 reverse 기획해줘. planner agent.
코드 baseline: web/src/domains/{도메인명}/ + src/main/java/.../{도메인명}/
산출물: docs/domain/{도메인명}/prd/
```

### 4.3 Figma 에 화면 자동 그리기 (전체 도메인)

```
{도메인명} 도메인 화면을 Figma 에 frame 으로 자동 생성해줘. designer agent.
- 입력: docs/domain/{도메인명}/prd/feature-spec.md
- Figma URL: https://www.figma.com/design/{file-key}/?node-id={node-id}
- 모드: create (수정 X, 생성 위주)

(layout / 전역 설정 디자인이 필요한 경우엔 먼저 developer 가 코드 분석 → planner 가 reverse 기획 → designer 순서로 진행해줘)
```

### 4.4 Figma frame 부분 수정 (단순)

```
Figma frame {node-id} 의 배경 색상을 #{hex} 로 변경하는 plugin code 작성해줘.
designer-plugin-code skill 단독 호출 (분석 단계 skip).
```

### 4.5 BE/FE 코드 구현 (도메인 전체)

```
{도메인명} 도메인을 코드로 구현해줘. developer agent 가 작업 분배 plan 짜고,
backend-developer / frontend-developer 병렬 dispatch.
- 기획: docs/domain/{도메인명}/prd/
- 디자인: docs/domain/{도메인명}/design/
- 산출물 위치: src/main/.../{도메인명}/, web/src/domains/{도메인명}/
양쪽 완료 후 developer integrate-review 로 cross-domain 정합 검증.
```

### 4.6 코드 구조 분석 (글로벌 spec 작성)

```
현재 {영역} 코드 분석해서 docs/global-guide/develop/specs/{영역}/ 에 spec 작성해줘.
- {영역}: be / db / fe
- 입력: src/main/** 또는 web/src/**
- 도메인 골고루 cover
```

### 4.7 PRD 재작성 (legacy → 현행 마이그)

```
{도메인명} 도메인의 기존 PC 버전 기획을 모바일 기준으로 재작성해줘.
- legacy 참고: docs/domain/legacy/{도메인명}.md
- 현재 코드: web/src/domains/{도메인명}/
- planner reverse + 현행 정합
- 산출물: docs/domain/{도메인명}/prd/
```

### 4.8 백그라운드 병렬 처리 (다중 작업)

```
다음 작업들을 백그라운드 병렬로 진행해줘:
- Track 1: <작업 A>
- Track 2: <작업 B>
- Track 3: <작업 C>
완료 알림 받으면 보고해.
```

---

### 메인 어시스턴트가 자동으로 처리하는 것

위 프롬프트만 던지면 메인이:
1. 적절한 agent 선택 + dispatch
2. 백그라운드 병렬 진행 (가능한 경우)
3. HITL 4분야 (🔴) 항목 사용자에게 확인
4. 산출물 검증 + commit 권고

사용자는 다음만 하면 됨:
- 🔴 마커 항목 답변
- Figma 적용: **`Ctrl+Alt+P`** 1회 (designer 작업 후)
- commit 단위 결정

---

## 5. 사용자 액션 정리

| 단계 | 사용자가 해야 하는 것 |
|---|---|
| HITL 결정 사항 | 🔴 (권한 / 결제 / DB 파괴적 / 외부 시스템) 마커 항목에 답변 |
| Figma 적용 | Figma Desktop 에서 **`Ctrl+Alt+P`** (Run Last Plugin) — 1회 클릭 |
| commit 결정 | agent 작업 결과 검증 후 commit 단위 지시 |

> 그 외는 모두 자동 (build / 산출물 작성 / 검증).

---

## 5. 검증 체크리스트

설치 직후 다음 동작이 가능한지 확인:

- [ ] Claude Code `/agents` 에 6개 agent list 표시
- [ ] `figma-plugin/` 에서 `npm run build` PASS (TypeScript strict)
- [ ] Figma Desktop plugin list 에 "Compyafun Designer Bridge" 노출
- [ ] Claude Code 도구 list 에 `mcp__figma-dev-mode__*` 3개 노출
- [ ] `docs/README.md` 의 트리대로 `docs/domain/`, `docs/global-guide/` 폴더 존재

---

## 6. troubleshooting

| 증상 | 원인 / 해결 |
|---|---|
| `/agents` 에 agent 안 보임 | Claude Code 재시작. `.claude/agents/*.md` 파일 존재 확인 |
| Figma plugin 실행해도 동작 X | `npm run build` 또는 watch 가 떠있는지 확인. `figma-plugin/code.js` 가 최신인지 |
| `mcp__figma-dev-mode__*` 도구 없음 | Figma Desktop Dev Mode ON + Claude MCP 설정 활성화 후 재시작 |
| `code.ts` 빌드 fail | TypeScript strict 에러 — agent 가 작성한 code.ts 에 type cast 누락 가능. 첫 에러 라인 보고 |
| HITL 4분야 (🔴) 항목 멈춤 | agent 가 사용자 답변을 기다리는 정상 동작. 답변 후 재dispatch |
| `docs/domain/{feature}/` 가 안 만들어짐 | agent 가 Write 권한이 있어야 함 (각 agent.md 의 tools 확인) |

---

## 7. 핵심 파일 위치

| 파일 | 역할 |
|---|---|
| `CLAUDE.md` | 글로벌 워크플로우 룰 (모든 세션 자동 로드) |
| `.claude/agents/*.md` | agent 페르소나 / 권한 / 작업 모드 |
| `.claude/skills/{agent}/{skill}/SKILL.md` | sub-skill 정의 (입력 / 절차 / 산출물 템플릿) |
| `figma-plugin/manifest.json` | Figma plugin 메타 |
| `figma-plugin/code.ts` | designer agent 가 매번 덮어쓰는 plugin 코드 |
| `docs/README.md` | docs 트리 안내 |
| `SETTING.md` | (이 파일) 신규 사용자 셋업 가이드 |

---

## 8. 추가 자료

- [`docs/README.md`](./docs/README.md) — docs 폴더 트리 + 어디서 시작할지
- [`CLAUDE.md`](./CLAUDE.md) — 워크플로우 룰 / 산출물 위치 / HITL 정책
- 각 agent 의 `.claude/agents/*.md` — agent 별 동작 / 권한 / HITL

문제가 풀리지 않으면 `.claude/agents/*.md` 의 페르소나 / HITL 정책 / 작업 영역을 직접 읽어보세요. agent 정의 자체가 사용 설명서 역할.
