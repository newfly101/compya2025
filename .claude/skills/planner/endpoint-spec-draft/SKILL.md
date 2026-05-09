---
name: planner-endpoint-spec-draft
description: endpoint 명세 마크다운 표 — 주니어 개발자 친화. 추정 method/path/auth/query/body/response 명시 + 🔴/🟨/❓ 마커. BE Swagger 와 정합 검증용. BE 합의 후 별도 라운드에서 endpoint-spec.md 로 promote.
---

# planner-endpoint-spec-draft — endpoint 명세 마크다운 표 (Draft)

10년차 기획자 시점에서 **endpoint 명세 초안(Endpoint Specification Draft)** 을 **마크다운 표** 형식으로 작성한다. ⭐ **BE 합의 전 초안** — 확정 X.

> **endpoint 명세 한 줄 풀이 (주니어 친화)**:
> "REST API 의 endpoint / 요청 / 응답 / 인증 을 마크다운 표 형식으로 정리한 명세. OpenAPI YAML 학습 부담 X — 5분 내 작성 가능. BE Swagger UI (`/swagger-ui/**`) 와 비교해 정합 검증."

⭐ **OpenAPI YAML 대신 마크다운 표를 쓰는 사유 (사용자 결정 2026-05-09)**:
- 주니어 개발자 친화 — 학습 부담 회피
- 작성 5분 — OpenAPI 3.x 스펙 학습 필요 X
- BE Swagger 와 정합 검증 — BE 가 코드 작성 후 Swagger UI 와 본 표 비교

⭐ **Draft 명명 컨벤션**:
- `endpoint-spec-draft.md` 은 **확정 X**. BE 합의 + 사용자 확정 후 별도 라운드에서 `endpoint-spec.md` 로 이름 변경 (promote)
- promote 시 마커 (🔴/🟨/❓) 모두 제거 — 확정 값으로 대체
- 본 skill 은 **promote 안 함** — 사용자 명시 요청 시 별도 라운드에서 처리

## 1. 목적

- BE/FE 합의 전 endpoint 명세 — **확정 X 초안**
- 형식: 마크다운 표 (OpenAPI YAML 대신 — 작성 5분, 주니어 개발자도 이해)
- BE Swagger UI (`/swagger-ui/**`) 와 정합 검증 도구
- 사용자 합의 후 별도 라운드에서 `endpoint-spec.md` (확정) 로 promote

**산출물**: `docs/plan/{name}/endpoint-spec-draft.md` (확정 X — Draft)

## 2. 입력 (input)

- **선행 산출물**: `docs/plan/{name}/feature-spec.md` (필수 — 확정 후 진행)
  - (선택) `docs/plan/{name}/policy-draft.md` — 권한 / 데이터 정책 cite
  - (권장) `docs/plan/{name}/requirements.md`
- **BE 팀 합의**: 권한 분야 (auth) 만 강제 HITL — 그 외 method / path / body / response 는 추정 진행 OK (마커 표시)
- 호출 args:
  ```
  feature-spec-path: docs/plan/{name}/feature-spec.md
  policy-draft-path: docs/plan/{name}/policy-draft.md  # 선택
  requirements-path: docs/plan/{name}/requirements.md  # 선택
  ```

## 3. 절차 (steps)

### Step 1: feature-spec 의 시나리오에서 API 호출 식별
- 모든 SC (시나리오) 의 "Given/When/Then" 의 When 부분에서 API 호출 추출
- 예: When "사용자가 [등록] 클릭" → POST /api/foo
- 시나리오 → endpoint 매핑 (1:N or N:1 OK)

### Step 2: endpoint 별 명세 표 작성
- method / path / auth / query / body / response / 마커
- 추정값에 마커 명시 (🔴 / 🟨 / ❓)
- 권한 (auth) 분야는 모두 🔴 — 강제 HITL

### Step 3: BE Swagger 와 정합 검증 (BE 코드 작성 후)
- BE 의 `/swagger-ui/**` 또는 `/v3/api-docs` JSON 비교
- 불일치 항목 → BE 또는 본 명세 수정
- 본 라운드 미진행 — BE 코드 작성 후 별도 라운드

### Step 4: 사용자 / BE 합의 후 promote
- 별도 라운드에서 `endpoint-spec.md` (확정) 로 이름 변경
- 마커 (🔴/🟨/❓) 모두 제거 (확정 값으로 대체)
- 본 라운드 미진행 — 사용자 명시 요청 후 별도 라운드

### Step 5: 산출물 Write
- `docs/plan/{name}/endpoint-spec-draft.md` Write
- 마크다운 표 형식 + 마커

### Step 6: 다음 skill 안내
보고:
- 산출물 경로
- 정의된 endpoint 수
- 마커 분포 (🟨 가정 / ❓ 미정 / 🔴 권한)
- 🔴 항목 → 사용자 답변 필요
- 다음 skill: `planner-edge-cases`

