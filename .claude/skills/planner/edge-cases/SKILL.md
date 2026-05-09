---
name: planner-edge-cases
description: 예외 케이스 정리 (정상 흐름 외 모든 분기). feature-spec + api-spec 확정 후 호출. 입력 유효성 / 권한 / 동시성 / 외부 의존 실패 / 데이터 부재 등 분류. 산출물 docs/plan/{name}/edge-cases.md.
---

# Skill: planner-edge-cases

10년차 기획자 시점에서 **예외 케이스(Edge Cases)** 를 정리한다. feature-spec 의 1차 예외를 베이스로 **심화 예외** 를 분류 / 표 형태로 정리.

> **Edge Case 한 줄 풀이 (주니어 친화)**:
> "정상 흐름(happy path) 이 아닌 모든 분기. 입력이 이상할 때 / 권한이 없을 때 / 동시 요청일 때 / 외부 시스템이 실패할 때 / 데이터가 없을 때 등."

## 1. 목적

- 예외를 카테고리별로 분류 (입력 / 권한 / 동시성 / 외부 / 데이터 / 시간 / 환경)
- 각 케이스의 조건 / 예상 결과 / 처리 방식 / 우선순위 표 작성
- QA 가 그대로 테스트 케이스화할 수 있는 수준
- 누락 위험 큰 카테고리 강제 점검

**산출물**: `docs/plan/{name}/edge-cases.md`

## 2. 입력 (input)

- **선행 산출물**:
  - `docs/plan/{name}/feature-spec.md` (필수)
  - `docs/plan/{name}/api-spec-draft.yaml` (필수 — Draft OK)
- (선택) `docs/plan/{name}/policy-draft.md` — 운영 정책 의존 케이스 cite
- 호출 args:
  ```
  feature-spec-path: docs/plan/{name}/feature-spec.md
  api-spec-draft-path: docs/plan/{name}/api-spec-draft.yaml
  policy-draft-path: docs/plan/{name}/policy-draft.md  # 선택
  ```

## 3. 절차 (steps)

### Step 1 — 선행 산출물 로드
- feature-spec 의 SC (시나리오) 1차 예외 추출
- api-spec-draft 의 4xx / 5xx 응답 추출 (마커 표시된 항목 — 후속 cite 시 마커 유지)
- policy-draft 의 정책 의존 분기 추출 (있다면)

### Step 2 — 카테고리별 강제 점검
다음 7 카테고리를 점검 — 각 카테고리에 케이스가 있는지 강제 확인:

| 카테고리 | 풀이 (주니어 친화) | 예시 |
|---|---|---|
| **입력 유효성** | 사용자 입력이 잘못됐을 때 | 빈 문자열 / 공백 / 음수 / 너무 긴 입력 / 형식 불일치 |
| **권한** | 인증 / 권한이 부족할 때 | 비로그인 / 역할 부족 / 토큰 만료 / 토큰 위조 |
| **동시성** | 같은 자원에 동시 요청이 올 때 | 같은 쿠폰 동시 사용 / 중복 클릭 / race condition |
| **외부 의존 실패** | 외부 시스템 (BE / GA4 / 결제) 가 실패할 때 | timeout / 5xx / 부분 응답 / 잘못된 응답 |
| **데이터 부재** | 기대한 데이터가 없을 때 | empty 목록 / 삭제된 자원 / 만료 자원 |
| **시간 / 시간대** | 시간 의존 / 시간대 차이 | 만료 직전 / KST vs UTC / 일광 절약 |
| **환경 / 디바이스** | 디바이스 / 브라우저 / 네트워크 차이 | offline / 저속 네트워크 / 구형 브라우저 / 작은 화면 |

각 카테고리에 케이스가 없으면 "해당 없음" 명시.

### Step 3 — 케이스별 상세 작성
각 케이스마다:
- ID: `EC-{도메인약어}-{번호}`
- 카테고리
- 조건 (Given 형태)
- 예상 결과 (Then 형태)
- 처리 방식 (FE / BE / 운영 분담)
- 우선순위 (P0 / P1 / P2)
- 관련 시나리오 / FR / API
- 정책 cite (있다면)

### Step 4 — 우선순위 분배
- **P0**: 데이터 손실 / 보안 / 결제 영향 — 반드시 처리
- **P1**: 사용자 경험 영향 — 처리 권장
- **P2**: 매우 드문 경우 / 차후 처리 가능

