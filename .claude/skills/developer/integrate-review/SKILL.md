---
name: developer-integrate-review
description: backend-developer / frontend-developer sub-agent 의 작업 결과를 cross-domain 정합 검증. endpoint 시그니처 ↔ FE API 호출 / DTO ↔ form / 권한 ↔ 라우트가드 / cookie / 에러 코드. 산출물 docs/domain/{feature}/develop/integrate-review.md.
---

# Skill: developer-integrate-review

BE/FE 양쪽 작업이 끝난 후 **cross-domain 정합** 을 검증한다. 단일 영역 빌드는 sub-agent 가 통과시켰지만, 양쪽이 합쳐졌을 때 mismatch 가 없는지 확인하는 단계.

## 1. 목적

- endpoint 시그니처 (BE) ↔ API 호출 (FE) 정합
- DTO 필드 ↔ form input / response 사용 정합
- 권한 가드 (BE @PreAuthorize) ↔ 라우트 가드 (FE) 정합
- cookie / auth 정책 (HttpOnly / Secure / SameSite / domain) 정합
- 에러 코드 (BE Messages enum) ↔ FE 에러 메시지 처리 정합
- 빌드 양쪽 PASS 확인

**산출물**: `docs/domain/{feature}/develop/integrate-review.md`

## 2. 입력 (input)

### 필수
- 작업 단위 이름 (`{feature}`)
- BE / FE commit hash (또는 변경 파일 list — 메인 어시스턴트가 전달)

### 선택
- dispatch-plan.md 경로 (참조용 — 작업 단위와 실제 결과 비교)

### 호출 args 예시
```
feature: coupons-admin, be-commit: abc1234, fe-commit: def5678, dispatch-plan: docs/domain/coupons-admin/develop/dispatch-plan.md
```

## 3. 절차

### Step 1 — 입력 확인
- `feature` 필수. commit 또는 변경 파일 list 중 하나 이상 필수.
- 누락 시 중단

### Step 2 — BE 변경 영역 read

- `git show --stat {be-commit}` 또는 변경 파일 list 로 영역 식별
- controller / service / mapper / SQL 변경 read

### Step 3 — FE 변경 영역 read

- `git show --stat {fe-commit}` 또는 변경 파일 list
- 컴포넌트 / store / 라우트 변경 read

### Step 4 — cross-domain 정합 검증

5가지 영역 표로:

#### 4.1 Endpoint 시그니처

| BE 정의 | FE 호출 | 정합 |
|---|---|---|
| `POST /api/admin/coupons` | `api.post('/api/admin/coupons')` | ✅ |
| `PATCH /api/admin/coupons/{id}` | `api.patch(\`/api/admin/coupons/${id}\`)` | ✅/❌ |

#### 4.2 DTO 필드

| 항목 | BE (record) | FE (form) | 정합 |
|---|---|---|---|
| `couponCode` | `String couponCode` | `formData.couponCode` | ✅ |
| `expireAt` | `LocalDateTime expireAt` (yyyy-MM-dd HH:mm) | `<input type="datetime-local">` | format 정합 ⚠️ |

#### 4.3 권한 가드

| endpoint | BE 가드 | FE 라우트 가드 | 정합 |
|---|---|---|---|
| `/api/admin/coupons` | SecurityConfig + @PreAuthorize ROLE_ADMIN | `<AdminGuard>` 안 라우트 | ✅ |

#### 4.4 cookie / auth 정책

| 항목 | BE | FE | 정합 |
|---|---|---|---|
| ACCESS_TOKEN | HttpOnly + Secure + SameSite | `withCredentials: true` | ✅ |
| REFRESH_TOKEN path | `/api/auth` | refresh 호출 path | ✅ |

#### 4.5 에러 코드

| BE Messages | FE 처리 | 정합 |
|---|---|---|
| `COUPON_CODE_DUPLICATED` (409) | `error.code === 'COUPON_CODE_DUPLICATED'` 분기 | ✅/❌ |
| `COUPON_NOT_FOUND` (404) | 동일 처리 | ✅ |