## 4. 템플릿 (산출물)

산출물 위치: `docs/plan/{feature-or-system}/endpoint-spec-draft.md`

```markdown
# {Feature 이름} — endpoint 명세 (Draft)

> 작성일: YYYY-MM-DD
> 상태: 초안 (Draft) — BE 합의 전. 마커 (🔴/🟨/❓) 표시.
> promote: BE 합의 + 사용자 확정 후 endpoint-spec.md 로 변경 (마커 제거)
> 선행 문서: [feature-spec.md](./feature-spec.md), (선택) [policy-draft.md](./policy-draft.md)

## 마커 컨벤션
- 🔴 권한 / 위험: 강제 HITL — 사용자 답변 전 확정 X (auth, 결제, 법무, DB 파괴적)
- 🟨 가정: 합리적 default — BE 합의 시 수정 가능
- ❓ 미정: BE 합의 후 결정 필요

## endpoint 목록

| # | method | path | 설명 | auth | 마커 |
|---|---|---|---|---|---|
| 1 | GET | /api/foo | foo 리스트 조회 | public | — |
| 2 | POST | /api/admin/foo | foo 등록 | ADMIN | 🔴 권한 |
| 3 | PATCH | /api/admin/foo/{id} | foo 수정 | ADMIN | 🔴 권한 / ❓ partial vs full |

---

### 1. GET /api/foo (public foo 리스트)

| 항목 | 내용 | 마커 |
|---|---|---|
| **method** | GET | — |
| **path** | /api/foo | — |
| **auth** | public (토큰 없이 호출 OK) | 🟨 가정 |
| **query** | 없음 | ❓ pagination 필요 여부 |
| **body** | n/a (GET) | — |
| **response (200)** | `{ items: [{id, name, ...}], total }` | ❓ 응답 schema 미확정 |
| **response (4xx)** | 일반 에러 | 🟨 가정 |

**예시 호출**:
\`\`\`
GET /api/foo
→ 200 OK
{
  "items": [
    { "id": 1, "name": "예시" }
  ],
  "total": 1
}
\`\`\`

**❓ 미정 항목**:
- pagination (offset / limit 필요?)
- 정렬 (default `id desc`?)

**🔴 강제 HITL 항목**: 없음 (public)

**대응 시나리오**: SC-FOO-01, SC-FOO-03

---

### 2. POST /api/admin/foo (admin foo 등록)

| 항목 | 내용 | 마커 |
|---|---|---|
| **method** | POST | — |
| **path** | /api/admin/foo | — |
| **auth** | ADMIN role 필요 | 🔴 권한 (사용자 답변 후 확정) |
| **query** | 없음 | — |
| **body** | `{ name, type, value }` | ❓ 필드 schema 미확정 |
| **response (201)** | `{ id, name, type, value }` | 🟨 가정 |
| **response (400)** | validation 에러 | — |
| **response (401/403)** | 권한 없음 | — |

**예시 호출**:
\`\`\`
POST /api/admin/foo
Authorization: Bearer {token}
{
  "name": "새 항목",
  "type": "A",
  "value": 100
}
→ 201 Created
{
  "id": 42,
  "name": "새 항목",
  ...
}
\`\`\`

**🔴 강제 HITL 항목**:
- ADMIN role 만 호출 가능 — SecurityConfig 확인 필요
- body 필드 의 권한 검증 (type 별 권한 다르면)

**❓ 미정 항목**:
- body 필드 정확한 schema (필드명 / 타입 / required)
- 응답 schema (response 의 추가 필드 포함 여부)

**대응 시나리오**: SC-FOO-08

---

(템플릿 — 실제 사용 시 위 형식 따라 endpoint 별 표 + 예시 + 마커)

## 미정 항목 (전체 목록)

본 절은 ❓ 마커 항목을 모아 list (BE 합의 후 답변 필요).

- ❓ GET /api/foo — pagination 필요 여부 (offset / limit)
- ❓ GET /api/foo — 정렬 default (`id desc`?)
- ❓ POST /api/admin/foo — body 필드 schema (필드명 / 타입 / required)
- ❓ PATCH /api/admin/foo/{id} — partial vs full update

## 강제 HITL 항목 (전체 목록)

본 절은 🔴 마커 항목을 모아 list (사용자 답변 전 확정 X).

- 🔴 POST /api/admin/foo — ADMIN role / SecurityConfig
- 🔴 PATCH /api/admin/foo/{id} — ADMIN role / SecurityConfig

## BE Swagger 정합 검증 체크리스트 (BE 코드 작성 후)

- [ ] BE Swagger UI (`/swagger-ui/**`) 또는 `/v3/api-docs` JSON 확인
- [ ] 본 명세 endpoint 목록과 BE 의 endpoint 목록 비교
- [ ] method / path / auth / query / body / response 항목별 일치 확인
- [ ] 불일치 항목 → BE 또는 본 명세 수정
- [ ] 정합 후 endpoint-spec.md 로 promote (마커 제거)

## 변경 이력

| 날짜 | 변경 | 변경자 |
|---|---|---|
| YYYY-MM-DD | 초안 작성 | {agent / 사용자} |
```

## 5. 검증 (validation)

산출물 완료 기준:
- [ ] 모든 endpoint 가 마크다운 표 형식으로 명세됨
- [ ] 모든 시나리오 (SC-{ABBR}-NN) 가 ≥ 1 endpoint 와 매칭됨 (또는 "API 불필요" 명시)
- [ ] 각 endpoint 에 method / path / auth / query / body / response 항목 모두 채움
- [ ] 각 endpoint 에 마커 (🔴/🟨/❓) 적절히 표시됨
- [ ] 권한 분야 (auth) 는 모두 🔴 또는 확정 표기 (강제 HITL)
- [ ] 각 endpoint 의 response 200 + 4xx 정의
- [ ] ❓ 미정 항목은 § "미정 항목" 섹션에 모아 list
- [ ] 🔴 강제 HITL 항목은 § "강제 HITL 항목" 섹션에 모아 list
- [ ] 헤더에 "Draft — 확정 X" + promote 컨벤션 명시

## 6. HITL (Human-in-the-Loop) 지점

### 강제 HITL — 권한 분야 (자동 진행 절대 금지)

다음 항목은 사용자 / 보안 / BE 답변 받기 전 확정 X (🔴 마커):
- **인증 방식** — JWT Bearer vs Cookie session vs API Key
- **권한 등급** — public / user / ADMIN / 외부 — 각 endpoint auth
- **Token 만료 / Refresh** — 정책 결정
- **권한 scope** — endpoint 별 scope 정의

→ 추정 default (예: ADMIN) 는 작성하되 **🔴 마커** 명시.

### 완화 HITL (가정/미정 표시 후 진행)

- method / path / query / body / response schema — 추정 + 마커 (🟨/❓) 후 진행 가능
- 에러 코드 prefix — 🟨 가정
- pagination / 정렬 default — ❓ 미정
- BE Swagger 비교는 BE 코드 작성 후 별도 라운드

### 마커
- 🟨 가정: default. 사용자 수정 가능
- ❓ 미정: 결정 필요. 사용자 / BE 답변 후 확정
- 🔴 위험: 강제 HITL — 사용자 답변 전 확정 X (4 분야)

## 7. 다음 skill 추천

- **표준**: `planner-edge-cases` (endpoint 별 예외 분기 — validation / 권한 실패 / 동시성 등)
- **최종**: `planner-qa-checklist` (endpoint 호출 테스트 시나리오)
- **별도 라운드**: BE 합의 + 사용자 확정 후 `endpoint-spec.md` 로 promote (마커 제거)

## 8. 예시 (짧은)

```
입력: feature-spec-path: docs/plan/coupons/feature-spec.md

시나리오 SC-CPN-01 (쿠폰 목록) → GET /api/coupons (🟨 가정)
시나리오 SC-CPN-05 (쿠폰 상세) → GET /api/coupons/{id} (🟨 가정)
시나리오 SC-CPN-08 (쿠폰 사용) → POST /api/coupons/{id}/use (🟨 가정 — vs PATCH ❓)

🔴 강제 HITL:
- 인증 방식 = bearer JWT vs cookie session ?
- 권한 등급 (user / admin) ?

🟨 가정:
- HTTP Method (POST / PATCH 추정)
- response schema 필드
- 도메인 에러 코드 prefix

❓ 미정:
- pagination (offset / limit)
- Idempotency-Key 사용 여부

→ 산출물 docs/plan/coupons/endpoint-spec-draft.md — 모든 항목 마커 표시
→ 후속 edge-cases.md 에서 4xx 응답 cite 시 마커 유지
```

## 9. 작성 원칙 (주니어 친화)

- **마크다운 표 형식 우선**: OpenAPI YAML 학습 X — 표만 보면 즉시 이해
- **각 endpoint 1 표 + 예시 호출**: 주니어가 응답 모양 즉시 이해
- **마커 컨벤션 일관**: 🔴 / 🟨 / ❓ — 모든 추정 항목 명시
- **시나리오 cite**: "대응 시나리오: SC-{ABBR}-NN" 명시
- **🔴 권한 분야 자동 결정 X**: 사용자 / 보안 / BE 답변 받기 전 확정 X
- **Draft 명시**: 헤더 / 파일명 `endpoint-spec-draft.md` — 확정 X
- **promote 안내**: 별도 라운드에서 `endpoint-spec.md` 로 promote (마커 제거)
- **BE Swagger 정합 체크리스트 별도**: BE 코드 작성 후 정합 검증 가이드
- **미정 / 강제 HITL § 별도**: 산출물 끝에 모아 list — 사용자 검토 시 한 번에 식별
