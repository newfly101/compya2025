---
name: planner-qa-checklist
description: QA 체크리스트 작성 (수동/자동 테스트 가이드). 모든 선행 산출물 (ia / requirements / feature-spec / api-spec / edge-cases / policy) 종합. 시나리오별 체크박스 + 우선순위. 산출물 docs/plan/{name}/qa-checklist.md.
---

# Skill: planner-qa-checklist

10년차 기획자 시점에서 **QA 체크리스트(QA Checklist)** 를 작성한다. **주니어 QA 도 그대로 따라할 수 있는 명확성** 이 핵심.

> **QA Checklist 한 줄 풀이 (주니어 친화)**:
> "테스트해야 할 항목을 체크박스 형태로 정리한 가이드. 시나리오 + 예외 케이스 + 비기능 요구사항을 모두 포함. 수동 테스트 / 자동 테스트 둘 다 사용 가능."

## 1. 목적

- feature-spec 시나리오 → 수동 테스트 케이스
- edge-cases → 예외 테스트 케이스
- requirements (NFR) → 비기능 테스트 (성능 / 접근성 / 보안)
- api-spec → API 계약 테스트
- policy → 정책 준수 검증
- 우선순위별 분류 (P0 = 출시 전 / P1 = 다음 마일스톤 / P2 = 보류)

**산출물**: `docs/plan/{name}/qa-checklist.md`

## 2. 입력 (input)

- **선행 산출물 (모두 권장 — 가능한 만큼 cite)**:
  - `docs/plan/{name}/ia.md`
  - `docs/plan/{name}/requirements.md`
  - `docs/plan/{name}/feature-spec.md` (필수)
  - `docs/plan/{name}/api-spec-draft.yaml` (필수 — Draft OK)
  - `docs/plan/{name}/edge-cases.md` (필수)
  - (선택) `docs/plan/{name}/policy-draft.md`
- 호출 args:
  ```
  plan-dir: docs/plan/{name}/
  ```

## 3. 절차 (steps)

### Step 1 — 모든 선행 산출물 로드
- ia / requirements / feature-spec / api-spec-draft / edge-cases / policy-draft 순으로 Read
- ID 매핑 표 작성:
  - SC ID (시나리오) → 테스트 케이스
  - EC ID (예외) → 테스트 케이스
  - FR / NFR → 테스트 케이스
  - API endpoint → 계약 테스트
  - POL → 정책 준수 검증
- 마커 표시된 항목 추적 (🔴 / 🟨 / ❓) — TC 에 마커 유지

### Step 2 — 테스트 케이스 ID 부여
- `TC-{도메인약어}-{번호}` (예: `TC-CPN-01`)
- 시나리오 우선 (TC-01~)
- 예외 케이스 (TC-N+1~)
- 비기능 (TC-M+1~)

### Step 3 — 분류별 체크박스 작성

**기능 테스트 (functional)**:
- happy path 시나리오별 체크박스
- alt path 시나리오별 체크박스

**예외 테스트 (exception)**:
- edge-cases 의 EC ID 마다 체크박스
- 카테고리별 그룹

**비기능 테스트 (non-functional)**:
- 성능 / 가용성 / 보안 / 접근성 / 호환성

**API 계약 테스트**:
- endpoint 마다 정상 / 에러 응답 검증

**정책 준수 검증**:
- POL ID 마다 검증 케이스

### Step 4 — 자동화 가능 여부 표시
각 케이스마다:
- 자동화: unit / integration / e2e / 수동만
- 도구: Jest / Playwright / k6 / Postman / 수동

### Step 5 — 우선순위 분배 + 출시 전 체크리스트 분리
- P0 케이스만 모은 "출시 전 체크리스트" 별도 섹션
- 주니어 QA 가 출시 직전 한 번에 확인 가능

### Step 6 — 산출물 Write
- `docs/plan/{name}/qa-checklist.md` Write

### Step 7 — 종료 보고
- 산출물 경로
- 케이스 수 (기능 / 예외 / 비기능 / API / 정책)
- P0 케이스 수 (출시 전 처리)
- 자동화 가능 비율 (자동 / 수동)

## 4. 템플릿 (산출물)

