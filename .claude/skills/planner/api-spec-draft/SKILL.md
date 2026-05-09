---
name: planner-api-spec-draft
description: OpenAPI 3.x 초안 (Draft) — BE 합의 전. 추정 endpoint / DTO / 권한 명시 + 마커 (🟨 가정 / ❓ 미정 / 🔴 권한). 권한·security schemes 분야는 강제 HITL — 사용자 답변 후 확정. BE 팀 확정 후 별도 라운드에서 api-spec.yaml 로 promote. 산출물 docs/plan/{name}/api-spec-draft.yaml.
---

# Skill: planner-api-spec-draft

10년차 기획자 시점에서 **API 명세 초안(API Specification Draft)** 을 OpenAPI 3.x 형식 (YAML) 으로 작성한다. ⭐ **BE 합의 전 초안** — 확정 X.

> **OpenAPI 한 줄 풀이 (주니어 친화)**:
> "REST API 의 endpoint / 요청 / 응답 / 인증 / 에러를 표준 YAML 형식으로 정의하는 명세서. Swagger UI / Postman / 코드 생성 도구에서 그대로 사용 가능."

⭐ **Draft 명명 컨벤션**:
- `api-spec-draft.yaml` 은 **확정 X**. BE 팀 합의 후 별도 라운드에서 `api-spec.yaml` 로 이름 변경 (promote)
- 본 skill 은 **promote 안 함** — 사용자 명시 요청 시 별도 라운드에서 처리

## 1. 목적

- 각 시나리오에 필요한 API endpoint **추정 도출** (BE 합의 전)
- 요청 / 응답 DTO 추정 정의 (schemas)
- 인증 / 권한 (security) — **강제 HITL** (권한 분야 — 사용자 답변 후 확정)
- 에러 응답 표준화
- BE 팀과 합의 가능한 수준의 초안 산출

**산출물**: `docs/plan/{name}/api-spec-draft.yaml` (확정 X — Draft)

## 2. 입력 (input)

- **선행 산출물**: `docs/plan/{name}/feature-spec.md` (필수)
  - (권장) `docs/plan/{name}/requirements.md`
  - (선택) `docs/plan/{name}/policy-draft.md` (권한 / 데이터 정책 cite)
- **BE 팀 합의**: 권한 분야 (security schemes / scopes) 만 강제 HITL — 그 외 endpoint / DTO 는 추정 진행 OK (마커 표시)
- 호출 args:
  ```
  feature-spec-path: docs/plan/{name}/feature-spec.md
  requirements-path: docs/plan/{name}/requirements.md  # 선택
  policy-draft-path: docs/plan/{name}/policy-draft.md  # 선택
  ```

## 3. 절차 (steps)

### Step 1 — Feature-spec 로드
- 모든 SC (시나리오) 추출
- 각 시나리오의 When (행동) 에서 API 호출 추정

### Step 2 — Endpoint 추정 도출 (마커 표시)
- 시나리오별로 필요한 endpoint 추출:
  - 조회 → GET (🟨 가정)
  - 생성 → POST (🟨 가정)
  - 수정 → PUT / PATCH (❓ 미정 — BE 합의 후 결정)
  - 삭제 → DELETE
- 리소스 명사 우선 (예: `/coupons`, `/coupons/:id`, `/coupons/:id/use`)
- 동사 형식은 action endpoint (예: `/coupons/:id/use`) — 자원 추상화 어려운 경우만
- ⚠ 모든 endpoint 추정 항목에 **YAML 주석 마커** 부여 (`# 🟨 가정` / `# ❓ 미정` / `# 🔴 권한`)

### Step 3 — DTO 스키마 추정
- request body / response body 필드 / 타입 추정
- 필드별 마커 표시 (BE 합의 전 미정 필드 명시)

### Step 4 — 🔴 강제 HITL: 권한 / Security
다음 항목은 **사용자 답변 받기 전 확정 X**:
- `securitySchemes` (인증 방식 — JWT / Cookie / API Key)
- 각 endpoint `security` (권한 등급 — user / admin)
- 권한 scope 정의

→ 추정 default (예: bearerAuth) 작성하되 **🔴 마커 주석** 명시 — 사용자 답변 후 확정.

