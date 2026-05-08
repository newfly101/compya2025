# PRD Pipeline 워크플로우

> 도메인별 IA 정립 → Wireframe 생성 → Design Sync 의 3단계 파이프라인. **컨텐츠(도메인) 단위 병렬 처리** 패턴.

---

## 0. 전체 그림

```
[Phase A — Foreground]                      [Phase B — Background, 병렬]
┌─────────────────────┐                     ┌──────────────────────────┐
│ prd-ia-interactive  │                     │ prd-wireframe-generator  │
│  (사용자 대화)        │   사용자 확정         │   (figma + part B → 화면) │
│  Part B 확정·Edit    │ ───────────────────▶│                          │
└─────────────────────┘                     └──────────────────────────┘
                                            ┌──────────────────────────┐
                                            │ prd-design-sync          │
                                            │   (figma vs 실제 구현)    │
                                            └──────────────────────────┘
                                                  ↓
                                            [통합 결과 보고]

도메인 1 (coupon) ━━━━━━━━━━━━┓
  Phase A (foreground)         ┃ 확정 후 background
  ↓                            ┃
  Phase B (background) ────────┻──── coupon B 진행 중
                                                 ┃
도메인 2 (event)                                  ┃
  Phase A (foreground) ─── 사용자 입력             ┃ ← coupon B 와 병행
  ↓                                              ┃
  Phase B (background) ───────────────────────────┻──── event B 진행

→ 사용자 입력 (IA) 은 직렬, background 는 도메인 단위 병렬 누적
```

---

## 1. 구성 요소

### 1.1 Sub-agents (`.claude/agents/`)

| Agent | Mode | 역할 | 입력 | 산출물 |
|---|---|---|---|---|
| **prd-ia-interactive** | foreground (대화) | 도메인 IA 정립 + 기능 요구사항 확정 | `docs/prd/domains/{domain}.md` Part A | `docs/prd/domains/{domain}.md` Part B (Edit) |
| **prd-wireframe-generator** | background (자동) | IA 확정 PRD + Figma MCP → 화면기획서 | Part B + Figma node | `docs/prd/wireframes/{domain}.md` (Write) |
| **prd-design-sync** | background (자동) | Figma frame ↔ 실제 구현 컴포넌트 비교 | wireframe 결과 + 실제 컴포넌트 | `docs/prd/design-sync/{domain}.md` (Write) |

### 1.2 Slash command (`.claude/commands/`)

| Command | 역할 |
|---|---|
| **/prd-pipeline {domain}** | 단일 도메인 파이프라인 오케스트레이터 (Phase A → Phase B 병렬) |

### 1.3 산출물 폴더 구조

```
docs/prd/
├── _overview.md                # 시스템 횡단 (PRD synthesizer 산출)
├── _workflow.md                # 본 문서
├── domains/                    # 도메인별 Part A (사실 baseline) + Part B (확정 IA)
│   ├── coupons.md
│   ├── events.md
│   └── ...
├── wireframes/                 # 화면기획서 (wireframe-generator 산출)
│   ├── coupons.md
│   ├── events.md
│   └── _assets/{domain}/       # figma screenshot (옵션)
└── design-sync/                # 디자인 ↔ 구현 갭 (design-sync 산출)
    ├── coupons.md
    ├── events.md
    └── ...
```

---

## 2. 사용 시나리오

### 2.1 단일 도메인 처리

사용자가 채팅에 `/prd-pipeline coupons` 입력.

1. **Phase A 시작**: `prd-ia-interactive` 가 호출되어 사용자에게 Part A 요약 보고 + IA 질문 시작
2. 사용자가 답변 → 에이전트가 초안 합성 → 사용자에게 "이 초안으로 Part B 수정할까요?" 승인 요청
3. 사용자 "Yes" → Part B 수정 완료
4. **Phase B 자동 시작**: 슬래시 명령이 즉시 `prd-wireframe-generator` + `prd-design-sync` 두 sub-agent 를 **단일 메시지에서 병렬로** Task 호출
5. background 두 에이전트가 각자 작업 → 완료 시 통합 결과 보고

### 2.2 두 도메인 병렬 처리 (사용자 시나리오 핵심)

```
시간 →

t1: 사용자 → /prd-pipeline coupons
t2: prd-ia-interactive (coupons): "Part A 요약. 첫 질문..."
t3: 사용자 답변
...
t8: 에이전트 → "초안 보여드림. 확정?"
t9: 사용자 → "Yes"
t10: Part B (coupons.md) Edit 완료
t11: prd-wireframe-generator(coupons) + prd-design-sync(coupons) 병렬 시작 (background)
        ┃
        ┃ 진행 중...
        ┃
t12: 사용자 → /prd-pipeline events  (★ background 진행 중에 새 IA 시작)
t13: prd-ia-interactive (events): "Part A 요약..."
        ┃
        ┃ events IA 진행 중 + coupons background 진행 중 (병렬)
        ┃
t20: coupons background 완료 → 결과 보고 (사용자 채팅에 표시)
t25: events Phase A 완료
t26: events Phase B background 시작
        ┃
        ┃ events background 만 진행 중
        ┃
t30: events background 완료 → 결과 보고
```

★ **핵심**: 사용자는 IA 단계 (대화) 만 직렬로 처리하고, 그 외 모든 background 처리는 도메인 단위로 누적 병렬 진행.

### 2.3 Sub-agent 직접 호출 (slash command 없이)