```markdown
# QA 체크리스트 — {도메인/기능명}

> 작성일: YYYY-MM-DD
> 선행 문서: [ia](./ia.md), [requirements](./requirements.md), [feature-spec](./feature-spec.md), [api-spec-draft](./api-spec-draft.yaml), [edge-cases](./edge-cases.md), [policy-draft](./policy-draft.md)

## 0. 사용 안내 (주니어 QA 친화)

본 체크리스트는 다음 순서로 사용:
1. **출시 전**: § 1 "출시 전 P0 체크리스트" 만 확인 (필수)
2. **상세 테스트**: § 2 ~ § 7 카테고리별 케이스 진행
3. **자동화 우선 케이스**: 자동화 표시 (`auto: e2e` 등) 확인 — 우선 자동화 진행
4. **수동 케이스**: `manual` 표시된 케이스 사람이 직접 확인

용어:
- **TC (Test Case)**: 테스트 케이스 ID — `TC-{도메인약어}-{번호}`
- **자동화 레벨**: `unit` (함수 단위) / `integration` (모듈 통합) / `e2e` (사용자 시나리오) / `manual` (수동만)

## 1. ★ 출시 전 P0 체크리스트 (필수)

> 출시 전 반드시 모두 통과해야 함. P0 만 추출.

### 기능 (functional) P0
- [ ] TC-CPN-01: 로그인 사용자 쿠폰 목록 조회 정상 (SC-CPN-01) — `e2e`
- [ ] TC-CPN-02: 쿠폰 상세 조회 정상 (SC-CPN-05) — `e2e`
- [ ] TC-CPN-03: 쿠폰 사용 처리 정상 (SC-CPN-08) — `e2e`

### 예외 (exception) P0
- [ ] TC-CPN-10: 비로그인 진입 시 로그인 리디렉션 (EC-CPN-04) — `e2e`
- [ ] TC-CPN-11: 토큰 만료 시 갱신/리디렉션 (EC-CPN-05) — `integration`
- [ ] TC-CPN-12: 같은 쿠폰 동시 사용 시 첫 번째만 성공 (EC-CPN-08) — `integration`
- [ ] TC-CPN-13: API timeout 처리 (EC-CPN-10) — `integration`

### 비기능 (non-functional) P0
- [ ] TC-CPN-20: 목록 응답 p95 < 500ms (NFR-CPN-01) — `auto: k6`
- [ ] TC-CPN-21: 인증 미스 시 401 (NFR-CPN-02) — `integration`

### API 계약 P0
- [ ] TC-CPN-30: GET /coupons 200 응답 스키마 검증 — `auto: contract test`
- [ ] TC-CPN-31: POST /coupons/:id/use 409 응답 검증 — `auto: contract test`

### 정책 P0
- [ ] TC-CPN-40: 쿠폰 1인 1회 발급 (POL-CPN-01) — `integration`

---

## 2. 기능 테스트 (전체)

### 2.1 Happy Path

- [ ] TC-CPN-01: 로그인 사용자 쿠폰 목록 조회 정상 표시
  - 대응: SC-CPN-01, FR-CPN-01
  - 자동화: `e2e` (Playwright)
  - 우선순위: P0
  - 절차:
    1. 테스트 사용자로 로그인
    2. /coupons 진입
    3. 쿠폰 3건 표시 확인
    4. 활성 / 사용완료 / 만료 상태 시각 구분 확인
  - 기대 결과: 쿠폰 3건 모두 표시 + 상태 색상/배지 구분

- [ ] TC-CPN-02: 쿠폰 상세 조회 정상
  - 대응: SC-CPN-05, FR-CPN-02
  - 자동화: `e2e`
  - 우선순위: P0
  - 절차: ...
  - 기대 결과: ...

### 2.2 Alt Path

- [ ] TC-CPN-05: empty 상태 표시 (쿠폰 0건)
  - 대응: SC-CPN-03
  - 자동화: `e2e`
  - 우선순위: P1
  - 절차:
    1. 발급된 쿠폰 0건 사용자로 로그인
    2. /coupons 진입
  - 기대 결과: "발급된 쿠폰이 없습니다" 메시지 + "쿠폰 받기" CTA 노출

## 3. 예외 테스트

### 3.1 입력 유효성
- [ ] TC-CPN-10: 잘못된 쿠폰 ID 형식 — 400 응답 (EC-CPN-01) — `integration`

### 3.2 권한
- [ ] TC-CPN-11: 비로그인 진입 → 로그인 리디렉션 (EC-CPN-04) — `e2e` — P0
- [ ] TC-CPN-12: 토큰 만료 처리 (EC-CPN-05) — `integration` — P0

### 3.3 동시성
- [ ] TC-CPN-13: 같은 쿠폰 동시 사용 (EC-CPN-08) — `integration` — P0
  - 절차:
    1. 두 클라이언트에서 같은 쿠폰 사용 API 동시 호출
    2. 응답 확인
  - 기대 결과: 첫 번째 200, 두 번째 409

### 3.4 외부 의존 실패
- [ ] TC-CPN-14: API timeout 시 error 화면 (EC-CPN-10) — `integration` — P0

### 3.5 데이터 부재
- [ ] TC-CPN-15: empty 목록 (EC-CPN-13) — `e2e` — P1

### 3.6 시간 / 시간대
- [ ] TC-CPN-16: 만료 직전 사용 (EC-CPN-15) — `manual` — P1

### 3.7 환경 / 디바이스
- [ ] TC-CPN-17: offline 진입 (EC-CPN-16) — `manual` — P1

## 4. 비기능 테스트

### 4.1 성능
- [ ] TC-CPN-20: 목록 응답 p95 < 500ms (NFR-CPN-01) — `auto: k6` — P0

### 4.2 보안
- [ ] TC-CPN-21: 인증 미스 시 401 (NFR-CPN-02) — `integration` — P0
- [ ] TC-CPN-22: SQL injection 시도 차단 — `auto: ZAP` — P0

### 4.3 접근성
- [ ] TC-CPN-23: 키보드 탐색 (NFR-CPN-03) — `manual` — P1
- [ ] TC-CPN-24: 스크린리더 호환 — `manual` — P1

### 4.4 호환성
- [ ] TC-CPN-25: iOS Safari 최신 — `manual` — P0
- [ ] TC-CPN-26: Android Chrome 최신 — `manual` — P0
- [ ] TC-CPN-27: 작은 화면 (320px) — `manual` — P1

## 5. API 계약 테스트

### 5.1 GET /coupons
- [ ] TC-CPN-30: 200 응답 스키마 검증 — `auto: contract test` (Pact / OpenAPI validator) — P0
- [ ] TC-CPN-31: 401 응답 (인증 미스) — `auto` — P0
- [ ] TC-CPN-32: 500 응답 처리 — `manual` — P1

### 5.2 GET /coupons/{id}
- [ ] TC-CPN-33: 200 응답 — `auto` — P0
- [ ] TC-CPN-34: 404 응답 (없는 ID) — `auto` — P0

### 5.3 POST /coupons/{id}/use
- [ ] TC-CPN-35: 200 응답 (정상 사용) — `auto` — P0
- [ ] TC-CPN-36: 409 응답 (이미 사용) — `auto` — P0
- [ ] TC-CPN-37: 410 응답 (만료) — `auto` — P0
- [ ] TC-CPN-38: Idempotency-Key 동일 키 재시도 — `integration` — P0

## 6. 정책 준수 검증

- [ ] TC-CPN-40: 쿠폰 1인 1회 발급 (POL-CPN-01) — `integration` — P0
  - 절차: 같은 쿠폰 코드 발급 API 동일 사용자로 2회 호출
  - 기대 결과: 첫 번째 성공, 두 번째 409 (CODE: COUPON_ALREADY_ISSUED)

- [ ] TC-CPN-41: 개인정보 보관 1년 자동 삭제 (POL-CPN-02) — `manual` — P0
  - 절차: DB 마지막 활동일 1년 초과 사용자 데이터 확인
  - 기대 결과: 자동 삭제 배치 동작 확인

## 7. 회귀 테스트 (regression)

> 다음 릴리즈마다 반드시 실행

- [ ] § 1 출시 전 P0 체크리스트 전체 재실행
- [ ] 자동화 케이스 (`auto:*`) 전체 CI/CD 통과 확인

## 8. 통계

| 분류 | 케이스 수 | P0 | P1 | P2 |
|---|---|---|---|---|
| 기능 | N | M | K | L |
| 예외 | N | M | K | L |
| 비기능 | N | M | K | L |
| API 계약 | N | M | K | L |
| 정책 | N | M | K | L |
| **합계** | **N** | **M** | **K** | **L** |

| 자동화 레벨 | 케이스 수 | 비율 |
|---|---|---|
| auto (unit/integration/e2e/contract) | N | NN% |
| manual | N | NN% |

## 9. 변경 이력

| 날짜 | 변경 | 변경자 |
|---|---|---|
| YYYY-MM-DD | 초안 작성 | {agent / 사용자} |
```

