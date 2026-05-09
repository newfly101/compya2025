---
name: planner-feature-spec
description: Given/When/Then 기능 명세 (BDD 패턴 — 주어진 상황 / 행동 / 결과). requirements 확정 후 호출. 시나리오별 정상 흐름 + 1차 예외 정리. 산출물 docs/plan/{name}/feature-spec.md.
---

# Skill: planner-feature-spec

10년차 기획자 시점에서 **기능 명세(Feature Specification)** 를 작성한다. 형식은 **BDD 패턴** (Behavior-Driven Development — 행동 주도 개발).

> **BDD 패턴 한 줄 풀이 (주니어 친화)**:
> "주어진 상황(Given) — 사용자가 어떤 행동을 했을 때(When) — 어떤 결과가 나와야 한다(Then)"
> 형태로 기능을 시나리오 단위로 묘사한다. QA 자동화에 그대로 옮길 수 있는 형식.

## 1. 목적

- 각 FR (requirements 의 ID) 을 시나리오 단위로 풀어 작성
- 정상 흐름 (happy path) + 1차 예외 분리
- QA / 개발자가 동일하게 해석 가능한 명확한 행동 묘사
- edge-cases 의 베이스 (전체 예외는 별도 skill 에서 심화)

**산출물**: `docs/plan/{name}/feature-spec.md`

## 2. 입력 (input)

- **선행 산출물**: `docs/plan/{name}/requirements.md` (필수 — 없으면 즉시 중단)
- (선택) `docs/plan/{name}/policy-draft.md` — Forward 흐름: requirements → policy-draft → feature-spec
- (선택) `docs/plan/{name}/ia.md` — Flow cite 용
- 호출 args:
  ```
  requirements-path: docs/plan/{name}/requirements.md
  policy-draft-path: docs/plan/{name}/policy-draft.md  # 선택
  ```

## 3. 절차 (steps)

### Step 1 — Requirements 로드
- 모든 FR 목록 추출
- FR ID + 한 줄 요약 + acceptance criteria 매핑

### Step 2 — 시나리오 분해
각 FR 마다:
1. **정상 흐름 (happy path) 1개** 작성 — 가장 일반적인 사용자 흐름
2. **주요 분기 (alt path)** — 권한 / 상태 / 입력 차이로 인한 분기
3. **1차 예외 (basic exception)** — 명확히 예측 가능한 실패 (예: 네트워크 실패, 입력 누락)

심화 예외 (동시성 / 외부 시스템 장애 / 데이터 부재 패턴) 는 `planner-edge-cases` 에서 다룸. 본 skill 은 1차 예외까지만.

### Step 3 — Given/When/Then 작성
각 시나리오마다:
- **Given (주어진 상황)**: 시나리오 시작 전 전제 (사용자 상태 / 데이터 상태 / 시스템 상태)
- **When (행동)**: 사용자 또는 시스템의 행동 (한 가지)
- **Then (결과)**: 기대되는 결과 (가시 결과 + 부작용)

### Step 4 — Mockup / 와이어프레임 cite (선택)
- IA 의 화면 구조 cite
- 디자인 / Figma 노드 ID 가 있으면 명시 (없으면 "wireframe-generator 단계에서 채움")

### Step 5 — 산출물 Write
- `docs/plan/{name}/feature-spec.md` Write

### Step 6 — 다음 skill 안내
보고:
- 산출물 경로
- 시나리오 수
- 1차 예외 수 (edge-cases 에서 심화 필요)
- 마커 분포 (🔴 / 🟨 / ❓) — 4 분야 시나리오 식별
- 다음 skill: `planner-api-spec-draft` 또는 `planner-edge-cases`

## 4. 템플릿 (산출물)

