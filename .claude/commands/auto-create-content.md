---
description: 신규 도메인 컨텐츠 풀스택 생성 워크플로우. 기획 → 디자인 → BE/FE 코드까지 자동화 (HITL 포함)
argument-hint: <domain>
---

# /auto-create-content $ARGUMENTS

신규 도메인을 0 → 풀스택 산출물까지 만드는 표준 워크플로우.
타깃 도메인: **$ARGUMENTS** (예: coupon / event-detail / search / mypage)

---

## 1. planner-division — 3라운드 통합 기획 (R1~R3)

`subagent_type: planner-division` (model: opus — feature / prefix 사용자 지정 필수)

**R1 — IA + 요구사항 + 정책**
- `_common.md` feature 정의, `{feature}.md` § 1 IA · § 2 요구사항 · § 3 정책 결정, `_decision_log.md` 생성
- 메인 세션이 🔴 정책 결정 항목을 사용자에게 `AskUserQuestion` 으로 확인 후 R2 진입

**R2 — 기능 명세 + 외부 IF**
- `{feature}.md` § 4 기능 명세 (G/W/T) · § 5 API/외부 IF — 🔴 권한·보안 분야 사용자 확인 후 R3 진입

**R3 — 예외 + QA + tasks**
- `{feature}.md` § 6 예외 케이스 · § 7 QA · § 8 사용자 확인 잔여, `_tasks.md`

**산출**: `docs/domain/$ARGUMENTS/prd/{_common,{feature},_tasks,_decision_log}.md`

**제약**
- HITL 4 분야 (법무 / 결제 / 권한 / DB 파괴적) — 라운드 종료 시 강제 중단, 답변 받고 다음 라운드 진입
- 그 외는 가정/미정 마커 표시 후 진행

---

## 2. designer-render — 기획 → 화면 설계 → figma

`subagent_type: designer-render` (Phase 1 분석 → Phase 2 MCP 렌더, 동일 agent 가 2단계 운영)

**brief**
- 입력: `docs/domain/$ARGUMENTS/prd/**` (Step 1 산출)
- Phase 1: 분석 → `docs/domain/$ARGUMENTS/design/screen-spec.md` (화면 인벤토리 + 재사용/신규 컴포넌트 + 토큰 매핑)
  - auto-create-content 전체 흐름상 사용자 IA/정책 합의는 Step 1 에서 이미 완료 — Phase 1 종료 후 별도 대기 없이 Phase 2 즉시 진행 지시
- Phase 2:
  1. 선행 필수: `get_figma_skill("skill://figma/figma-use/SKILL.md")` + `figma-generate-design` 로드
  2. `use_figma` 로 대상 파일 `VCVQzOpSIpwpZw11gxG7N1` 페이지 `0:1` 에 신규 frame/컴포넌트 직접 작성 — 색·간격·타이포 Variable 바인딩, 기존 컴포넌트는 `search_design_system` 으로 인스턴스 재사용, auto layout
  3. `get_screenshot` 으로 되읽어 자가 검수
- 산출: `screen-spec.md`, `design-report.md` (Figma 파일 자체가 1차 산출물, 로컬 코드 파일 없음)
- 글로벌 룰: `docs/global-guide/design/figma-mcp-rules.md`
- HITL: 디자인 토큰 / 컴포넌트 라이브러리 / 레이아웃 / 외부 자산 변경 시 강제 중단

---

## 3. 사용자 HITL — figma 확인

메인 세션 안내:
```
👉 MCP 로 신규 frame 반영 완료 (사용자 수작업 없음) — Figma 에서 직접 시각 확인 가능
   - OK → Step 4 skip 후 Step 5 진행
   - 수정 후 진행 → Step 4 sync 라운드
```

---

## 4. designer-review — 사용자 figma 수정분 평가 (조건부)

사용자가 figma 직접 수정한 경우만.

`subagent_type: designer-review`

**brief (최소)**
- 입력: figma 현재 상태 (`get_design_context` / `get_metadata` / `get_screenshot`)
- 작업: 편의성/직관성/일관성 3축 평가 + 개선점 우선순위 (P0~P2)
- 산출: `docs/domain/$ARGUMENTS/design/review-{YYYY-MM-DD}.md`
- 제약: Figma/코드 직접 수정 X (제안만) — P0 발견 시 메인 세션이 designer-render 재호출 여부 판단

---

## 5. developer-analyze — BE/FE 공통 분석문서 작성

`subagent_type: developer-analyze` (read-only + 분석문서 Write — 코드 직접 작성 X)

**brief**
- 입력:
  - `docs/domain/$ARGUMENTS/prd/{feature}.md` (planner-division 산출)
  - `docs/domain/$ARGUMENTS/design/screen-spec.md` (designer-render 산출)
