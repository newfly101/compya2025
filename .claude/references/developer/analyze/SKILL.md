---
name: developer-analyze
description: planner 산출물(prd/) + designer 산출물(design/) + 기존 코드 read → 도메인 작업의 cross-cutting 결정 사항 식별 + BE/FE 작업 후보 추출. 산출물 docs/domain/{feature}/develop/analysis.md (다음 skill developer-dispatch-plan 의 입력).
---

# Skill: developer-analyze

10년차 테크리드 시점에서 **기획 + 디자인 + 코드** 를 종합 분석한다. 이 skill 의 결과 = "BE/FE 가 무엇을 / 어떤 의존성으로 작업해야 하는가" 의 1차 정보.

## 1. 목적

- planner 산출물 (`prd/feature-spec.md`, `endpoint-spec-draft.md`, `policy-draft.md`, `qa-checklist.md`) 핵심 추출
- designer 산출물 (`design/implementation-handoff.md`, `design-report.md`) 핵심 추출
- 기존 코드 (`src/main/**`, `web/src/**`) 의 재사용 자산 / 신규 정의 영역 식별
- ★ cross-domain 결정 사항 식별 — endpoint 시그니처 / DTO / 권한 / cookie / 라우트 prefix
- ★ HITL 4분야 사전 식별 (권한 / 결제 / DB 파괴적 / 외부 시스템 통합)

**산출물**: `docs/domain/{feature}/develop/analysis.md`

## 2. 입력 (input)

### 필수
- 작업 단위 이름 (`{feature}`)
- planner 산출물 경로 (`docs/domain/{feature}/prd/`)

### 선택
- designer 산출물 경로 (`docs/domain/{feature}/design/`) — 화면 작업 있으면
- 기존 코드 디렉토리 (`src/main/java/com/dawne/com2usbaseball/{domain}/`, `web/src/domains/{domain}/`)
- 사용자 요구 자유 서술

### 호출 args 예시
```
feature: coupons-admin, prd-dir: docs/domain/coupons-admin/prd/, design-dir: docs/domain/coupons-admin/design/, code-be: src/main/java/com/dawne/com2usbaseball/domain/coupon/, code-fe: web/src/domains/coupons/
```

## 3. 절차 (steps)

### Step 1 — 입력 확인
- `feature` 필수. `prd-dir` 또는 `design-dir` 중 하나 이상 필수.
- 누락 시 사용자에게 즉시 질문 후 중단

### Step 2 — planner 산출물 read

`docs/domain/{feature}/prd/` 의 다음 우선순위:
- `feature-spec.md` ⭐ — 화면 분기 / 시나리오
- `endpoint-spec-draft.md` ⭐ — BE endpoint 시그니처
- `policy-draft.md` — 정책 (캐시 / 트랜잭션 / 권한)
- `qa-checklist.md` — 검증 항목

추출:
- 화면 list + 진입 경로
- BE endpoint list (URL / method / 권한 / DTO)
- 정책 결정 사항 (특히 권한 / DB)

### Step 3 — designer 산출물 read (있다면)

`docs/domain/{feature}/design/`:
- `implementation-handoff.md` ⭐ — 컴포넌트 트리 / 토큰 매핑 / 신규 글로벌 후보
- `design-report.md` — 디자인 결정 사유 / 마커

추출:
- 화면별 컴포넌트 트리
- 재사용 컴포넌트 / 신규 정의 필요
- 토큰 매핑 (Figma → SCSS)

### Step 4 — 기존 코드 read (있다면)

#### BE
- `src/main/java/com/dawne/com2usbaseball/domain/{domain}/` — 컨트롤러 / 서비스 / 매퍼
- `src/main/resources/mapper/{site,fun}/{domain}/` — XML
- `sql/V*/` — DB 스키마

#### FE
- `web/src/domains/{domain}/` — 페이지 / 컴포넌트 / store
- `web/src/global/` — 글로벌 컴포넌트 / 토큰
- `web/src/infra/` — http / api / analytics

추출:
- 재사용 가능 자산
- 신규 정의 필요 (글로벌 vs 도메인)
- 컨벤션 정합 (도메인 헤더 X / 컴포넌트 분해 최소화)

### Step 5 — cross-domain 결정 사항 합성

다음 항목 표로 정리:

| 항목 | BE | FE | 정합 / 결정 사항 | 마커 |
|---|---|---|---|---|
| URL prefix | `/api/admin/coupons` | 동일 호출 | 정합 | — |
| DTO 필드 | CouponRequest | form input | 시작일 필드 ❓ | ❓ |
| 권한 가드 | SecurityConfig + @PreAuthorize | 라우트 가드 | 이중 | — |
| cookie 정책 | HttpOnly + SameSite | refresh interceptor | 정합 | — |
| 에러 코드 | CouponMessages enum | 에러 메시지 처리 | mapping 필요 | 🟨 |