```markdown
# 기능 명세 — {도메인/기능명}

> 작성일: YYYY-MM-DD
> 선행 문서: [requirements.md](./requirements.md), [ia.md](./ia.md)

## 1. 개요

본 문서는 requirements.md 의 각 FR 을 **Given/When/Then** (주어진 상황 / 행동 / 결과) 형태로 시나리오화한다.

용어:
- **Given**: 시나리오 시작 전 전제 — "사용자가 로그인 상태이며, 발급된 쿠폰 3개가 있다"
- **When**: 사용자 또는 시스템 행동 — "사용자가 /coupons 진입한다"
- **Then**: 기대 결과 — "쿠폰 목록 3개가 표시된다"

각 시나리오는 후속 qa-checklist 에서 그대로 테스트 케이스로 변환된다.

## 2. 시나리오 인덱스

| 시나리오 ID | FR | 한 줄 요약 | 분류 |
|---|---|---|---|
| SC-{ABBR}-01 | FR-{ABBR}-01 | 쿠폰 목록 정상 진입 | happy |
| SC-{ABBR}-02 | FR-{ABBR}-01 | guest 사용자 진입 | alt |
| SC-{ABBR}-03 | FR-{ABBR}-01 | 발급된 쿠폰 0개 | alt |
| SC-{ABBR}-04 | FR-{ABBR}-01 | 네트워크 실패 | exception |
| SC-{ABBR}-05 | FR-{ABBR}-02 | ... | happy |

## 3. 시나리오 상세

### SC-{ABBR}-01: 쿠폰 목록 정상 진입 (happy)

**대응 FR**: FR-{ABBR}-01

**Given (주어진 상황)**:
- 사용자는 로그인 상태이다
- 사용자에게 발급된 활성 쿠폰이 3개 있다
- 네트워크가 정상이다

**When (행동)**:
- 사용자가 /coupons 라우트에 진입한다

**Then (결과)**:
- 쿠폰 목록 화면이 표시된다
- 발급된 쿠폰 3개가 시각적으로 구분되어 표시된다 (활성 / 사용완료 / 만료)
- (부작용) GA4 이벤트 `view_coupons_list` 발화

**참고**:
- 화면: ia.md § 4 "쿠폰 목록"
- API: api-spec.yaml `GET /api/coupons` (작성 시점에 미작성이면 "TBD")

---

### SC-{ABBR}-02: guest 사용자 진입 (alt)

**대응 FR**: FR-{ABBR}-01

**Given**:
- 사용자는 비로그인 (guest) 상태이다

**When**:
- 사용자가 /coupons 라우트에 진입한다

**Then**:
- 로그인 안내 화면 또는 빈 목록이 표시된다 (★ Owner 결정 — ia.md § 6 cite)
- (부작용) 없음

---

### SC-{ABBR}-03: 발급된 쿠폰 0개 (alt)

**Given**:
- 사용자는 로그인 상태이다
- 사용자에게 발급된 쿠폰이 0개이다

**When**:
- 사용자가 /coupons 라우트에 진입한다

**Then**:
- empty 상태 메시지 ("발급된 쿠폰이 없습니다") 가 표시된다
- (행동 유도) "쿠폰 받기" CTA 버튼 노출 (P1 — 기능 발급 채널 별도)

---

### SC-{ABBR}-04: 네트워크 실패 (exception)

**Given**:
- 사용자는 로그인 상태이다
- 네트워크가 끊긴 상태이다

**When**:
- 사용자가 /coupons 라우트에 진입한다

**Then**:
- error 상태 화면이 표시된다 ("일시적인 오류가 발생했습니다")
- 재시도 버튼이 표시된다
- (부작용) GA4 이벤트 `error_coupons_list` 발화

**참고**: 심화 예외 (5xx / timeout / partial 응답) 는 edge-cases.md 참조

---

## 4. Mockup / Wireframe cite

| 시나리오 | 화면 | Figma node | 비고 |
|---|---|---|---|
| SC-01 | 쿠폰 목록 (success) | TBD | wireframe-generator 단계 |
| SC-03 | 쿠폰 목록 (empty) | TBD | wireframe-generator 단계 |

## 5. 시나리오 통계

| 분류 | 수 |
|---|---|
| happy | N |
| alt | M |
| exception (1차) | K |

심화 예외 추가 작성 권고: edge-cases.md (`planner-edge-cases`)

## 6. 다음 단계

- [ ] api-spec-draft.yaml 작성 (`planner-api-spec-draft`) — API 명세 초안
- [ ] edge-cases.md 작성 (`planner-edge-cases`) — 심화 예외
- [ ] qa-checklist.md 작성 (`planner-qa-checklist`) — 본 시나리오 → 테스트 케이스

## 7. 변경 이력

| 날짜 | 변경 | 변경자 |
|---|---|---|
| YYYY-MM-DD | 초안 작성 | {agent / 사용자} |
```

