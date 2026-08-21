---
description: 기존 코드 → figma 역설계 워크플로우. 도메인의 기획/코드/scss 를 읽어 MCP(use_figma) 로 직접 그림
argument-hint: <feature>
---

# /code-to-design $ARGUMENTS

기존 코드를 읽어서 figma 에 다시 그리기 위한 표준 워크플로우.
타깃 도메인: **$ARGUMENTS** (예: applayout / coupon / home / events / notices)

---

## 0. 분기 체크 (메인 세션이 직접)

```
Bash: ls docs/domain/$ARGUMENTS/prd/ 2>&1
```

- 폴더 + md 존재 → **병렬 모드** (Step 1a + 1b 동시)
- 폴더 없음 / 빔 → **직렬 모드** (Step 1a → Step 1b)

---

## 1a. developer (read-only) — 코드 분석

`subagent_type: developer` (또는 `frontend-developer` read-only 모드, 도메인이 BE 까지 걸치면 `backend-developer` 도)

**brief (최소)**
- 목적: $ARGUMENTS 도메인 코드 구조 + scss 토큰 + 컴포넌트 관계 분석
- 범위: `web/src/` 의 도메인 + 공유 컴포넌트, scss module, store
- 산출: 메인 세션에 인라인 분석 보고 (파일 신규 생성 X)
- 제약: read-only — Edit 금지

---

## 1b. planner — 기획 산출

`subagent_type: planner`

**brief (최소)**
- 모드: prd 가 없으면 **reverse** (코드 → 기획 추출), 있으면 **enrich** (보강)
- 7 sub-skills: ia / requirements / policy-draft / feature-spec / endpoint-spec-draft / edge-cases / qa-checklist
- 산출: `docs/domain/$ARGUMENTS/prd/*.md`
- 제약: HITL 4 분야 (법무 / 결제 / 권한 / DB 파괴적) 만 강제 중단

---

## 2. designer (분석 모드) — 분석 산출만

`subagent_type: designer`

**brief (최소)**
- 입력: `docs/domain/$ARGUMENTS/prd/**`, `web/src/**` (scss / module 위주)
- 작업: figma 그릴 준비 분석 (frame 목록 + 토큰 매핑 + 컴포넌트 매핑)
- figma 읽기 가능하면: `mcp__claude_ai_Figma__*` 로 현재 상태 분석 추가
- 산출: `docs/domain/$ARGUMENTS/design/design-analysis.md` 만
- 제약: MCP 로 Figma 작성 X (분석만) — Step 4 에서 별도 라운드

---

## 3. 사용자 HITL — 분석 검토

메인 세션이 design-analysis.md 핵심 결과를 200자 내로 보고
→ 사용자 OK / 수정 요청 받기
→ OK 면 Step 4 진행

---

## 4. designer (MCP 작성 모드) — Figma 직접 반영

`subagent_type: designer`

**brief (최소)**
- 입력: design-analysis.md (Step 2 산출)
- 선행 필수: `get_figma_skill("skill://figma/figma-use/SKILL.md")` (+ 화면 생성이면 `figma-generate-design` 도 로드) — 건너뛰면 안 됨
- 작업: `use_figma` 로 대상 파일 `VCVQzOpSIpwpZw11gxG7N1` 페이지 `0:1` 에 직접 작성/수정. 색·간격·타이포는 Figma Variable 바인딩(생값 금지), 기존 컴포넌트는 `search_design_system` 으로 찾아 인스턴스 재사용, auto layout 사용
- 완료 후 `get_screenshot` 으로 되읽어 자가 검수 (어긋나면 즉시 수정)
- 산출: `docs/domain/$ARGUMENTS/design/design-report.md`, `implementation-handoff.md` (Figma 파일 자체가 1차 산출물, 로컬 코드 파일 없음)
- 글로벌 룰 1차 참조: `docs/global-guide/design/figma-mcp-rules.md`
- 제약: 디자인 토큰 / 컴포넌트 라이브러리 / 레이아웃 컨벤션 / 외부 자산 변경 시 HITL 강제 중단

---

## 5. 결과 확인 (메인 세션)

```
✅ MCP 로 Figma 직접 반영 완료 (사용자 수작업 없음)
👉 get_screenshot 결과 요약 + design-report.md 경로 안내
```

---

## 6. 사용자 figma 직접 수정 또는 skip

- 사용자가 figma 에서 직접 사이즈/배치/스타일 수정 → Step 7 진행
- 수정 없이 OK → 워크플로우 종료

---

## 7. designer (sync 모드) — figma → 문서 sync

`subagent_type: designer`

**brief (최소)**
- 입력: figma 현재 상태 (`get_design_context` / `get_metadata` / `get_screenshot`)
- 작업: 사용자 임의 수정 사항 → `docs/domain/$ARGUMENTS/design/design-report.md` § 사후검증 갱신, `implementation-handoff.md` 매핑 갱신
- 제약: 이 라운드는 figma 가 source of truth — 재작성(`use_figma`) 하지 않고 문서만 갱신
- 코드 baseline ↔ figma 정합 위반 발견 시 § 위반 요약 갱신만 (자동 수정 X)

---

## 작업 룰 (전 단계 공통)

- agent brief 부풀리지 말 것 — 사용자 발화 범위 + 산출 위치 + 제약만 (memory: feedback_agent_brief_minimal.md)
- 메인 세션 보고는 단계마다 200자 내 (CLAUDE.md § 7)
- 산출물 위치 절대:
  - 기획: `docs/domain/$ARGUMENTS/prd/*.md`
  - 디자인: `docs/domain/$ARGUMENTS/design/*.md`
  - Figma 반영: MCP (`use_figma`) 직접 조작 — 로컬 파일 산출물 없음. 룰: `docs/global-guide/design/figma-mcp-rules.md`
- 트랙 외 작업 (CI / DB / 환경설정) 끼워넣기 금지 — ops 트랙으로 분리
