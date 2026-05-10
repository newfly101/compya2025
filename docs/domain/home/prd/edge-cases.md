# home 도메인 예외 케이스 (Edge Cases)

> **모드**: reverse engineering
> **선행 산출물**: `feature-spec.md` + `endpoint-spec-draft.md` + `policy-draft.md`
> **작성일**: 2026-05-11

---

## 1. 예외 케이스 ID 체계

`EC-HOME-{영역}-{번호}` — 영역별 분류

## 2. Quiz 섹션 예외

| ID | 케이스 | 현재 동작 | 권고 (기획자 의견) | 마커 |
|---|---|---|---|---|
| EC-HOME-QUIZ-01 | `state.quiz.latest` 가 null | `??` 로 null 처리 → empty placeholder + title=`컴프야 퀴즈 정답` | OK | 확정 |
| EC-HOME-QUIZ-02 | `imageUrl` 만 null | empty placeholder | OK | 확정 |
| EC-HOME-QUIZ-03 | `imageUrl` 깨진 URL | `<img>` broken icon (브라우저 기본) | onError fallback 검토 | ❓ **미정** |
| EC-HOME-QUIZ-04 | `requestLatestQuizAnswer` thunk 실패 | 에러 무시 (UI 변화 없음, 콘솔만) | toast / 섹션 hide 검토 | ❓ **미정** |
| EC-HOME-QUIZ-05 | thunk pending 상태 (느린 네트워크) | empty placeholder 표시 (loading UI 없음) | skeleton 검토 | 🟨 **가정** — 의도된 단순화 |
| EC-HOME-QUIZ-06 | `title` 과 `round` 모두 있을 때 | `title` 우선 (코드: `??` 단락 평가) | OK | 확정 |
| EC-HOME-QUIZ-07 | 페이지 재진입 시 stale `latest` 표시 | `useEffect [dispatch]` 로 매번 dispatch — re-fetch 수행 | OK | 확정 |

## 3. Quick 섹션 (퀵메뉴) 예외

| ID | 케이스 | 현재 동작 | 권고 | 마커 |
|---|---|---|---|---|
| EC-HOME-QUICK-01 | `QUICK_MENUS` 빈 배열 | 빈 그리드 (잔여 없음) | placeholder 검토 (실제 상황 발생 X) | 🟨 **가정** |
| EC-HOME-QUICK-02 | comingSoon 메뉴 빠르게 연타 | 모달 setState 중복 → 단일 모달 유지 (`useState` boolean) | OK | 확정 |
| EC-HOME-QUICK-03 | navigate 후 뒤로가기 → 모달 상태 | 모달 컴포넌트 unmount → 재진입 시 closed | OK | 확정 |
| EC-HOME-QUICK-04 | comingSoon 메뉴 키보드 enter | `<Link>` onClick 으로 차단 — 동일 동작 | 🟨 **가정** — 키보드 / 접근성 검증 필요 | 🟨 |
| EC-HOME-QUICK-05 | `to` 경로가 정의되지 않은 라우트 | 404 페이지 이동 | 라우터 fallback 정책 따름 | 🟨 |
| EC-HOME-QUICK-06 | label `\n` 없는 단일 라인 메뉴 | CSS `white-space: pre-line` 가정 — 단일 라인 정상 표시 | 🟨 — CSS 미확인 | 🟨 |

## 4. Notice 섹션 예외

| ID | 케이스 | 현재 동작 | 권고 | 마커 |
|---|---|---|---|---|
| EC-HOME-NOTICE-01 | `siteNotices` 빈 배열 | 빈 `<ul>` (잔여 0) | "공지사항이 없습니다" placeholder 검토 | ❓ **미정** |
| EC-HOME-NOTICE-02 | `siteNotices` null / undefined | 런타임 에러 가능 (slice 호출 실패) | `?? []` 방어 필요 | 🟨 **가정** — hook contract 검증 |
| EC-HOME-NOTICE-03 | 공지 1~2건만 존재 | slice 가 사용 가능 건수만 반환 → 정상 | OK | 확정 |
| EC-HOME-NOTICE-04 | `publishedAt` null | `notice?.publishedAt?.slice(0,10)` 옵셔널 → undefined → 빈 텍스트 | OK | 확정 |
| EC-HOME-NOTICE-05 | `summary` null | `<span>` 빈 텍스트 | OK | 확정 |
| EC-HOME-NOTICE-06 | 같은 id 공지 중복 | React `key` warning + 정상 렌더 | hook 측 dedupe 가정 | 🟨 |
| EC-HOME-NOTICE-07 | 공지 클릭 → 상세 페이지 미존재 | 404 | 🟨 — notices 도메인 책임 | 🟨 |

