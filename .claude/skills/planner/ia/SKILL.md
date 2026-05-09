---
name: planner-ia
description: 정보 구조(IA) 정립. 도메인 scope / 화면 구조 / 사용자 시나리오 / 우선순위 정리. reverse(코드→IA) 와 forward(요구→IA) 두 모드 지원. 산출물 docs/plan/{name}/ia.md. ★ HITL 1 (scope·우선순위 사용자 확정).
---

# Skill: planner-ia

10년차 기획자 시점에서 **정보 구조(IA, Information Architecture)** 를 정립한다. IA = "이 도메인이 무엇을 다루며, 어떤 화면 / 시나리오 / 우선순위를 가지는가" 를 한 페이지로 정리한 문서.

## 1. 목적

- 도메인 scope 를 명확히 한다 (무엇을 다루고 무엇을 다루지 않는지)
- 사용자 시나리오를 시작점 → 종료점 흐름으로 정리한다
- 화면 구조 (목록 / 상세 / 입력 등) 를 트리 형태로 정리한다
- 우선순위 P0 / P1 / P2 를 분리한다
- ★ Owner 결정 필요 항목을 표시한다 (자동 결정 금지)

**산출물**: `docs/plan/{feature-or-domain-name}/ia.md`

## 2. 입력 (input)

### Reverse mode (코드 → IA)
- 대상 코드 디렉토리 (예: `web/src/domains/coupons/`)
- DB 스키마 / API 명세 (있다면)
- 사용자가 알려주는 도메인 컨텍스트 (1-2 줄)

### Forward mode (요구 → IA)
- 사용자 요구사항 자유 서술 (한 단락 이상)
- 관련 도메인 / 시스템 컨텍스트
- 알려진 제약 조건 (시간 / 인력 / 외부 의존)

### 호출 args 예시
```
domain: coupons, mode: reverse, source: web/src/domains/coupons/
domain: rewards, mode: forward, user-input: "리워드 시스템 신규 도입..."
```

## 3. 절차 (steps)

### Step 1 — 입력 확인
- 호출 args 에서 `domain`, `mode`, `source` (or `user-input`) 추출
- 누락 시 사용자에게 즉시 질문 후 중단

### Step 2 — 베이스라인 수집

**Reverse mode**:
1. `Glob` / `Grep` 으로 대상 디렉토리 파일 탐색
2. 진입점 (라우트 / Screen 컴포넌트) 식별
3. 호출 API / 사용 store 식별
4. 화면 분기 패턴 식별 (loading / empty / error / success 등)

**Forward mode**:
1. 사용자 요구를 줄별로 분해 (한 줄 = 한 요구)
2. 비슷한 도메인 (이미 있는 docs/plan / docs/prd) 참고

### Step 3 — IA 합성 (초안)
- Step 2 결과를 아래 템플릿에 채움
- 빈 항목은 "미정" 명시 — 임의 추측 금지

### Step 4 — ★ HITL 1: 사용자 확정
다음 항목을 사용자에게 명시적으로 묻고 답변 받기:

1. **도메인 scope 경계** — 어디까지 본 IA 가 다루나? 다루지 않는 것은?
2. **사용자 시나리오 우선순위** — 핵심 흐름이 무엇? (한 가지만 P0)
3. **기능 우선순위 P0/P1/P2** — 각 기능 우선순위
4. **Owner 결정 항목** — 결정자가 누구? 결정 사유?

답변 없이 진행 금지. 모호한 답변은 follow-up 질문.

### Step 5 — 산출물 Write
- `docs/plan/{name}/ia.md` 에 Write
- 부모 디렉토리 없으면 자동 생성 (Write tool 처리)

### Step 6 — 다음 skill 안내
보고:
- 산출물 경로
- 확정 P0 / P1 / P2 기능 수
- 보류 항목 (있다면)
- 다음 skill: `planner-requirements` (forward 의 경우 `planner-policy` 먼저 권고)

## 4. 템플릿 (산출물)