## 5. 검증 (validation)

- [ ] 모든 SC (시나리오) → ≥ 1 TC
- [ ] 모든 EC (예외) → ≥ 1 TC
- [ ] 모든 NFR → ≥ 1 TC
- [ ] 모든 API endpoint → ≥ 1 계약 TC (200 + 4xx 최소)
- [ ] 모든 POL → ≥ 1 검증 TC
- [ ] § 1 "출시 전 P0 체크리스트" 별도 섹션 작성 — P0 만 모음
- [ ] 각 TC 자동화 레벨 명시 (auto/manual)
- [ ] 각 TC 우선순위 명시 (P0/P1/P2)

## 6. HITL (Human-in-the-Loop) 지점

### 강제 HITL (자동 진행 금지)

본 skill 의 산출물 중 다음 분야 테스트 케이스는 사용자 답변 전 확정 금지:
- **보안 테스트** — 인증 / 권한 / SQL injection / XSS — 권한 분야 의존 (🔴)
- **결제 테스트** — PG 결제 / 환불 / 정산 검증 케이스 (🔴)
- **법무 테스트** — 개인정보 보관 기간 자동 삭제 / 약관 동의 검증 (🔴)
- **DB 마이그레이션 테스트** — 마이그레이션 rollback / 데이터 정합 검증 (🔴)

