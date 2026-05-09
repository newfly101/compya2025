---
name: planner-requirements
description: 기능 요구사항 정의서 작성 (functional + non-functional). IA 확정 후 호출. 기능별 ID / 내용 / 우선순위 / 의존 / acceptance criteria 표 산출. 산출물 docs/plan/{name}/requirements.md.
---

# Skill: planner-requirements

10년차 기획자 시점에서 **기능 요구사항(Requirements)** 을 정의한다. 요구사항 = "이 도메인이 무엇을 해야 하는가 (기능적) + 어떤 품질을 만족해야 하는가 (비기능적)" 를 ID 기반 표로 정리한 문서.

## 1. 목적

- 기능별 요구사항을 ID 부여 + 표로 정리 (추적 가능성 확보)
- 기능적 요구사항 (functional) 과 비기능적 요구사항 (non-functional) 분리
- 각 요구사항의 acceptance criteria (충족 기준) 명시
- 우선순위 P0 / P1 / P2 (IA 와 정합)
- 의존 관계 명시 (다른 도메인 / 외부 시스템 / DB / API)

**산출물**: `docs/plan/{name}/requirements.md`

## 2. 입력 (input)

- **선행 산출물**: `docs/plan/{name}/ia.md` (필수 — 없으면 즉시 중단 + `planner-ia` 안내)
- ⭐ Forward 흐름 변경: `requirements` 가 `policy-draft` 보다 **먼저** 진행됨 — requirements 의 NFR 결과가 policy-draft 의 결정 항목 도출에 사용됨
- 호출 args:
  ```
  ia-path: docs/plan/{name}/ia.md
  ```

## 3. 절차 (steps)

### Step 1 — IA 로드
- `ia-path` 의 파일 Read
- IA 의 P0 / P1 / P2 기능 목록을 베이스라인으로 가져옴
- 화면 구조 / 시나리오 cite

### Step 2 — 요구사항 ID 부여
- 기능적 요구사항: `FR-{도메인약어}-{번호}` (예: `FR-CPN-01`)
- 비기능적 요구사항: `NFR-{도메인약어}-{번호}` (예: `NFR-CPN-01`)
- 번호는 IA 의 P0 → P1 → P2 순서

### Step 3 — 각 요구사항 상세화
다음을 모두 채움:
- 한 줄 요약
- 상세 설명 (2-3 줄)
- acceptance criteria (≥ 1, 측정 가능한 형태)
- 우선순위 (IA cite)
- 의존 (다른 FR / NFR / 외부 시스템 / DB / API)
- (선택) 추정 공수 / Phase

### Step 4 — 비기능적 요구사항 추가
표준 카테고리 점검:
- 성능 (응답시간, throughput)
- 가용성 (uptime, fallback)
- 보안 (인증 / 권한 / 암호화)
- 접근성 (WCAG / 키보드 / 스크린리더)
- 국제화 (다국어 / 시간대)
- 호환성 (브라우저 / OS / 디바이스)
- 운영 / 모니터링 (로그 / 알림)

해당하지 않는 카테고리는 명시적으로 "해당 없음" 표기.

### Step 5 — 산출물 Write
- `docs/plan/{name}/requirements.md` Write

### Step 6 — 다음 skill 안내
보고:
- 산출물 경로
- FR 수 / NFR 수
- 우선순위별 분포 (P0/P1/P2 수)
- 마커 분포 (🔴 위험 / 🟨 가정 / ❓ 미정) — 4 분야 NFR 항목 (보안/결제/법무/DB) 식별
- 다음 skill (Forward): `planner-policy-draft` (requirements 후 정책 결정 항목 도출)
- 다음 skill (Reverse): `planner-feature-spec` (Given/When/Then 기능 명세)

## 4. 템플릿 (산출물)