```markdown
# IA — {도메인/기능명}

> 모드: reverse / forward
> 작성일: YYYY-MM-DD
> 작성자: {기획자 / agent}

## 1. 도메인 정의 (한 줄)

> {이 도메인이 무엇인지 한 줄로 설명}

## 2. Scope (다루는 것 / 다루지 않는 것)

### 다루는 것 (in scope)
- {항목 1}
- {항목 2}

### 다루지 않는 것 (out of scope)
- {항목 1} — 사유: {왜 제외했는지}
- {항목 2} — 사유: {...}

## 3. 사용자 시나리오 (Persona × Flow)

### Persona (사용자 유형)
| Persona | 설명 | 특이사항 |
|---|---|---|
| guest | 비로그인 사용자 | 권한 제한 |
| user | 로그인 일반 사용자 | 표준 |
| admin | 관리자 | 별도 화면 (선택) |

### Flow (핵심 흐름)

#### Flow 1: {시나리오명} (P0)
1. 시작점: {화면/액션}
2. {단계 2}
3. ...
4. 종료점: {화면/액션}

분기:
- {조건 A} → {결과}
- {조건 B} → {결과}

#### Flow 2: ... (P1)

## 4. 화면 구조 (Screen Tree)

```
{도메인} (route)
├── 목록 (List)
│   ├── empty 상태
│   ├── loading 상태
│   ├── error 상태
│   └── 정상 상태
├── 상세 (Detail)
└── ...
```

화면별 메모:
| 화면 | 라우트 | 진입 조건 | 종료 조건 | 비고 |
|---|---|---|---|---|
| 목록 | /domain | 메뉴 진입 | 항목 클릭 | empty 처리 필요 |
| 상세 | /domain/:id | 목록 → 항목 클릭 | 뒤로 가기 | ... |

## 5. 기능 우선순위

### P0 (필수 — 차단성)
- [ ] 기능 1: {한 줄 설명}
- [ ] 기능 2: ...

### P1 (다음 마일스톤)
- [ ] 기능 N: ...

### P2 (보류 — 차후 결정)
- [ ] 기능 M: ...

## 6. ★ Owner 결정 항목

| 항목 | 결정 옵션 | 결정자 | 결정 상태 | 결정 사유 |
|---|---|---|---|---|
| {분기 결정 1} | A / B / C | PO | 결정 / 보류 | ... |

## 7. 의존 / 제약

### 의존
- 외부 시스템: {GA4 / Firebase / 등 — 있다면}
- 내부 도메인: {auth / payment / 등 — cross-cutting 영향}
- DB 테이블: {table_name — 있다면}

### 제약
- 시간 / 인력 / 외부 규정

## 8. 다음 단계

- [ ] requirements.md 작성 (`planner-requirements` skill)
- [ ] (forward) policy.md 운영자 합의 (`planner-policy` skill)
- [ ] feature-spec.md 작성 (`planner-feature-spec` skill)

## 9. 변경 이력

| 날짜 | 변경 | 변경자 |
|---|---|---|
| YYYY-MM-DD | 초안 작성 | {agent / 사용자} |
```

## 5. 검증 (validation — 산출물 완료 기준)

- [ ] 도메인 정의 한 줄 작성
- [ ] Scope 의 in / out 모두 명시 (각 ≥ 1 항목)
- [ ] Persona 표 작성 (≥ 1)
- [ ] Flow ≥ 1 (P0 흐름 1개는 필수)
- [ ] 화면 구조 트리 작성
- [ ] 기능 우선순위 P0 ≥ 1 (없으면 도메인 의미 없음)
- [ ] ★ Owner 결정 항목 표 작성 (없으면 "없음" 명시)
- [ ] 의존 / 제약 작성

## 6. ★ HITL 지점

**HITL 1 (강제)**: Step 4 — scope 경계 / 우선순위 / Owner 결정 사용자 답변 받기

자동 진행 금지. 답변 없이 산출물 Write 금지.

## 7. 다음 skill 추천

- **표준**: `planner-requirements` (IA → 요구사항 정의)
- **forward 모드**: `planner-policy` 우선 (정책 운영자 합의 후 requirements 작성하면 충돌 적음)

## 8. 예시

### 예시 1 (reverse, 짧음)
```
입력: domain: coupons, mode: reverse, source: web/src/domains/coupons/

→ 도메인 정의: "사용자에게 발급되는 쿠폰 조회 / 사용 처리"
→ Scope in: 쿠폰 목록, 상세, 사용 처리
→ Scope out: 쿠폰 발급 (admin 영역)
→ Persona: guest (제한) / user (표준)
→ Flow P0: 목록 진입 → 쿠폰 클릭 → 상세 → 사용 버튼 → 사용 완료
→ ★ HITL: "guest 의 쿠폰 목록 진입 시 로그인 강제 vs 빈 목록?" → 사용자 확정 필요
```

### 예시 2 (forward, 짧음)
```
입력: domain: rewards, mode: forward, user-input: "출석체크 보상 시스템 도입 — 7일 연속 출석 시 쿠폰 발급"

→ 도메인 정의: "출석체크를 통해 쿠폰을 보상으로 지급"
→ Scope in: 출석체크 UI, 보상 발급, 발급 알림
→ Scope out: 쿠폰 사용 (coupons 도메인 영역)
→ ★ HITL: "출석 시간 기준 (KST 0시? 사용자 로컬?)", "연속 끊김 처리 (0 리셋? 다음날 재시작?)" → 사용자 확정 필요
→ ★ Owner 결정: "쿠폰 종류 / 가치" — 운영팀 결정
```

## 9. 작성 원칙 (주니어 친화)

- **어려운 용어 회피**: "IA" → 본문 시작에 "정보 구조 = 무엇을 / 어떤 흐름으로 다루는지" 한 줄 풀이
- **결정 사유 명시**: out of scope 항목 마다 "왜 제외했는지" 한 줄
- **표 우선**: 산문보다 표 / 트리 / 체크박스
- **분기 = 명시**: "조건 X → 결과 Y" 형태로 분기 모두 적기
