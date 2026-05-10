---
name: developer-dispatch-plan
description: developer-analyze 결과(analysis.md) 토대로 BE/FE 작업 단위 분배 + 의존성 그래프 + 작업 영역 negative 룰 정리. 메인 어시스턴트가 backend-developer / frontend-developer sub-agent 를 dispatch 할 때 사용할 plan. 산출물 docs/domain/{feature}/develop/dispatch-plan.md.
---

# Skill: developer-dispatch-plan

`developer-analyze` 의 결과 토대로 **BE/FE sub-agent 가 정확히 무엇을 / 어떤 영역에서 / 어떤 의존성으로** 작업해야 하는지 정리한다. 메인 어시스턴트가 이 plan 을 보고 sub-agent dispatch.

## 1. 목적

- BE 작업 단위 분해 (controller → service → mapper → SQL 순)
- FE 작업 단위 분해 (글로벌 → 도메인 → store → 라우트 순)
- 작업 간 의존성 그래프 (병렬 가능 / 순차 필요)
- ★ sub-agent 별 작업 영역 명시 (절대 금지 영역 negative 룰)
- ★ HITL 4분야 미해결 항목 — sub-agent dispatch 전 사용자 답변 강제

**산출물**: `docs/domain/{feature}/develop/dispatch-plan.md`

## 2. 입력 (input)

### 필수
- 작업 단위 이름 (`{feature}`)
- analysis.md 경로 (`docs/domain/{feature}/develop/analysis.md`)

### 선택
- 사용자 결정 사항 (HITL 🔴 답변 등)

### 호출 args 예시
```
feature: coupons-admin, analysis: docs/domain/coupons-admin/develop/analysis.md
```

## 3. 절차

### Step 1 — 입력 확인
- `feature`, `analysis` 필수. 누락 시 중단.

### Step 2 — analysis.md read
- BE/FE 작업 후보 list
- cross-domain 결정 사항
- HITL 4분야 (특히 🔴)

### Step 3 — HITL 검증
- 🔴 항목 미해결 시 → **dispatch-plan 작성하되 dispatch 권고 라인은 "사용자 답변 후 진행" 명시**

### Step 4 — BE 작업 단위 분해

순서 권고:
1. enum/messages (의존성 없음)
2. DTO (record + Bean Validation)
3. Entity (필요 시)
4. Mapper (interface + xml)
5. Repository (public/admin 분리 if 권한 분리)
6. Service interface + Impl
7. Controller + SwaggerDocs
8. DB 마이그 SQL (있다면)
9. 빌드 검증
10. commit (트랙별 분리)

각 단계의 의존성 / 영역 / sub-skill 표시.

### Step 5 — FE 작업 단위 분해

순서 권고:
1. 글로벌 컴포넌트 신규 (`web/src/global/ui/`)
2. 도메인 컴포넌트 (`web/src/domains/{domain}/...`)
3. store (api / endpoints / thunks / slices)
4. 라우트 등록 (`web/src/app/router/`)
5. SCSS module
6. 빌드 검증
7. commit

### Step 6 — 의존성 그래프

병렬 가능 / 순차 필요 정리:
- BE-1, BE-2 병렬 가능
- BE-3 은 BE-2 의존
- FE 작업은 endpoint-spec 합의 후 BE 와 병렬 가능
- BE controller 완료 → FE 통합 테스트

### Step 7 — sub-agent 별 작업 영역 (negative 룰)

| sub-agent | 허용 | 절대 금지 |
|---|---|---|
| backend-developer | `src/main/java/.../{domain}/`, `src/main/resources/mapper/{site,fun}/{domain}/`, `sql/V*/` | `web/src/**`, `figma-plugin/**` |
| frontend-developer | `web/src/domains/{domain}/`, `web/src/global/ui/`, `web/src/app/router/`, `web/src/infra/` (정합 필요 시) | `src/main/**`, `sql/**`, `figma-plugin/**` |

### Step 8 — dispatch 권고 (메인 어시스턴트용)

순서 + brief 핵심:
1. backend-developer dispatch — brief 에 포함:
   - 작업 단위 (BE 표)
   - 작업 영역 (허용 + 절대 금지)
   - 입력 산출물 (`endpoint-spec-draft.md`, `policy-draft.md`)
   - HITL 4분야 (🔴 답변 결과)
2. frontend-developer dispatch — brief 에 포함:
   - 작업 단위 (FE 표)
   - 작업 영역
   - 입력 산출물 (`implementation-handoff.md`)
   - HITL 4분야
3. 양쪽 완료 후 → developer-integrate-review skill 호출

### Step 9 — 산출물 Write

`docs/domain/{feature}/develop/dispatch-plan.md` 에 Write.

### Step 10 — 다음 skill 안내