### Step 6 — HITL 4분야 사전 식별

| 분야 | 영향 | 마커 |
|---|---|---|
| 권한 / auth | (해당 / 없음) | 🔴 / — |
| 결제 | ... | ... |
| DB 파괴적 | ... | ... |
| 외부 시스템 통합 | ... | ... |

🔴 항목은 dispatch-plan / 코드 작성 전 사용자 답변 필수.

### Step 7 — BE 작업 후보 추출
- enum/messages 추가
- DTO 추가/변경
- mapper.xml + Mapper 인터페이스
- repository (분리 필요?)
- service interface + impl
- controller + SwaggerDocs
- DB 마이그 (필요 시)

### Step 8 — FE 작업 후보 추출
- 글로벌 컴포넌트 신규
- 도메인 페이지 / 컴포넌트
- store (api / endpoints / thunks / slices)
- 라우트 등록
- SCSS module

### Step 9 — 산출물 Write

`docs/domain/{feature}/develop/analysis.md` 에 Write. 부모 디렉토리 자동 생성 (Write tool).

### Step 10 — 다음 skill 안내

보고:
- 산출물 경로
- BE / FE 작업 후보 수
- HITL 4분야 마커 분포
- 다음 skill: `developer-dispatch-plan`

## 4. 템플릿 (산출물)

```markdown
# Develop Analysis — {feature}

> 작성일: YYYY-MM-DD
> planner: docs/domain/{feature}/prd/...
> designer: docs/domain/{feature}/design/...
> 코드 baseline: src/main/.../{domain}/, web/src/domains/{domain}/

## 1. 입력 산출물 요약

### planner (prd/)
- 화면 N개: ...
- BE endpoint M개: ...
- 정책 결정: ...

### designer (design/)
- 화면별 컴포넌트 트리 요약
- 신규 글로벌 컴포넌트 후보: ...
- 디자인 토큰 매핑: ...

### 기존 코드
- BE 재사용 자산: ...
- FE 재사용 자산: ...

## 2. cross-domain 결정 사항

| 항목 | BE | FE | 정합 / 결정 | 마커 |
|---|---|---|---|---|
| ... | ... | ... | ... | ... |

## 3. HITL 4분야 사전 식별

- 권한 / auth: (없음 / 🔴 ...)
- 결제: ...
- DB 파괴적: ...
- 외부 시스템 통합: ...

## 4. BE 작업 후보

| ID | 영역 | 작업 | 의존성 |
|---|---|---|---|
| BE-1 | enum/messages | CouponMessages 추가 | — |
| BE-2 | DTO | CouponRequest 필드 추가 | — |
| ... | ... | ... | ... |

## 5. FE 작업 후보

| ID | 영역 | 작업 | 의존성 |
|---|---|---|---|
| FE-1 | global ui | <AdminListLayout> | — |
| FE-2 | domain | AdminCouponListPage | FE-1 |
| ... | ... | ... | ... |

## 6. 사용자 확인 필요 항목

- [ ] 🔴 ...
- [ ] 🟨 ...
- [ ] ❓ ...

## 7. 다음 단계

- [ ] developer-dispatch-plan skill — BE/FE 작업 단위 분배 plan 작성
```

## 5. 검증

- [ ] planner 산출물 요약 (있다면)
- [ ] designer 산출물 요약 (있다면)
- [ ] cross-domain 결정 표 (≥ 1 항목)
- [ ] HITL 4분야 사전 식별 (모든 분야 명시 — 없으면 "없음")
- [ ] BE / FE 작업 후보 (각 ≥ 0)
- [ ] 사용자 확인 필요 항목 §

## 6. HITL 정책

### 강제 HITL (자동 진행 금지)
- 권한 / 결제 / DB 파괴적 / 외부 시스템 통합 — 🔴 마커. 다음 skill (`developer-dispatch-plan`) 진행 전 사용자 답변 필수.

### 완화 HITL
- 일반 결정 — 🟨 가정 / ❓ 미정 마커 표시 후 진행

## 7. 다음 skill 추천

- **표준**: `developer-dispatch-plan` — analysis.md 토대로 작업 단위 분배

## 8. 작성 원칙

- **사실 baseline 우선** — 코드 / 산출물과 모순되는 추측 금지
- **cross-domain 우선** — 단일 영역 결정도 cross 영향 검토
- **HITL 4분야 사전 식별** — sub-agent dispatch 전 차단
- **표 우선** — 가독성
- **주니어 친화** — 결정 사유 명시