### Step 5 — 일반 항목 (BE 합의 전 추정 OK)
- Endpoint 경로 → 🟨 가정 (마커 주석)
- HTTP Method → 🟨 가정
- DTO 필드 → 🟨 가정 / ❓ 미정 (모호 항목)
- 에러 코드 → 🟨 가정 (도메인 prefix 추정)
- 멱등성 처리 → 🟨 가정 (Idempotency-Key 권장)

### Step 6 — 스키마 / 보안 정의
- `components.schemas` 에 공통 모델 추정 정의
- `components.securitySchemes` 에 추정 인증 방식 — 🔴 마커
- `components.responses` 에 표준 에러 응답 정의 (400 / 401 / 403 / 404 / 500)

### Step 7 — 산출물 Write (YAML)
- `docs/plan/{name}/api-spec-draft.yaml` Write
- 유효한 OpenAPI 3.x 형식 + 마커 주석

### Step 8 — 다음 skill 안내
보고:
- 산출물 경로
- 정의된 endpoint 수
- 마커 분포 (🟨 가정 / ❓ 미정 / 🔴 권한)
- 🔴 항목 → 사용자 답변 필요
- 다음 skill: `planner-edge-cases`

## 4. 템플릿 (산출물)

```yaml
openapi: 3.0.3
info:
  title: "{도메인} API (Draft)"
  version: "0.1.0-draft"
  description: |
    {도메인} 의 REST API 명세 (Draft — BE 합의 전).

    ⭐ 본 문서는 Draft — 확정 X.
    ⭐ BE 팀 합의 후 별도 라운드에서 api-spec.yaml 로 promote.

    선행 문서:
    - docs/plan/{name}/feature-spec.md
    - docs/plan/{name}/requirements.md
    - (선택) docs/plan/{name}/policy-draft.md

    마커 컨벤션:
    - 🔴 권한: 강제 HITL (security schemes / scopes) — 사용자 답변 전 확정 X
    - 🟨 가정: 합리적 default — BE 합의 시 수정 가능
    - ❓ 미정: BE 합의 후 결정 필요

servers:
  - url: https://api.example.com
    description: Production
  - url: https://api-stg.example.com
    description: Staging

# -------------------- Tags --------------------
tags:
  - name: coupons
    description: 쿠폰 도메인

# -------------------- Paths --------------------
paths:
  /coupons:
    # 🟨 가정: GET /coupons (목록 조회) — REST 자원 명사 패턴
    get:
      tags: [coupons]
      summary: 쿠폰 목록 조회
      description: |
        로그인 사용자의 발급된 쿠폰 목록을 조회한다.
        대응 시나리오: SC-CPN-01, SC-CPN-03
      operationId: listCoupons
      security:
        # 🔴 권한 — 강제 HITL: 인증 방식 (Bearer JWT vs Cookie session) — 사용자 답변 후 확정
        - bearerAuth: []
      parameters:
        - in: query
          name: status
          # 🟨 가정: status 필터 enum (BE 합의 시 수정 가능)
          schema:
            type: string
            enum: [active, used, expired]
          description: 쿠폰 상태 필터 (선택)
      responses:
        '200':
          description: 정상 응답
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CouponListResponse'
              example:
                items:
                  - id: "cpn_001"
                    name: "여름 할인 쿠폰"
                    status: "active"
                    expires_at: "2026-08-31T23:59:59+09:00"
                total: 1
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalError'

  /coupons/{id}:
    # 🟨 가정: GET /coupons/{id} (상세 조회)
    get:
      tags: [coupons]
      summary: 쿠폰 상세 조회
      description: |
        쿠폰 ID 로 상세 정보 조회.
        대응 시나리오: SC-CPN-05, SC-CPN-07
      operationId: getCoupon
      security:
        # 🔴 권한 — 강제 HITL
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
          description: 쿠폰 ID
      responses:
        '200':
          description: 정상 응답
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Coupon'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalError'

  /coupons/{id}/use:
    # 🟨 가정: POST action endpoint (vs PATCH /coupons/{id} status 업데이트) — BE 합의 시 결정
    post:
      tags: [coupons]
      summary: 쿠폰 사용 처리
      description: |
        쿠폰을 사용 처리한다 (action endpoint).
        대응 시나리오: SC-CPN-08
        멱등성: 동일 요청 N회 호출 시 1회만 처리 (Idempotency-Key 헤더 권장)
      operationId: useCoupon
      security:
        # 🔴 권한 — 강제 HITL
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
        - in: header
          name: Idempotency-Key
          # 🟨 가정: 멱등 처리 키 (UUID 권장) — BE 합의 시 사용 여부 확정
          required: false
          schema:
            type: string
          description: 멱등 처리 키 (UUID 권장)
      responses:
        '200':
          description: 사용 완료
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Coupon'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '404':
          $ref: '#/components/responses/NotFound'
        '409':
          # 🟨 가정: 도메인 에러 코드 prefix = COUPON_* — BE 합의 시 확정
          description: 이미 사용된 쿠폰
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                code: "COUPON_ALREADY_USED"
                message: "이미 사용된 쿠폰입니다"
        '410':
          description: 만료된 쿠폰
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ErrorResponse'
              example:
                code: "COUPON_EXPIRED"
                message: "만료된 쿠폰입니다"
        '500':
          $ref: '#/components/responses/InternalError'

# -------------------- Components --------------------
components:

  # -------- Schemas --------
  schemas:

    Coupon:
      # 🟨 가정: Coupon DTO 필드 (BE 합의 시 수정 가능)
      type: object
      required: [id, name, status, expires_at]
      properties:
        id:
          type: string
          example: "cpn_001"
        name:
          type: string
          example: "여름 할인 쿠폰"
        description:
          type: string
          example: "전 상품 10% 할인"
        status:
          type: string
          enum: [active, used, expired]
        issued_at:
          type: string
          format: date-time
        expires_at:
          type: string
          format: date-time
        used_at:
          # ❓ 미정: nullable 처리 — BE 합의 후 확정
          type: string
          format: date-time
          nullable: true

    CouponListResponse:
      # 🟨 가정: 페이징 처리 — BE 합의 시 cursor / offset 결정
      type: object
      required: [items, total]
      properties:
        items:
          type: array
          items:
            $ref: '#/components/schemas/Coupon'
        total:
          type: integer
          description: 전체 쿠폰 수

    ErrorResponse:
      type: object
      required: [code, message]
      properties:
        code:
          type: string
          # 🟨 가정: 에러 코드 형식 (대문자 스네이크) — BE 합의 시 확정
          description: 에러 코드 (대문자 스네이크)
          example: "COUPON_NOT_FOUND"
        message:
          type: string
          description: 사용자 노출용 메시지 (한국어)
          example: "쿠폰을 찾을 수 없습니다"
        detail:
          type: string
          description: 디버깅용 세부 메시지 (개발 환경에서만 노출)
        request_id:
          type: string
          description: 요청 추적 ID

  # -------- Responses (재사용) --------
  responses:

    Unauthorized:
      description: 인증 필요
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            code: "UNAUTHORIZED"
            message: "로그인이 필요합니다"

    Forbidden:
      description: 권한 없음
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            code: "FORBIDDEN"
            message: "접근 권한이 없습니다"

    NotFound:
      description: 리소스 없음
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            code: "NOT_FOUND"
            message: "리소스를 찾을 수 없습니다"

    InternalError:
      description: 서버 오류
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          example:
            code: "INTERNAL_ERROR"
            message: "일시적인 오류가 발생했습니다"

  # -------- Security --------
  securitySchemes:
    bearerAuth:
      # 🔴 권한 — 강제 HITL: 인증 방식 (JWT Bearer vs Cookie session) — 사용자 답변 후 확정
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        Authorization: Bearer {token} 헤더.
        🔴 권한 — 강제 HITL: cookie-based vs header bearer 결정 (사용자 / 보안 / BE 답변 후 확정).

# -------------------- 글로벌 보안 (선택) --------------------
# security:
#   - bearerAuth: []
```