- 작업: 기능 단위 분해 (FN-# ID) + BE 작업 명세 + FE 작업 명세 + cross-domain 정합 + 자체 평가 (기획 부합도/UI 일관성/누락/위험·가정값)
- 산출: `docs/domain/$ARGUMENTS/develop/analysis.md`, `decisions.log`
- HITL 4 분야 (법무/결제/권한/DB 파괴적) — 자체 결정 금지, 마커만 표시 + decisions.log 기록

---

## 6. BE / FE 병렬 구현

메인 세션이 dispatch-plan.md 기반으로 두 agent 동시 디스패치.

### 6-A. backend-developer

`subagent_type: backend-developer`

**brief**
- 입력: `docs/domain/$ARGUMENTS/develop/analysis.md` (§ 1/§ 3/§ 5) + `decisions.log`
- 작업 영역: `src/main/java/**`, `src/main/resources/mapper/**`, `src/test/**`
- 작업 영역 금지: `web/src/**`, `sql/V*/**` (마이그레이션 필요 시 analysis.md 에 SQL 권고만)
- open-policy 자동 진행 — 3회 실패 시 [미해결] 마크 후 다음 기능

### 6-B. frontend-developer

`subagent_type: frontend-developer`

**brief**
- 입력: `docs/domain/$ARGUMENTS/develop/analysis.md` (§ 1/§ 4/§ 5) + `decisions.log`
- 작업 영역: `web/src/domains/$ARGUMENTS/**`, `web/src/app/router/**`, `web/src/app/store/store.js`
- 작업 영역 금지: `src/main/**`, `sql/**`
- 모바일 우선 반응형 (tablet/PC 도 모바일 형태 + 좌우 여백) — 골격 단계 route+store+lazy 검증 강제
- open-policy 자동 진행 — 3회 실패 시 [미해결] 마크 후 다음 기능

---

## 7. developer-integrate — 종합 검수

`subagent_type: developer-integrate` (read-only + 보고서 Write)

**brief**
- 입력: `analysis.md` + `be-history.md` + `fe-history.md` + `decisions.log`
- 작업: cross-domain 정합 검증 (endpoint/DTO/권한/에러/라우트 5항목) + BE/FE history 통합 + 미해결 항목 집계
- 산출: `docs/domain/$ARGUMENTS/develop/integrate-report.md`
- 위반/누락 발견 시 → 권고만 제시 (P0/P1) — BE 또는 FE 추가 라운드 디스패치는 메인 세션 판단

---

## 8. 사용자 최종 보고 + 버전 기록

메인 세션이 200자 내로:
- 산출 파일 list
- BE / FE 빌드 결과
- 미해결 위반/누락 (있으면)
- 검증 가이드 (`{feature}.md` § 7 QA 위치)
- 신규 화면/기능 완료 → 기능 버전 MINOR bump + `docs/CHANGELOG.md` Added 1줄 기록 (`docs/convention/versioning.md` 기준)

---

## 작업 룰 (전 단계 공통)

- agent brief 부풀리지 말 것 (memory: feedback_agent_brief_minimal.md)
- 메인 세션 보고는 단계마다 200자 내 (CLAUDE.md § 7)
- 동일 파일군 Edit agent 2 개 이상 금지 (CLAUDE.md § 8)
- 산출물 위치 절대:
  - 기획: `docs/domain/$ARGUMENTS/prd/*.md`
  - 디자인: `docs/domain/$ARGUMENTS/design/*.md`
  - 통합/검수: `docs/domain/$ARGUMENTS/develop/*.md`
  - BE 코드: `src/main/**`, `sql/V*/`
  - FE 코드: `web/src/**`
  - Figma 반영: MCP (`use_figma`) 직접 조작 — 로컬 파일 산출물 없음. 룰: `docs/global-guide/design/figma-mcp-rules.md`
- 트랙 외 (CI / 환경설정 / 보안정책) 끼워넣기 금지 — ops 트랙 별도

---

## 참고 — `/code-to-design` 과 차이

| 축 | /code-to-design | /auto-create-content |
|---|---|---|
| 방향 | 코드 → 기획 → 디자인 (역설계) | 기획 → 디자인 → 코드 (신규 생성) |
| 1단계 | developer-analyze + planner-lite reverse | planner-division R1 (IA + 사용자 합의) |
| 종착 | figma 적용 (MCP 직접 반영, 수작업 없음) | BE/FE 풀스택 + developer-integrate 종합 검수 |
| HITL | figma 분석 검토 1 회 (designer-review) | R1~R3 라운드별 확인 + figma 확인 + 최종 검수 |