### Step 5 — 산출물 Write
- `docs/plan/{name}/edge-cases.md` Write

### Step 6 — 다음 skill 안내
보고:
- 산출물 경로
- 카테고리별 케이스 수
- P0 케이스 수 (개발팀 즉시 대응 필요)
- 다음 skill: `planner-qa-checklist`

## 4. 템플릿 (산출물)

```markdown
# 예외 케이스 — {도메인/기능명}

> 작성일: YYYY-MM-DD
> 선행 문서: [feature-spec.md](./feature-spec.md), [api-spec.yaml](./api-spec.yaml)
> (선택) [policy.md](./policy.md)

## 1. 개요

본 문서는 {도메인} 의 정상 흐름(happy path) 외 **예외 케이스(edge cases)** 를 7개 카테고리로 분류해 정리한다.

용어:
- **Edge Case**: 정상이 아닌 모든 분기
- **EC ID**: `EC-{도메인약어}-{번호}` — qa-checklist 에서 cite
- **처리 방식**: FE 처리 / BE 처리 / 운영 처리 / 정책 처리 분담

## 2. 카테고리별 점검 결과

| 카테고리 | 케이스 수 | P0 수 | 비고 |
|---|---|---|---|
| 입력 유효성 | 3 | 1 | EC-01 ~ EC-03 |
| 권한 | 4 | 2 | EC-04 ~ EC-07 |
| 동시성 | 2 | 1 | EC-08, EC-09 |
| 외부 의존 실패 | 3 | 1 | EC-10 ~ EC-12 |
| 데이터 부재 | 2 | 0 | EC-13, EC-14 |
| 시간 / 시간대 | 1 | 0 | EC-15 |
| 환경 / 디바이스 | 2 | 0 | EC-16, EC-17 |

## 3. 케이스 요약 표

| ID | 카테고리 | 한 줄 요약 | 우선순위 | 관련 SC/FR |
|---|---|---|---|---|
| EC-{ABBR}-01 | 입력 유효성 | 쿠폰 ID 형식 불일치 | P0 | FR-CPN-02, SC-CPN-07 |
| EC-{ABBR}-02 | 입력 유효성 | 쿠폰 ID 너무 김 (DoS) | P1 | FR-CPN-02 |
| EC-{ABBR}-04 | 권한 | 비로그인 진입 | P0 | FR-CPN-01, SC-CPN-02 |
| EC-{ABBR}-05 | 권한 | 토큰 만료 | P0 | FR-CPN-01 |
| EC-{ABBR}-08 | 동시성 | 같은 쿠폰 동시 사용 | P0 | FR-CPN-03, API:POST /coupons/:id/use |
| EC-{ABBR}-10 | 외부 | API timeout | P0 | API:GET /coupons |
| ... | ... | ... | ... | ... |

## 4. 케이스 상세

### EC-{ABBR}-01: 쿠폰 ID 형식 불일치 (입력 유효성)

- **카테고리**: 입력 유효성
- **조건 (Given)**:
  - 사용자가 잘못된 형식의 쿠폰 ID (예: 빈 문자열, 공백, SQL injection 시도) 로 GET /coupons/{id} 호출
- **예상 결과 (Then)**:
  - BE 가 400 Bad Request 응답 (code: "INVALID_COUPON_ID")
  - FE 는 "잘못된 요청입니다" 토스트 표시
  - 부작용: 보안 로그에 의심 패턴 기록
- **처리 방식**:
  - FE: 클라이언트 측 형식 검증 (정규식 — `^cpn_[a-z0-9]{6,}$`)
  - BE: 서버 측 재검증 (FE 우회 방지)
  - 운영: 의심 패턴 모니터링
- **우선순위**: P0 (보안 영향)
- **관련**: FR-CPN-02, SC-CPN-07, API:GET /coupons/{id} (400)
- **정책 cite**: -

### EC-{ABBR}-04: 비로그인 진입 (권한)

- **카테고리**: 권한
- **조건 (Given)**:
  - 비로그인 (guest) 사용자가 /coupons 진입
- **예상 결과 (Then)**:
  - 로그인 안내 화면 표시 (★ ia.md § 6 Owner 결정 cite)
  - API 호출 안 함 (FE 에서 라우팅 가드)
- **처리 방식**:
  - FE: AuthGuard 컴포넌트 — 비로그인 시 `/login?redirect=/coupons` 리디렉션
  - BE: 401 응답 (가드 우회 시)
- **우선순위**: P0
- **관련**: FR-CPN-01, SC-CPN-02
- **정책 cite**: POL-CPN-NN (사용자 권리 / 인증 정책)

### EC-{ABBR}-05: 토큰 만료 (권한)

- **카테고리**: 권한
- **조건 (Given)**:
  - 사용자 인증 토큰이 만료된 상태에서 API 호출
- **예상 결과 (Then)**:
  - BE 가 401 Unauthorized 응답
  - FE 는 자동 토큰 갱신 시도 (refresh token 있으면) 또는 로그아웃 + 로그인 화면 리디렉션
- **처리 방식**:
  - FE: HTTP 인터셉터 — 401 응답 시 갱신 / 리디렉션
  - BE: 401 + WWW-Authenticate 헤더
- **우선순위**: P0
- **관련**: FR-CPN-01, NFR-CPN-02 (보안)

### EC-{ABBR}-08: 같은 쿠폰 동시 사용 (동시성)

- **카테고리**: 동시성
- **조건 (Given)**:
  - 사용자가 같은 쿠폰의 "사용" 버튼을 매우 빠르게 2회 클릭
  - 또는 두 디바이스에서 동시에 같은 쿠폰 사용 시도
- **예상 결과 (Then)**:
  - 첫 번째 요청만 성공 (200 + status: used)
  - 두 번째 요청은 409 Conflict (code: "COUPON_ALREADY_USED")
- **처리 방식**:
  - FE: 클릭 시 버튼 disable (debounce) + Idempotency-Key 헤더 전송
  - BE: row-level lock 또는 optimistic locking (version 컬럼)
  - DB: UNIQUE 제약 또는 트랜잭션 격리
- **우선순위**: P0 (마케팅 비용 / 데이터 정합)
- **관련**: FR-CPN-03, SC-CPN-08, API:POST /coupons/{id}/use (409)
- **정책 cite**: POL-CPN-01 (쿠폰 1인 1회 발급)

### EC-{ABBR}-10: API timeout (외부 의존)

- **카테고리**: 외부 의존 실패
- **조건 (Given)**:
  - 사용자 진입 시 GET /coupons 호출이 5초 내 응답 안 옴
- **예상 결과 (Then)**:
  - FE 는 timeout 처리 (loading → error 전환)
  - 재시도 버튼 표시
  - GA4 이벤트 `error_coupons_timeout` 발화
- **처리 방식**:
  - FE: HTTP 클라이언트 timeout = 5초 + 재시도 UI
  - BE: SLA 모니터링 + 알림
- **우선순위**: P0
- **관련**: NFR-CPN-01 (성능)

### EC-{ABBR}-13: empty 목록 (데이터 부재)

- **카테고리**: 데이터 부재
- **조건**:
  - 발급된 쿠폰이 0개
- **예상 결과**:
  - empty 상태 UI 표시 ("발급된 쿠폰이 없습니다" + "쿠폰 받기" CTA)
- **처리 방식**: FE 처리
- **우선순위**: P1 (UX)
- **관련**: SC-CPN-03

### EC-{ABBR}-15: 만료 직전 (시간)

- **카테고리**: 시간 / 시간대
- **조건**:
  - 쿠폰이 KST 기준 23:59:50 만료, 사용자가 23:59:59 에 사용 시도
- **예상 결과**:
  - BE 시각 기준 처리 (서버 시간 = single source of truth)
  - 클라이언트 시계 차이로 인한 분쟁 방지 — BE 가 410 Gone 또는 200 결정
- **처리 방식**:
  - FE: 만료 임박 표시 (남은 시간 카운트다운)
  - BE: UTC 기준 처리 + KST 변환 응답
- **우선순위**: P1
- **관련**: NFR (시간대), POL-CPN-NN (만료 정책)

### EC-{ABBR}-16: offline (환경 / 디바이스)

- **카테고리**: 환경 / 디바이스
- **조건**:
  - 사용자 디바이스가 offline 상태
- **예상 결과**:
  - FE 는 네트워크 감지 → "인터넷 연결을 확인하세요" 메시지 표시
- **처리 방식**: FE 처리 (navigator.onLine 또는 fetch 실패)
- **우선순위**: P1

## 5. 우선순위 분포

| 우선순위 | 케이스 수 | 처리 시점 |
|---|---|---|
| P0 | N | 즉시 (출시 전 처리) |
| P1 | M | 다음 마일스톤 |
| P2 | K | 차후 결정 |

## 6. 처리 방식 분포

| 처리 주체 | 케이스 수 |
|---|---|
| FE | N |
| BE | M |
| FE+BE | K |
| 운영 | L |

## 7. 다음 단계

- [ ] qa-checklist.md 작성 (`planner-qa-checklist`)
- [ ] (필요 시) policy-draft.md 갱신 — 정책 의존 케이스 명시
- [ ] (필요 시) api-spec-draft.yaml 갱신 — 4xx 응답 보강

## 8. 변경 이력

| 날짜 | 변경 | 변경자 |
|---|---|---|
| YYYY-MM-DD | 초안 작성 | {agent / 사용자} |
```