## 5. 검증 (validation)

- [ ] 모든 시나리오 (SC-{ABBR}-NN) 가 ≥ 1 endpoint 와 매칭됨 (또는 "API 불필요" 명시)
- [ ] 각 endpoint summary / description / operationId 작성
- [ ] 각 endpoint 응답 200 / 4xx / 5xx 모두 정의
- [ ] schemas 의 공통 모델 정의 (Coupon / ErrorResponse 등)
- [ ] securitySchemes 정의 + 각 endpoint security 명시 — **모두 🔴 권한 마커 주석**
- [ ] OpenAPI 3.x 형식 유효성 (swagger-cli validate 등으로 검증 가능한 수준)
- [ ] 모든 추정 항목에 마커 주석 (🟨 / ❓ / 🔴) — 누락 금지
- [ ] 헤더 description 에 "Draft — 확정 X" + promote 컨벤션 명시

## 6. HITL (Human-in-the-Loop) 지점

### 강제 HITL — 권한 분야 (자동 진행 절대 금지)

다음 항목은 사용자 / 보안 / BE 답변 받기 전 확정 X (🔴 마커):
- **인증 방식** — JWT Bearer vs Cookie session vs API Key
- **권한 등급** — user / admin / 외부 — 각 endpoint security
- **Token 만료 / Refresh** — 정책 결정
- **권한 scope** — endpoint 별 scope 정의