### Step 5 — 빌드 / 실행 검증

- BE: `./gradlew compileJava` 결과 확인 (이미 sub-agent 가 PASS, 재확인)
- FE: `npm run build` (web/) 결과 확인 또는 dev 실행 가능 상태
- 통합 테스트는 본 skill 외 (qa-runner agent — 향후)

### Step 6 — mismatch 정리

발견된 mismatch 를 표로:

| 영역 | BE | FE | 권고 | 우선순위 |
|---|---|---|---|---|
| ... | ... | ... | ... | P0/P1/P2 |

### Step 7 — 권고 액션

- BE 보강: ...
- FE 보강: ...
- 정책 결정: ...

### Step 8 — 산출물 Write

`docs/domain/{feature}/develop/integrate-review.md` 에 Write.

### Step 9 — 메인 어시스턴트 보고

- 정합 ✅ / ❌ 결과 요약
- mismatch 우선순위
- 다음 액션 (BE/FE 재dispatch / 정책 결정 / 통과)

## 4. 템플릿 (산출물)

```markdown
# Integrate Review — {feature}

> 작성일: YYYY-MM-DD
> BE commit: {hash} ({N} files)
> FE commit: {hash} ({M} files)
> dispatch-plan: docs/domain/{feature}/develop/dispatch-plan.md

## 1. 변경 영역 요약

### BE
- {commit hash} — controller / service / mapper / SQL 변경
- 변경 파일 list (간단)

### FE
- {commit hash} — 컴포넌트 / store / 라우트 변경

## 2. cross-domain 정합 검증

### 2.1 Endpoint 시그니처
| BE 정의 | FE 호출 | 정합 |
|---|---|---|
| ... | ... | ✅/❌ |

### 2.2 DTO 필드
### 2.3 권한 가드
### 2.4 cookie / auth 정책
### 2.5 에러 코드

## 3. 빌드 / 실행 결과

- BE: ./gradlew compileJava → PASS / FAIL
- FE: npm run build → PASS / FAIL

## 4. 발견된 mismatch

| 영역 | BE | FE | 권고 | 우선순위 |
|---|---|---|---|---|
| ... | ... | ... | ... | P0 |

## 5. 권고 액션

### BE 보강
- ...

### FE 보강
- ...

### 정책 결정 사안
- ...

## 6. 결론

- [ ] 통과 — 다음 단계 진행 가능 (qa / commit 정리)
- [ ] mismatch — 재dispatch 필요
- [ ] 정책 결정 대기

## 7. 다음 단계
```

## 5. 검증

- [ ] BE / FE 변경 영역 read
- [ ] 5가지 cross-domain 정합 표 (endpoint / DTO / 권한 / cookie / 에러)
- [ ] 빌드 결과 확인
- [ ] mismatch 정리 (없으면 "없음" 명시)
- [ ] 권고 액션
- [ ] 결론 (통과 / 재dispatch / 정책 결정 대기)

## 6. HITL 정책

- 발견된 mismatch 가 HITL 4분야 (권한 / 결제 / DB 파괴적 / 외부 시스템) 영향 → 🔴 마커 + 사용자 답변 필요
- 일반 mismatch → 🟨 가정 / ❓ 미정 마커 + 권고 액션 명시

## 7. 다음 skill 추천

- 통과 → (선택) qa-runner agent / 또는 commit 통합 정리
- mismatch → BE/FE 재dispatch (메인 어시스턴트에 권고)

## 8. 작성 원칙

- **5가지 정합 영역 모두 검증** — 빠뜨리지 말 것
- **사실 baseline 우선** — 변경 파일 / 코드 기준
- **표 우선** — 가독성
- **권고는 구체적으로** — "보강" 만 X, "어느 파일 어느 라인" 명시