```markdown
# 요구사항 정의서 — {도메인/기능명}

> 작성일: YYYY-MM-DD
> 선행 문서: [ia.md](./ia.md)
> (선택) [policy.md](./policy.md)

## 1. 개요

본 문서는 {도메인} 의 **기능 요구사항 (FR)** 과 **비기능 요구사항 (NFR)** 을 정의한다. 각 요구사항은 ID 로 추적 가능하며, 후속 feature-spec / api-spec / qa-checklist 에서 본 ID 를 cite 한다.

용어:
- **FR (Functional Requirement)**: 기능 요구사항 — "무엇을 해야 하는가"
- **NFR (Non-Functional Requirement)**: 비기능 요구사항 — "어떤 품질을 만족해야 하는가"
- **Acceptance Criteria**: 충족 기준 — "이 조건을 만족하면 요구사항이 달성된 것"

## 2. 기능 요구사항 (FR)

### 요약 표

| ID | 한 줄 요약 | 우선순위 | 의존 | 상태 |
|---|---|---|---|---|
| FR-{ABBR}-01 | 쿠폰 목록 조회 | P0 | API:GET /coupons | 확정 |
| FR-{ABBR}-02 | ... | P0 | FR-{ABBR}-01 | 확정 |
| FR-{ABBR}-03 | ... | P1 | - | 보류 |

### 상세

#### FR-{ABBR}-01: 쿠폰 목록 조회

- **설명**: 로그인 사용자는 자신에게 발급된 쿠폰 목록을 조회할 수 있다.
- **acceptance criteria**:
  - [ ] 로그인 상태에서 /coupons 진입 시 쿠폰 목록 표시
  - [ ] 발급된 쿠폰이 0개일 때 empty 상태 표시
  - [ ] 사용 완료 / 만료 / 활성 상태 시각적 구분
- **우선순위**: P0
- **의존**: `GET /api/coupons` (api-spec.yaml 참조)
- **관련 화면**: ia.md § 4 "쿠폰 목록"
- **비고**: {필요 시}

#### FR-{ABBR}-02: ...

## 3. 비기능 요구사항 (NFR)

### 요약 표

| ID | 카테고리 | 한 줄 요약 | 측정 기준 | 우선순위 |
|---|---|---|---|---|
| NFR-{ABBR}-01 | 성능 | 목록 응답 < 500ms | p95 latency | P0 |
| NFR-{ABBR}-02 | 보안 | 토큰 검증 | 401 처리 | P0 |
| NFR-{ABBR}-03 | 접근성 | 키보드 탐색 | 모든 버튼 tabindex | P1 |

### 상세

#### NFR-{ABBR}-01: 응답 시간 (성능)

- **설명**: 쿠폰 목록 API 응답이 일정 시간 내에 완료되어야 한다.
- **측정 기준**: p95 응답 시간 < 500ms (10개 이하 쿠폰 기준)
- **acceptance criteria**:
  - [ ] 부하 테스트 100 동시 사용자에서 p95 < 500ms
- **우선순위**: P0
- **의존**: BE 캐싱 정책

#### NFR-{ABBR}-02: ...

### 카테고리별 점검 결과

| 카테고리 | 적용 여부 | 비고 |
|---|---|---|
| 성능 | 적용 | NFR-01 |
| 가용성 | 적용 | NFR-{N} |
| 보안 | 적용 | NFR-02 |
| 접근성 | 적용 | NFR-03 |
| 국제화 | 해당 없음 | 한국어 단일 |
| 호환성 | 적용 | 모바일 우선 |
| 운영/모니터링 | 적용 | NFR-{N} |

## 4. 우선순위 분포

| 우선순위 | FR 수 | NFR 수 | 합계 |
|---|---|---|---|
| P0 | N | M | N+M |
| P1 | N | M | N+M |
| P2 | N | M | N+M |

## 5. 의존 관계 그래프

```
FR-01 ── (depends on) ── API:GET /coupons
FR-02 ── (depends on) ── FR-01
FR-03 ── (depends on) ── 외부: GA4
NFR-02 ── (depends on) ── 인증 미들웨어
```

## 6. ★ 미해결 / 보류 항목

| ID | 항목 | 사유 | 결정 시점 |
|---|---|---|---|
| FR-{ABBR}-N | ... | 운영 정책 미정 | policy.md 합의 후 |

## 7. 사용자 확인 필요 항목

- [ ] 🔴 위험 마커 NFR (권한 / 결제 / 법무 / DB) — 사용자 답변 필수
- [ ] 🟨 가정 마커 항목 — 추정 default 검토
- [ ] ❓ 미정 마커 항목 — TBD 결정

## 8. 다음 단계

- [ ] (Forward) policy-draft.md 작성 (`planner-policy-draft`) — requirements 의 4 분야 NFR 기반 정책 결정 항목 도출
- [ ] feature-spec.md 작성 (`planner-feature-spec`)
- [ ] (선택) api-spec-draft.yaml 작성 (`planner-api-spec-draft`)

## 9. 변경 이력

| 날짜 | 변경 | 변경자 |
|---|---|---|
| YYYY-MM-DD | 초안 작성 | {agent / 사용자} |
```

