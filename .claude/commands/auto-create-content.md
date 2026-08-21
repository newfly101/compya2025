---
description: 신규 도메인 컨텐츠 풀스택 생성 워크플로우. 기획 → 디자인 → BE/FE 코드까지 자동화 (HITL 포함)
argument-hint: <domain>
---

# /auto-create-content $ARGUMENTS

신규 도메인을 0 → 풀스택 산출물까지 만드는 표준 워크플로우.
타깃 도메인: **$ARGUMENTS** (예: coupon / event-detail / search / mypage)

---

## 1. planner — IA + 사용자 합의 + skills

`subagent_type: planner`

**Phase 1-A — IA 초안 + 사용자 인터랙션**
- planner 가 IA 초안 (`docs/domain/$ARGUMENTS/prd/ia.md` draft) 작성
- 메인 세션이 IA 핵심 결정 사항 (페이지 구조 / 진입점 / 라우팅 / 상태 모델) 을 사용자에게 `AskUserQuestion` 으로 합의
- 사용자 결정 받으면 IA 확정

**Phase 1-B — 7 sub-skills 산출**
- ia (확정본) / requirements / policy-draft / feature-spec / endpoint-spec-draft / edge-cases / qa-checklist
- 산출: `docs/domain/$ARGUMENTS/prd/*.md`

**제약**
- HITL 4 분야 (법무 / 결제 / 권한 / DB 파괴적) 에서만 강제 중단
- 그 외는 가정/미정 마커 표시 후 진행

---

## 2. designer (MCP 작성 모드) — 기획 → figma

`subagent_type: designer`

**brief**
- 입력: `docs/domain/$ARGUMENTS/prd/**` (Phase 1-B 산출)
- 작업:
  1. 분석 → `docs/domain/$ARGUMENTS/design/design-analysis.md`
  2. 선행 필수: `get_figma_skill("skill://figma/figma-use/SKILL.md")` + `figma-generate-design` 로드
  3. `use_figma` 로 대상 파일 `VCVQzOpSIpwpZw11gxG7N1` 페이지 `0:1` 에 신규 frame/컴포넌트 직접 작성 — 색·간격·타이포 Variable 바인딩, 기존 컴포넌트는 `search_design_system` 으로 인스턴스 재사용, auto layout
  4. `get_screenshot` 으로 되읽어 자가 검수
- 산출: `design-report.md`, `implementation-handoff.md` (Figma 파일 자체가 1차 산출물, 로컬 코드 파일 없음)
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

## 4. designer (sync 모드) — figma → 문서 sync (조건부)

사용자가 figma 직접 수정한 경우만.

`subagent_type: designer`

**brief (최소)**
- 입력: figma 현재 상태 (`get_design_context` / `get_metadata` / `get_screenshot`)
- 작업: `design-report.md` § 사후검증 + `implementation-handoff.md` 매핑 갱신
- 제약: 이 라운드는 figma 가 source of truth — 재작성(`use_figma`) 하지 않고 문서만 갱신

---

## 5. developer — 디자인 산출물 확인 + BE/FE 분배 plan

`subagent_type: developer` (read-only supervisor — 코드 직접 작성 X)

**brief**
- 입력:
  - `docs/domain/$ARGUMENTS/prd/**` (planner 산출)
  - `docs/domain/$ARGUMENTS/design/implementation-handoff.md` (designer 산출)
- 모드: **dispatch-plan**
- 작업: BE/FE 작업 분배 plan 작성 (`docs/domain/$ARGUMENTS/develop/dispatch-plan.md`)
  - BE: controller / service / mapper / SQL / migration
  - FE: 도메인 컴포넌트 / store / 라우트
  - cross-domain 의존 관계 / 작업 순서 / 인터페이스 (endpoint-spec) 정합
- HITL 4 분야 (권한 / 결제 / DB 파괴적 / 외부 시스템 통합) 에서만 강제 중단
- 산출: `dispatch-plan.md`

---

## 6. BE / FE 병렬 구현

메인 세션이 dispatch-plan.md 기반으로 두 agent 동시 디스패치.

### 6-A. backend-developer

`subagent_type: backend-developer`

**brief**
- 입력: dispatch-plan.md (BE 섹션) + endpoint-spec-draft.md + qa-checklist.md
- 작업 영역: `src/main/java/**`, `src/main/resources/**`, `sql/V*/`
- 작업 영역 금지: `web/src/**`
- HITL 4 분야 강제 중단

### 6-B. frontend-developer

`subagent_type: frontend-developer`

**brief**
- 입력: dispatch-plan.md (FE 섹션) + implementation-handoff.md + endpoint-spec-draft.md
- 작업 영역: `web/src/**`
- 작업 영역 금지: `src/main/**`, `sql/**`
- 모바일 우선 반응형 (tablet/PC 도 모바일 형태 + 좌우 여백)
- HITL 4 분야 (글로벌 토큰 / 라우팅 / 외부 라이브러리 / 보안) 강제 중단

---

## 7. developer — 종합 검수 (integrate-review)

`subagent_type: developer` (read-only)

**brief**
- 입력: 6-A / 6-B 양쪽 산출 결과
- 모드: **integrate-review**
- 작업: cross-domain 정합 검증 (endpoint contract / 데이터 모델 / 권한 흐름 / 에러 처리)
- 산출: `docs/domain/$ARGUMENTS/develop/integrate-review.md`
- 위반/누락 발견 시 → BE 또는 FE 추가 라운드 디스패치 (메인 세션 판단)

---

## 8. 사용자 최종 보고

메인 세션이 200자 내로:
- 산출 파일 list
- BE / FE 빌드 결과
- 미해결 위반/누락 (있으면)
- 검증 가이드 (qa-checklist.md 위치)

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
| 1단계 | developer + planner reverse | planner IA + 사용자 합의 |
| 종착 | figma 적용 (MCP 직접 반영, 수작업 없음) | BE/FE 풀스택 + integrate-review |
| HITL | figma 분석 검토 1 회 | IA 합의 + figma 확인 + 최종 검수 |
