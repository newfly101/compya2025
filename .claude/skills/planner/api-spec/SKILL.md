---
name: planner-api-spec
description: OpenAPI 3.x 형식 API 명세 작성 (REST). feature-spec 확정 후 호출. paths / components / schemas / security 정의. ★ HITL 3 — BE 팀 합의 필수 (endpoint / DTO / 권한). 산출물 docs/plan/{name}/api-spec.yaml.
---

# Skill: planner-api-spec

10년차 기획자 시점에서 **API 명세(API Specification)** 를 OpenAPI 3.x 형식 (YAML) 으로 작성한다.

> **OpenAPI 한 줄 풀이 (주니어 친화)**:
> "REST API 의 endpoint / 요청 / 응답 / 인증 / 에러를 표준 YAML 형식으로 정의하는 명세서. Swagger UI / Postman / 코드 생성 도구에서 그대로 사용 가능."

## 1. 목적

- 각 시나리오에 필요한 API endpoint 도출
- 요청 / 응답 DTO 정의 (schemas)
- 인증 / 권한 (security) 정의
- 에러 응답 표준화
- BE 팀과 합의 가능한 형식 산출

**산출물**: `docs/plan/{name}/api-spec.yaml`

## 2. 입력 (input)

- **선행 산출물**: `docs/plan/{name}/feature-spec.md` (필수)
  - (권장) `docs/plan/{name}/requirements.md`
  - (선택) `docs/plan/{name}/policy.md` (권한 / 데이터 정책 cite)
- **BE 팀 합의**: ★ HITL 3 필수 — endpoint / DTO / 권한 결정
- 호출 args:
  ```
  feature-spec-path: docs/plan/{name}/feature-spec.md
  requirements-path: docs/plan/{name}/requirements.md  # 선택
  ```

## 3. 절차 (steps)

### Step 1 — Feature-spec 로드
- 모든 SC (시나리오) 추출
- 각 시나리오의 When (행동) 에서 API 호출 추정

### Step 2 — Endpoint 도출 (초안)
- 시나리오별로 필요한 endpoint 추출:
  - 조회 → GET
  - 생성 → POST
  - 수정 → PUT / PATCH
  - 삭제 → DELETE
- 리소스 명사 우선 (예: `/coupons`, `/coupons/:id`, `/coupons/:id/use`)
- 동사 형식은 action endpoint (예: `/coupons/:id/use`) — 자원 추상화 어려운 경우만

### Step 3 — ★ HITL 3: BE 팀 합의
다음 항목을 BE 팀과 합의:
1. **Endpoint 경로** — REST 자원 명사 vs action endpoint
2. **HTTP Method** — POST vs PUT 등
3. **DTO 스키마** — request body / response body 필드 / 타입
4. **권한 정책** — 인증 필수? 권한 (user / admin) 분리?
5. **에러 코드** — 표준 (4xx / 5xx) + 도메인 에러 코드

합의 안 된 항목은 `# TBD` 주석으로 두고 명시.

### Step 4 — 스키마 / 보안 정의
- `components.schemas` 에 공통 모델 정의 (예: Coupon, User, ErrorResponse)
- `components.securitySchemes` 에 인증 방식 정의 (예: Bearer / Cookie / API Key)
- `components.responses` 에 표준 에러 응답 정의 (400 / 401 / 403 / 404 / 500)

### Step 5 — 산출물 Write (YAML)
- `docs/plan/{name}/api-spec.yaml` Write
- 유효한 OpenAPI 3.x 형식 (validation 가능한 수준)

### Step 6 — 다음 skill 안내
보고:
- 산출물 경로
- 정의된 endpoint 수
- TBD (BE 합의 미완) 항목 수
- 다음 skill: `planner-edge-cases`

## 4. 템플릿 (산출물)