- BE/FE 작업 완료 후 → `developer-integrate-review`

## 4. 템플릿 (산출물)

```markdown
# Dispatch Plan — {feature}

> 작성일: YYYY-MM-DD
> 입력: docs/domain/{feature}/develop/analysis.md

## 1. cross-domain 결정 사항 (재명시)

(analysis.md 의 핵심 표 재인용)

## 2. BE 작업 단위

| ID | 영역 | 작업 | 의존성 | 비고 |
|---|---|---|---|---|
| BE-1 | enum/messages | CouponMessages 추가 | — | — |
| BE-2 | DTO | CouponRequest 추가 | — | Bean Validation 포함 |
| BE-3 | mapper.xml | INSERT/UPDATE | BE-2 | namespace FQN 정합 |
| BE-4 | service | createCoupon | BE-1, BE-2, BE-3 | @Transactional + @CacheEvictAfterCommit |
| BE-5 | controller | POST /api/admin/coupons | BE-4 | @PreAuthorize ROLE_ADMIN |
| BE-6 | sql/V*/ | DB 마이그 (있다면) | — | 🔴 if DB 파괴적 |

## 3. FE 작업 단위

| ID | 영역 | 작업 | 의존성 | 비고 |
|---|---|---|---|---|
| FE-1 | global ui | `<AdminListLayout>` | — | web/src/global/ui/admin/ |
| FE-2 | domain | AdminCouponListPage | FE-1 | web/src/domains/coupons/admin/ |
| FE-3 | store | admin/thunks 갱신 | — | endpoint-spec 매핑 |
| FE-4 | route | /admin/coupons 등록 | FE-2, FE-3 | web/src/app/router/ |

## 4. 의존성 그래프

```
BE-1, BE-2 (병렬)
  ↓
BE-3 → BE-4 → BE-5
        ↓ (controller spec 합의 후)
BE-5 ↔ FE-3 (api 호출 정합)

FE-1 → FE-2
       ↓
FE-3 → FE-4
```

병렬 가능: BE 작업 ↔ FE 작업 (endpoint spec 합의 후)
순차 필요: BE controller 완료 → FE 통합 테스트

## 5. sub-agent 별 작업 영역

| sub-agent | 허용 | 절대 금지 |
|---|---|---|
| backend-developer | src/main/java/.../{domain}/, src/main/resources/mapper/.../{domain}/, sql/V*/ | web/src/**, figma-plugin/** |
| frontend-developer | web/src/domains/{domain}/, web/src/global/ui/, web/src/app/router/ | src/main/**, sql/**, figma-plugin/** |

## 6. HITL 4분야 (재명시 — analysis.md 의 🔴 항목)

- [ ] 🔴 ... (사용자 답변 필요)
- [ ] 답변 완료 항목: ...

🔴 미해결 시 dispatch 권고 보류.

## 7. dispatch 권고 (메인 어시스턴트용)

### 7.1 backend-developer dispatch
- brief 에 포함: BE 작업 단위 (BE-1 ~ BE-6) / 작업 영역 / endpoint-spec-draft.md, policy-draft.md / HITL 답변 결과
- 절대 금지: web/src/**

### 7.2 frontend-developer dispatch (병렬)
- brief 에 포함: FE 작업 단위 (FE-1 ~ FE-4) / 작업 영역 / implementation-handoff.md / HITL 답변 결과
- 절대 금지: src/main/**, sql/**

### 7.3 통합 검증
- 양쪽 완료 후 → `developer-integrate-review` skill 호출

## 8. 다음 단계

- [ ] (HITL 🔴 미해결 시) 사용자 답변 수집
- [ ] backend-developer + frontend-developer 병렬 dispatch
- [ ] developer-integrate-review (완료 후)
```

## 5. 검증

- [ ] BE 작업 단위 표 (≥ 1)
- [ ] FE 작업 단위 표 (≥ 1)
- [ ] 의존성 그래프
- [ ] sub-agent 별 작업 영역 (허용 + 절대 금지)
- [ ] HITL 4분야 재명시
- [ ] dispatch 권고 (메인 어시스턴트 향)

## 6. HITL 정책

- 🔴 4분야 미해결 → dispatch 권고 라인에 "사용자 답변 후 진행" 명시. dispatch-plan 작성 자체는 진행 OK.
- 🟨 / ❓ 항목 → plan 안 명시 후 진행

## 7. 다음 skill 추천

- BE/FE 작업 완료 후 → `developer-integrate-review`

## 8. 작성 원칙

- **negative 룰 명확** — sub-agent 가 영역 밖 손대지 않도록 brief 에 절대 금지 영역 명시
- **의존성 정확** — 병렬 가능 / 순차 필요 분리
- **HITL 4분야 우선** — 🔴 미해결 항목은 dispatch 보류
- **표 우선**