→ 추정 default (예: bearerAuth) 는 작성하되 **🔴 마커 주석** 명시.

### 일반 HITL 완화 (BE 합의 전 추정 OK — 마커 표시 후 진행)

다음 항목은 추정 + 마커 표시 후 진행 OK:
- Endpoint 경로 (REST 자원 vs action) → 🟨 가정
- HTTP Method → 🟨 가정
- DTO 필드 / 타입 / required / nullable → 🟨 / ❓
- 에러 코드 prefix (COUPON_* vs ERR_COUPON_*) → 🟨 가정
- 멱등성 처리 (Idempotency-Key) → 🟨 가정
- 페이징 (cursor vs offset) → ❓ 미정

### 마커 주석 컨벤션 (YAML)

```yaml
paths:
  /api/...:
    get:
      summary: ...
      # 🟨 가정: GET 메서드 (조회) — BE 합의 시 수정 가능
      # ❓ 미정: 응답 schema 의 N 필드 (BE 합의 후 확정)
      ...
      security:
        # 🔴 권한 — 강제 HITL: 권한 등급 (사용자 답변 후 확정)
        - bearerAuth: []
```

## 7. 다음 skill 추천

- **표준**: `planner-edge-cases` (API 응답 / 에러 코드 → 예외 케이스 심화)
- **최종**: `planner-qa-checklist` (모든 산출물 종합)
- **별도 라운드**: BE 팀 합의 후 `api-spec.yaml` 로 promote (이름 변경)

## 8. 예시

### 짧은 예시
```
입력: feature-spec-path: docs/plan/coupons/feature-spec.md

시나리오 SC-CPN-01 (쿠폰 목록) → GET /coupons (🟨 가정)
시나리오 SC-CPN-05 (쿠폰 상세) → GET /coupons/{id} (🟨 가정)
시나리오 SC-CPN-08 (쿠폰 사용) → POST /coupons/{id}/use (🟨 가정 — vs PATCH)

🔴 권한 — 강제 HITL:
- 인증 방식 = bearer JWT vs cookie session ?
- 권한 등급 (user / admin) ?

🟨 가정 (BE 합의 전 추정):
- HTTP Method (POST / PATCH / DELETE 등)
- DTO 필드
- 도메인 에러 코드 prefix
- Idempotency-Key 사용 여부

→ 산출물 docs/plan/coupons/api-spec-draft.yaml — 모든 항목 마커 주석 표시
→ 후속 edge-cases.md 에서 4xx 응답 cite 시 마커 유지
```

## 9. 작성 원칙 (주니어 친화)

- **YAML 주석 마커 활용**: `# 🟨 가정` / `# ❓ 미정` / `# 🔴 권한` — 모든 추정 항목 명시
- **operationId 일관성**: camelCase + 동사+명사 (listCoupons / getCoupon / useCoupon)
- **에러 응답 표준화**: `components.responses` 재사용 — endpoint 마다 같은 4xx 정의 X
- **example 포함**: 각 endpoint 응답 example 한 개 — 주니어가 응답 모양 즉시 이해
- **시나리오 cite**: description 에 "대응 시나리오: SC-{ABBR}-NN" 명시
- **🔴 권한 분야 자동 결정 X**: 사용자 / 보안 / BE 답변 받기 전 확정 X
- **Draft 명시**: 헤더 / version `0.1.0-draft` / 파일명 `*-draft.yaml` — 확정 X
- **promote 안내**: 별도 라운드에서 `api-spec.yaml` 로 promote 명시