## 5. 검증 (validation)

- [ ] 7 카테고리 모두 점검 (해당 없음 명시도 가능)
- [ ] 각 케이스 ID 부여 + 카테고리 분류
- [ ] 각 케이스 조건 / 예상 결과 / 처리 방식 / 우선순위 모두 채움
- [ ] P0 케이스는 처리 방식 명확 (FE / BE / 운영 분담)
- [ ] api-spec 의 4xx / 5xx 응답이 ≥ 1 케이스에서 cite 됨
- [ ] feature-spec 의 1차 예외가 모두 EC 로 흡수됨

## 6. HITL (Human-in-the-Loop) 지점

### 강제 HITL (자동 진행 금지)

본 skill 의 산출물 중 다음 분야 케이스는 사용자 답변 전 확정 금지:
- **법무 케이스** — 개인정보 처리 / 약관 동의 / 데이터 보관 기간 분기 (예: "탈퇴 시 데이터 즉시 삭제 vs 30일 보관")
- **결제 케이스** — 결제 실패 / 환불 자동 재시도 / 정산 분기 (예: "결제 실패 시 자동 재시도 N회 vs 즉시 환불")
- **권한 케이스** — 토큰 만료 / 권한 없음 처리 분기 (인증 정책 의존)
- **DB 파괴적 변경 케이스** — 마이그레이션 도중 동시 요청 / 데이터 불일치