```yaml
openapi: 3.0.3
info:
  title: "{도메인} API"
  version: "0.1.0"
  description: |
    {도메인} 의 REST API 명세.

    선행 문서:
    - docs/plan/{name}/feature-spec.md
    - docs/plan/{name}/requirements.md
    - (선택) docs/plan/{name}/policy.md

    ⚠ 본 문서는 BE 팀과 합의 후 확정된 내용이다. 합의 미완 항목은 # TBD 주석.

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
    get:
      tags: [coupons]
      summary: 쿠폰 목록 조회
      description: |
        로그인 사용자의 발급된 쿠폰 목록을 조회한다.
        대응 시나리오: SC-CPN-01, SC-CPN-03
      operationId: listCoupons
      security:
        - bearerAuth: []
      parameters:
        - in: query
          name: status
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
    get:
      tags: [coupons]
      summary: 쿠폰 상세 조회
      description: |
        쿠폰 ID 로 상세 정보 조회.
        대응 시나리오: SC-CPN-05, SC-CPN-07
      operationId: getCoupon
      security:
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
    post:
      tags: [coupons]
      summary: 쿠폰 사용 처리
      description: |
        쿠폰을 사용 처리한다 (action endpoint).
        대응 시나리오: SC-CPN-08
        멱등성: 동일 요청 N회 호출 시 1회만 처리 (Idempotency-Key 헤더 권장)
      operationId: useCoupon
      security:
        - bearerAuth: []
      parameters:
        - in: path
          name: id
          required: true
          schema:
            type: string
        - in: header
          name: Idempotency-Key
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
          type: string
          format: date-time
          nullable: true

    CouponListResponse:
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
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: |
        Authorization: Bearer {token} 헤더.
        ★ HITL 3 — BE 팀 합의 사항: cookie-based vs header bearer 결정.

# -------------------- 글로벌 보안 (선택) --------------------
# security:
#   - bearerAuth: []
```

## 5. 검증 (validation)

- [ ] 모든 시나리오 (SC-{ABBR}-NN) 가 ≥ 1 endpoint 와 매칭됨 (또는 "API 불필요" 명시)
- [ ] 각 endpoint summary / description / operationId 작성
- [ ] 각 endpoint 응답 200 / 4xx / 5xx 모두 정의
- [ ] schemas 의 공통 모델 정의 (Coupon / ErrorResponse 등)
- [ ] securitySchemes 정의 + 각 endpoint security 명시
- [ ] OpenAPI 3.x 형식 유효성 (swagger-cli validate 등으로 검증 가능한 수준)
- [ ] TBD 주석으로 BE 합의 미완 항목 명시

## 6. ★ HITL 지점 (필수)

**HITL 3 (강제)**:
- **시점**: Step 3 — BE 팀과 합의
- **무엇**:
  - Endpoint 경로 (REST 자원 vs action)
  - HTTP Method
  - DTO 스키마 (필드 / 타입 / required / nullable)
  - 권한 정책 (인증 / 권한)
  - 에러 코드 (도메인 에러 코드 명명 규칙)
  - 멱등성 처리 (Idempotency-Key 사용 여부)
- **누구**: BE 팀

미합의 항목은 `# TBD` 주석으로 두기. 자동 결정 금지.

## 7. 다음 skill 추천

- **표준**: `planner-edge-cases` (API 응답 / 에러 코드 → 예외 케이스 심화)
- **최종**: `planner-qa-checklist` (모든 산출물 종합)

## 8. 예시

### 짧은 예시
```
입력: feature-spec-path: docs/plan/coupons/feature-spec.md

시나리오 SC-CPN-01 (쿠폰 목록) → GET /coupons
시나리오 SC-CPN-05 (쿠폰 상세) → GET /coupons/{id}
시나리오 SC-CPN-08 (쿠폰 사용) → POST /coupons/{id}/use

★ HITL 3 BE 팀 합의 필요:
- 쿠폰 사용 endpoint = POST /coupons/{id}/use (action) vs PATCH /coupons/{id} (status 업데이트) ?
- Idempotency-Key 헤더 사용?
- 인증 = bearer JWT vs cookie session ?
- 도메인 에러 코드 prefix = COUPON_* vs ERR_COUPON_* ?
```

## 9. 작성 원칙 (주니어 친화)

- **YAML 주석 활용**: `# TBD` / `# 사유: ...` 형태로 결정 미완 / 사유 명시
- **operationId 일관성**: camelCase + 동사+명사 (listCoupons / getCoupon / useCoupon)
- **에러 응답 표준화**: `components.responses` 재사용 — endpoint 마다 같은 4xx 정의 X
- **example 포함**: 각 endpoint 응답 example 한 개 — 주니어가 응답 모양 즉시 이해
- **시나리오 cite**: description 에 "대응 시나리오: SC-{ABBR}-NN" 명시
- **★ HITL 3 우선**: BE 팀 합의 안 된 항목은 절대 자동 결정 X