병렬 처리를 더 세밀하게 제어하고 싶다면 sub-agent 를 직접 Task 도구로 호출:

```
# Task tool 호출 예시 (어시스턴트가 사용)
- subagent_type: prd-ia-interactive, prompt: "domain: coupons"
- subagent_type: prd-wireframe-generator, prompt: "domain: coupons"
- subagent_type: prd-design-sync, prompt: "domain: coupons"
```

여러 도메인 background 작업을 동시 발사하려면 **단일 메시지에 여러 Task 호출**:

```
- Task(prd-wireframe-generator, "domain: coupons")
- Task(prd-wireframe-generator, "domain: events")
- Task(prd-design-sync, "domain: coupons")
- Task(prd-design-sync, "domain: events")
```

→ 4개 background sub-agent 가 동시 실행됨.

---

## 3. 도메인 분류별 진행 가이드

`docs/prd/_overview.md` § 1.3 + 각 domain PRD Part A.1 의 분류를 따른다:

| 분류 | Phase A (IA) | Phase B-Wireframe | Phase B-DesignSync |
|---|---|---|---|
| **live** (events, notices, authentication) | 진행 | 진행 | ★ 의미 있음 |
| **partial-mock** (home, community, coupons, quiz, profile) | 진행 | 진행 | 진행 (live 부분만 의미 있음) |
| **mock-only** (historyMode) | 진행 | 진행 (BE 연동 후 wireframe 갱신) | 보류 (구현 후 진행) |
| **미구현 / V2 작동 불능** (playerCard) | 진행 (figma 도착 시) | 진행 (figma frame 만) | 보류 |
| **PC 레거시 보류** (dictionary, simulate, kbo) | Owner 보류 권장 | 미진행 | 미진행 |
| **폐기 권고** (mobile) | Part B 미작성 | 미진행 | 미진행 |

---

## 4. Sub-agent 별 사전 조건 / 보호장치

### 4.1 prd-ia-interactive
- 사전 조건: Part A 채워져 있음 (`docs/prd/domains/{domain}.md`)
- 보호장치: 사용자 "확정" 명시 없이 Edit 금지. Part A 절대 수정 금지

### 4.2 prd-wireframe-generator
- 사전 조건: Part B 가 placeholder 가 아닌 확정 내용
- 보호장치:
  - Part B 미확정 시 즉시 종료 보고 (백그라운드 모드)
  - figma MCP 실패 시 텍스트 wireframe 만 생성 + figma 미연결 표기

### 4.3 prd-design-sync
- 사전 조건: Part A.1 분류 = live / partial-mock + wireframe 산출물 존재
- 보호장치:
  - 분류 부적합 시 즉시 종료 보고
  - 코드 수정 / figma 수정 직접 X — 분석 + 제안만
  - ★ 재사용성 / 통일성 우선: figma 가 표준 컴포넌트와 다르면 figma 변경 권장이 기본

---

## 5. 호출 가이드

### 5.1 권장 호출 (slash command)

```
/prd-pipeline coupons
```

가장 단순. Phase A → Phase B 자동 진행.

### 5.2 IA 만 별도 진행 (background 보류)

```
@prd-ia-interactive domain: coupons
```

또는 채팅에 명시적으로 "prd-ia-interactive 에이전트로 coupons 도메인 IA 만 진행" 요청.

### 5.3 IA 끝난 도메인의 background 만 따로 실행

```
# 어시스턴트에게 두 sub-agent 동시 실행 요청
"coupons 도메인의 wireframe + design-sync 를 병렬로 실행"
```

→ 어시스턴트가 단일 메시지에 Task 두 개 발사 → 병렬 실행.

### 5.4 이미 wireframe/design-sync 완료된 도메인 재실행

해당 domain 의 Part B 를 수정한 후 재실행하면 산출물 덮어쓰기. 일관성 유지.

---

## 6. 결과 검증

각 단계 완료 후 사용자가 검증할 항목:

### 6.1 Phase A 검증
- `docs/prd/domains/{domain}.md` Part B 가 의도대로 채워졌는지
- Part A 가 한 글자도 변경되지 않았는지 (git diff 확인 권장)

### 6.2 Phase B-Wireframe 검증
- `docs/prd/wireframes/{domain}.md` 의 화면별 figma node 매핑이 정확한지
- 컴포넌트 재사용 매핑이 표준 패턴 (coupons / events) 과 일치하는지
- "figma 미연결" 항목이 있다면 figma node 추가 필요

### 6.3 Phase B-DesignSync 검증
- `docs/prd/design-sync/{domain}.md` 의 갭 표가 적절한지
- ★ "figma 변경 권장" vs "코드 변경 권장" 비율 — 통일성 우선이면 figma 변경 권장이 다수여야 정상
- "코드 변경 권장" 항목 들이 실제로 figma 가 더 정확한 케이스인지 검토

---

## 7. 다음 단계 (모바일 리뉴얼)

PRD pipeline 이 도메인 단위로 완료되면 다음 단계로:

1. **figma-spec-validator** (별도 에이전트, 향후 작성 예정) — 화면기획서 + reconciliation 결과 + figma frame 의 정합성 검증
2. **개발 진입** — Phase 0 차단 fix → Phase 1 보안 fix → Phase 2 figma-spec-validator → Phase 3 차단 해소 후 작업 → Phase 4 정리

자세한 모바일 리뉴얼 진행 순서는 `docs/prd/_overview.md` § 7 참조.