→ 위 항목은 🔴 마커 명시. policy-draft.md 의 🔴 항목과 겹치면 cite + "사용자 답변 대기" 명시.

### 완화 HITL (가정/미정 표시 후 진행)

위 4 분야 외 일반 예외 케이스는:
- 합리적 default / 추정으로 진행 OK (입력 검증 / 동시 클릭 / 네트워크 timeout / empty / offline 등)
- 산출물에 🟨 가정 / ❓ 미정 마커 명시
- 케이스 표 / 상세에 마커 부여

### 마커

- 🟨 가정: default. 사용자 수정 가능
- ❓ 미정: 결정 필요. 사용자 답변 후 확정
- 🔴 위험: 강제 HITL — 사용자 답변 전 확정 X (4 분야)

## 7. 다음 skill 추천

- **표준**: `planner-qa-checklist` (모든 산출물 종합 → 테스트 케이스)

## 8. 예시

### 짧은 예시
```
입력: feature-spec-path: ..., api-spec-path: ...

카테고리 점검:
1. 입력 유효성 → EC-CPN-01 (ID 형식)
2. 권한 → EC-CPN-04 (비로그인), EC-CPN-05 (토큰 만료)
3. 동시성 → EC-CPN-08 (동시 사용)
4. 외부 → EC-CPN-10 (timeout)
5. 데이터 부재 → EC-CPN-13 (empty)
6. 시간 → EC-CPN-15 (만료 직전)
7. 환경 → EC-CPN-16 (offline)

P0 (즉시 처리): 5건
P1 (UX): 2건
```

## 9. 작성 원칙 (주니어 친화)

- **카테고리 강제 점검**: 7 카테고리 모두 명시 — 누락 방지
- **처리 주체 분담**: FE / BE / 운영 누가 처리할지 명확히 — 작업 분리 가능
- **정책 cite**: 운영 정책 의존 케이스는 policy.md 의 POL ID cite
- **★ Owner 결정 cite**: ia.md 의 미결 항목과 겹치면 cite — 결정 후 갱신
- **side effect 명시**: "GA4 이벤트 발화 / 보안 로그 기록 / 알림 발송" 모두 적기