## 5. Coupon / Event 섹션 예외 (외부 위임)

home 책임은 `useCouponList().activeCoupon` / `useEventList().activeEvents` 를 그대로 컴포넌트에 prop 전달뿐. 예외 분기는 외부 도메인 책임.

| ID | 케이스 | home 영향 | 처리 위임 |
|---|---|---|---|
| EC-HOME-COUPON-01 | activeCoupon 빈 배열 | 빈 horizontal 표시 (외부 정책) | coupons 도메인 |
| EC-HOME-COUPON-02 | useCouponList fetch 실패 | home 알 수 없음 (자체 에러 게이트 X) | coupons 도메인 |
| EC-HOME-COUPON-03 | activeCoupon undefined | 외부 hook 책임 (기본값 보장 가정) | coupons 도메인 |
| EC-HOME-EVENT-01 | activeEvents 빈 배열 | 빈 horizontal 표시 (외부 정책) | events 도메인 |
| EC-HOME-EVENT-02 | useEventList fetch 실패 | home 알 수 없음 | events 도메인 |

🟨 **가정**: 외부 도메인 hook 이 fetch 실패 시 빈 배열 반환 / 자체 에러 UI 처리. home 은 보호 코드 없이 prop 전달.

## 6. 페이지 레벨 예외

| ID | 케이스 | 현재 동작 | 권고 | 마커 |
|---|---|---|---|---|
| EC-HOME-PAGE-01 | 4개 hook (coupon/event/notice/quiz) 동시 실패 | 페이지는 정상 렌더 (각 섹션 빈/empty 상태) | OK — 의도된 분산 분기 | 🟨 |
| EC-HOME-PAGE-02 | 페이지 진입 시 redux store 미초기화 | `state.quiz?.latest` 옵셔널 → null 처리 OK | OK | 확정 |
| EC-HOME-PAGE-03 | 페이지 매우 빠른 unmount (네비) | useEffect cleanup 없음 — 진행 중 thunk 결과는 store 에 적재 (메모리 누수 X) | OK | 확정 |
| EC-HOME-PAGE-04 | 모바일 → 데스크탑 viewport 전환 | MobileLayout 만 가정 — 데스크탑 라우팅 별도 | 🟨 — 데스크탑 home 미구현 | 🟨 |
| EC-HOME-PAGE-05 | 비로그인 사용자가 진입 | 정상 렌더 (auth guard 없음) | ❓ — 의도 확인 | ❓ |

## 7. 디자인 토큰 / UI 예외

| ID | 케이스 | 현재 동작 | 권고 | 마커 |
|---|---|---|---|---|
| EC-HOME-UI-01 | Hero.heroBadge `#fff` 토큰화 누락 | hardcoded color 존재 | 토큰화 (`--color-text-primary-inverse` 등) | ❓ |
| EC-HOME-UI-02 | 매우 긴 공지 title (truncate) | CSS ellipsis 가정 | scss 검증 필요 | 🟨 |
| EC-HOME-UI-03 | RTL 언어 / 다국어 | 한글 정적 — 미지원 | 범위 외 | — |

## 8. dead code 관련 위험

| ID | 케이스 | 현재 동작 | 권고 | 마커 |
|---|---|---|---|---|
| EC-HOME-DEAD-01 | `MOCK_QUIZ.js` 변경 시 home 영향 | dead — 영향 0 | 제거 권고 | 🟨 |
| EC-HOME-DEAD-02 | `MOCK_POSTS.js` / `MOCK_TEAM_POSTS.js` 영향 | dead — community 주석 | 제거 권고 | 🟨 |
| EC-HOME-DEAD-03 | `.sep` / `.postRowList` style 영향 | 미사용 — 영향 0 | 제거 권고 | 🟨 |
| EC-HOME-DEAD-04 | 주석 community 섹션 → 미래 재활성화 | community IA 재개 후 처리 | 🟨 | 🟨 |

## 9. 사용자 확인 필요 항목

- ❓ **미정** EC-HOME-QUIZ-03 broken image fallback
- ❓ **미정** EC-HOME-QUIZ-04 thunk 실패 시 toast / 섹션 hide
- ❓ **미정** EC-HOME-NOTICE-01 빈 배열 placeholder
- 🟨 **가정** EC-HOME-NOTICE-02 hook null safety — 방어 코드 추가 권고
- ❓ **미정** EC-HOME-PAGE-05 비로그인 접근 정책
- ❓ **미정** EC-HOME-UI-01 heroBadge 토큰화
- 🟨 **가정** EC-HOME-COUPON/EVENT 외부 도메인 에러 처리 — 위임 정합 검증
