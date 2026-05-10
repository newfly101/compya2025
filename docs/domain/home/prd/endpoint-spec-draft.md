# home 도메인 endpoint 명세 (Draft)

> **확정 X — Draft**. BE 합의 후 `endpoint-spec.md` 로 promote.
> **모드**: reverse engineering
> **중요**: home 도메인은 **자체 API 호출 없음**. 외부 도메인 hook contract 만 의존.
> **작성일**: 2026-05-11

---

## 1. home 도메인 직접 endpoint

**없음** — home 페이지는 외부 도메인 hook 만 사용한다.

(이유: home 은 "얇은 합성형" 페이지. 자체 API client / store 없음.)

## 2. 외부 도메인 hook contract (home 이 사용하는 것만)

home 도메인이 호출하는 외부 hook 의 **반환 형태** 매핑. 실제 endpoint 정의는 각 도메인 prd 에 있다.

### 2.1 `useCouponList()` — coupons 도메인

| 항목 | 값 | 마커 |
|---|---|---|
| 위치 | `@/domains/coupons/mobile/hooks/useCouponList.js` | — |
| 호출 위치 | `HomeScreen.jsx` (useCouponList hook 호출) | — |
| home 사용 필드 | `activeCoupon` | — |
| 추정 backend endpoint | (coupons 도메인 prd 참조) | 🟨 **가정** — home 범위 외 |
| home 책임 | `activeCoupon` 을 `CouponListHorizontal` 에 prop 으로 전달 | — |

### 2.2 `useEventList()` — events 도메인

| 항목 | 값 | 마커 |
|---|---|---|
| 위치 | `@/domains/events/mobile/hooks/useEventList.js` | — |
| 호출 위치 | `HomeScreen.jsx` | — |
| home 사용 필드 | `activeEvents` | — |
| 추정 backend endpoint | (events 도메인 prd 참조) | 🟨 **가정** — home 범위 외 |
| home 책임 | `activeEvents` 을 `EventListHorizontal` 에 prop 으로 전달 | — |

### 2.3 `useNoticeList()` — notices 도메인

| 항목 | 값 | 마커 |
|---|---|---|
| 위치 | `@/domains/notices/mobile/hooks/useNoticeList.js` | — |
| 호출 위치 | `NoticeSection.jsx` | — |
| home 사용 필드 | `siteNotices: Array<{id, title, summary, publishedAt}>` | — |
| 추정 backend endpoint | (notices 도메인 prd 참조) | 🟨 **가정** — home 범위 외 |
| home 책임 | `siteNotices.slice(0, 3)` 만 dot-list 로 렌더 | — |

### 2.4 `requestLatestQuizAnswer` thunk — quiz 도메인

| 항목 | 값 | 마커 |
|---|---|---|
| 위치 | `@/domains/quiz/store/public/thunks.js` | — |
| 호출 위치 | `HomeScreen.jsx` (useEffect 1회 dispatch) | — |
| 결과 store path | `state.quiz.latest` | — |
| home 사용 필드 | `{title?, round?, imageUrl?}` | — |
| 추정 backend endpoint | (quiz 도메인 prd 참조) | 🟨 **가정** — home 범위 외 |
| home 책임 | dispatch 1회 + selector 로 latest 읽기 | — |

## 3. home 책임 vs 외부 책임 경계

| 책임 | home | 외부 도메인 |
|---|---|---|
| API endpoint 정의 | X | O |
| API 호출 (axios / fetch) | X | O |
| store / cache 관리 | X | O |
| 데이터 정렬 / 필터 (기본) | X | O |
| empty / loading / error 분기 | △ (Quiz / Notice 만 home 책임) | O (Coupon / Event) |
| UI 렌더 (home 섹션 한정) | O | △ (Horizontal container 만) |

## 4. 데이터 흐름

```
[페이지 진입]
    ↓
HomeScreen 마운트
    ↓
    ├─ useCouponList()  → 자동 fetch (coupons store)
    ├─ useEventList()   → 자동 fetch (events store)
    └─ useEffect 1회: dispatch(requestLatestQuizAnswer())  → quiz store
    ↓
NoticeSection 마운트
    └─ useNoticeList()  → 자동 fetch (notices store)
    ↓
각 hook 반환값 → home 의 섹션에 render prop / children 전달
```

🟨 **가정**: `useCouponList` / `useEventList` / `useNoticeList` 는 호출 시 자동 fetch 트리거 한다고 추정 — 각 도메인 prd 에서 확인 필요.

## 5. 권한 / Auth 정책 (home 범위)

| 항목 | 값 | 마커 |
|---|---|---|
| home 페이지 자체 | public (로그인 불필요) | 🟨 **가정** — auth guard 코드 없음 |
| 외부 hook 호출 시 토큰 | 각 도메인 hook 자체 처리 | — |
| 권한 강제 HITL 필요 분야 | **없음** (home 책임 0건) | 🔴 → ✓ 해당 없음 |

## 6. BE 합의 필요 항목 (promote 전)

home 도메인 자체로는 BE 합의 사항 없음. 다만 다음 외부 도메인 endpoint 가 home 정상 작동의 전제:

| 외부 endpoint | home 의존도 | promote 전 확인 |
|---|---|---|
| coupons 활성 목록 조회 | 최신 쿠폰 섹션 | coupons 도메인 prd |
| events 활성 목록 조회 | 진행 중 이벤트 섹션 | events 도메인 prd |
| notices 사이트 공지 조회 | 공지사항 섹션 | notices 도메인 prd |
| quiz 최신 정답 조회 | Quiz 섹션 | quiz 도메인 prd |

## 7. 사용자 확인 필요 항목

- 🟨 **가정** §5 home public 접근 — auth guard 없음 의도 확인
- 🟨 **가정** §4 hook 호출 시 자동 fetch 트리거 — 각 도메인 hook 동작 검증 필요
- ❓ **미정** §6 외부 endpoint 4건 정합성 — 각 도메인 prd 작성 후 cross-check 필요

## 8. promote 절차

이 Draft 는 다음 단계로 promote:
1. 외부 도메인 (coupons / events / notices / quiz) endpoint spec 합의 완료
2. 위 ❓ **미정** / 🟨 **가정** 검토
3. promote 시 본 문서는 외부 도메인 endpoint 의 home 의존성 매핑 (cross-ref) 만 남김