→ 위 항목은 🔴 마커 명시. 선행 산출물의 🔴 항목과 겹치면 cite + "사용자 답변 대기" 명시.

### 완화 HITL (가정/미정 표시 후 진행)

위 4 분야 외 일반 TC 는:
- 합리적 default / 추정으로 진행 OK (기능 / 성능 / 접근성 / 호환성 등)
- 산출물에 🟨 가정 / ❓ 미정 마커 명시

선행 산출물 미완 항목 (마커 표시) 발견 시:
- "policy-draft.md 의 POL-CPN-03 🔴 → 본 qa-checklist 에서 TC-CPN-NN 🔴 사용자 답변 대기"
- "api-spec-draft.yaml 의 권한 schema 🔴 → TC-CPN-NN 🔴"

### 마커

- 🟨 가정: default. 사용자 수정 가능
- ❓ 미정: 결정 필요. 사용자 답변 후 확정
- 🔴 위험: 강제 HITL — 사용자 답변 전 확정 X (4 분야)

## 7. 다음 skill 추천

- **없음 — 본 skill 이 표준 흐름 마지막**
- 후속:
  - 실제 QA 진행 (수동 + 자동)
  - 자동화 케이스 코드화 (Jest / Playwright / k6 등)
  - 회귀 테스트 CI/CD 통합

## 8. 예시

### 짧은 예시
```
입력: plan-dir: docs/plan/coupons/

선행 산출물 로드:
- ia.md (P0 기능 3건)
- requirements.md (FR 3건 + NFR 3건)
- feature-spec.md (SC 8건)
- api-spec.yaml (3 endpoint)
- edge-cases.md (EC 17건)
- policy.md (POL 3건)

→ TC 매핑:
   기능 8건 (SC → TC)
   예외 17건 (EC → TC)
   비기능 3건 (NFR → TC)
   API 계약 9건 (endpoint × 응답)
   정책 3건 (POL → TC)
   합계 40건

→ P0: 25건 (출시 전 체크리스트)
→ 자동화 가능: 28건 (70%)
→ 수동: 12건 (30%)
```

## 9. 작성 원칙 (주니어 친화)

- **§ 1 출시 전 P0 체크리스트 별도**: 주니어 QA 가 출시 직전 한 번에 확인 가능
- **체크박스 형식**: `- [ ]` 마크다운 — markdown viewer 에서 그대로 사용
- **각 TC 절차 구체화**: "1. 로그인 / 2. /coupons 진입 / 3. ..." 단계별
- **자동화 표시**: `auto: e2e` / `manual` — QA 가 어떤 도구 쓸지 즉시 판단
- **선행 ID cite**: 각 TC 마다 SC / EC / FR / NFR / POL ID 명시 — 추적 가능성
- **정책 준수 별도 섹션**: § 6 정책 준수 — 컴플라이언스 / 감사 대비
- **회귀 테스트 § 7**: 다음 릴리즈마다 실행할 케이스 명시 — 누락 방지