## 5. 검증 (validation)

- [ ] 모든 FR 마다 ≥ 1 시나리오 (happy path 필수)
- [ ] 각 시나리오 ID 부여 (`SC-{ABBR}-{NN}`)
- [ ] 각 시나리오 Given / When / Then 모두 채움
- [ ] When 은 한 가지 행동만 (여러 행동은 시나리오 분리)
- [ ] Then 의 부작용 (GA4 이벤트 / DB 변경 / 다른 화면 영향) 명시
- [ ] alt / exception 분류된 시나리오 ≥ 1 (단순 happy 만 있으면 부족)

## 6. HITL (Human-in-the-Loop) 지점

### 강제 HITL (자동 진행 금지)

본 skill 의 산출물 중 다음 분야 시나리오는 사용자 답변 전 확정 금지:
- **권한 분기 시나리오** — 비로그인 / 권한 부족 / 토큰 만료 처리 (예: "guest 진입 시 로그인 강제 vs 빈 목록")
- **결제 시나리오** — 결제 / 환불 / 정산 흐름
- **법무 시나리오** — 약관 동의 / 개인정보 처리 동의 흐름
- **DB 파괴적 변경 시나리오** — 마이그레이션 시점 사용자 흐름

→ 위 항목은 🔴 마커 명시. 사용자 답변 받기 전 Then 결과 확정 X.

### 완화 HITL (가정/미정 표시 후 진행)

위 4 분야 외 일반 시나리오는:
- 합리적 default / 추정으로 진행 OK (정상 흐름 / empty / 네트워크 실패 등)
- 산출물에 🟨 가정 / ❓ 미정 마커 명시
- 시나리오 표 / 상세에 마커 부여

### 마커

- 🟨 가정: default. 사용자 수정 가능
- ❓ 미정: 결정 필요. 사용자 답변 후 확정
- 🔴 위험: 강제 HITL — 사용자 답변 전 확정 X (4 분야)

## 7. 다음 skill 추천

- **표준**: `planner-api-spec-draft` (시나리오 → API 명세 초안 도출)
- **병렬 가능**: `planner-edge-cases` (심화 예외 정리)
- **최종**: `planner-qa-checklist` (모든 산출물 종합)

## 8. 예시

### 짧은 예시
```
입력: requirements-path: docs/plan/coupons/requirements.md

FR-CPN-01 (쿠폰 목록 조회) →
  SC-CPN-01: 정상 진입 (happy)
  SC-CPN-02: guest 진입 (alt — Owner 결정 cite)
  SC-CPN-03: empty (alt)
  SC-CPN-04: 네트워크 실패 (exception)

FR-CPN-02 (쿠폰 상세) →
  SC-CPN-05: 정상 (happy)
  SC-CPN-06: 만료 쿠폰 클릭 (alt)
  SC-CPN-07: 잘못된 ID (exception — 404)
```

## 9. 작성 원칙 (주니어 친화)

- **Given/When/Then = 자연어 문장**: 코드 X / 비즈니스 언어 O
- **When 한 가지**: "사용자가 클릭하고 또 클릭한다" X — 시나리오 분리
- **Then 부작용 명시**: "결과 표시 + GA4 이벤트 발화 + Redux store 갱신" 모두 적기
- **★ Owner 결정 cite**: 분기가 아직 미정이면 "ia.md § 6 cite — 결정 후 확정" 명시
- **심화 예외는 별도**: 본 skill 은 1차 예외까지 — edge-cases.md 에서 심화