## 5. 검증 (validation)

- [ ] FR 요약 표 작성 (≥ 1)
- [ ] FR 상세 — 각 FR 마다 설명 / acceptance criteria / 우선순위 / 의존 모두 채움
- [ ] NFR 요약 표 작성 (≥ 1 — 보안 / 성능은 사실상 필수)
- [ ] 카테고리별 점검 표 작성 (모든 카테고리 적용/해당 없음 명시)
- [ ] 우선순위 분포 표 작성
- [ ] IA 와 정합성 검증 (IA 의 P0 가 FR 에 모두 포함)

## 6. HITL (Human-in-the-Loop) 지점

### 강제 HITL (자동 진행 금지)

본 skill 의 산출물 중 다음 분야는 사용자 답변 전 확정 금지:
- **권한 NFR** — 인증 / 권한 등급 / SecurityConfig 관련 NFR (예: NFR-N "토큰 만료 시간")
- **결제 FR/NFR** — PG / 환불 / 정산 관련 요구사항
- **법무 FR/NFR** — 개인정보 / 약관 / 이용권리 관련 (예: NFR "개인정보 보관 기간")
- **DB 파괴적 변경** — 마이그레이션 / DROP / DELETE 관련 NFR

→ 위 항목은 🔴 마커 명시. 사용자 답변 받기 전 추정 default 작성 금지.

### 완화 HITL (가정/미정 표시 후 진행)

위 4 분야 외 일반 FR / NFR 은:
- 합리적 default / 추정으로 진행 OK
- 산출물에 🟨 가정 / ❓ 미정 마커 명시
- § 끝 "사용자 확인 필요 항목" 섹션 명시

예시 (완화 OK 항목):
- 일반 FR (목록 조회 / 상세 조회 / 입력 폼)
- 성능 NFR (p95 응답 시간 추정)
- 접근성 NFR (WCAG / 키보드)
- 국제화 / 호환성 NFR

### 마커

- 🟨 가정: default. 사용자 수정 가능
- ❓ 미정: 결정 필요. 사용자 답변 후 확정
- 🔴 위험: 강제 HITL — 사용자 답변 전 확정 X (4 분야: 법무/결제/권한/DB 파괴적)

## 7. 다음 skill 추천

- **Forward 표준**: `planner-policy-draft` (requirements → 정책 결정 템플릿)
- **Reverse 표준**: `planner-feature-spec` (Given/When/Then 형태로 시나리오화)
- (선택) `planner-api-spec-draft` (API 의존이 명확한 경우 병렬 가능)

## 8. 예시

### 짧은 예시
```
입력: ia-path: docs/plan/coupons/ia.md

IA P0 기능 = 3건 (목록 조회 / 상세 / 사용 처리)
→ FR-CPN-01: 쿠폰 목록 조회 (P0, deps: API:GET /coupons)
→ FR-CPN-02: 쿠폰 상세 조회 (P0, deps: FR-CPN-01 + API:GET /coupons/:id)
→ FR-CPN-03: 쿠폰 사용 처리 (P0, deps: FR-CPN-02 + API:POST /coupons/:id/use)

NFR:
→ NFR-CPN-01: 목록 p95 < 500ms (성능)
→ NFR-CPN-02: 인증 필수 (보안)
→ NFR-CPN-03: empty 상태 가독성 (접근성)
```

## 9. 작성 원칙 (주니어 친화)

- **ID 부여 일관성**: `FR-{도메인약어 3자}-{2자리 번호}` — 후속 문서에서 cite 쉽게
- **acceptance criteria = 측정 가능**: "빠르다" X / "p95 < 500ms" O
- **의존 명시**: "이 기능을 위해 무엇이 필요한가" 한 줄 — 누락 시 BE/FE 작업 분리 어려움
- **카테고리별 적용/해당 없음**: NFR 누락 방지 — "해당 없음" 명시는 의도적 결정
