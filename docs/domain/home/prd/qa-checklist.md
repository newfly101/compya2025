# home 도메인 QA 체크리스트

> **모드**: reverse engineering
> **선행 산출물**: `ia.md` + `requirements.md` + `policy-draft.md` + `feature-spec.md` + `endpoint-spec-draft.md` + `edge-cases.md`
> **목적**: 주니어 개발자 / QA 가 한 번에 따라할 수 있는 확인 체크리스트
> **작성일**: 2026-05-11

---

## 1. 사전 준비

- [ ] 로컬 / 스테이징 환경에서 모바일 뷰포트 (375x812 권장) 접속
- [ ] 외부 도메인 (coupons / events / notices / quiz) BE / DB 정상 동작 확인
- [ ] 콘솔 / 네트워크 탭 열고 진행

## 2. 페이지 진입 / 글로벌 (GLOBAL)

| ID | 항목 | PASS 조건 | 결과 |
|---|---|---|---|
| QA-G-01 | `/` 진입 | HomeScreen 렌더 / 6 섹션 순서대로 표시 | [ ] |
| QA-G-02 | TopBar variant | `home` variant 로 표시 | [ ] |
| QA-G-03 | 페이지 title | `컴프야펀 | 홈` | [ ] |
| QA-G-04 | 콘솔 에러 | warning / error 0건 (단 React strict mode dev double-render 제외) | [ ] |
| QA-G-05 | 비로그인 진입 | 정상 렌더 (auth guard 없음) ❓ 정책 확인 후 | [ ] |
| QA-G-06 | 페이지 재진입 (뒤로/앞으로) | 정상 렌더 / Quiz 재 fetch | [ ] |

## 3. Hero 섹션

| ID | 항목 | PASS 조건 | 결과 |
|---|---|---|---|
| QA-HERO-01 | 배지 | `컴투스프로야구 2026` | [ ] |
| QA-HERO-02 | title | `컴프야펀` | [ ] |
| QA-HERO-03 | sub | `야구 게임 종합 정보 사이트` | [ ] |
| QA-HERO-04 | 색상 토큰 | `#fff` hardcoded 1건 위반 검증 ❓ | [ ] |

## 4. Quick 섹션

| ID | 항목 | PASS 조건 | 결과 |
|---|---|---|---|
| QA-QUICK-01 | 그리드 | 4-col 그리드 / 3건 표시 (현재 baseline) | [ ] |
| QA-QUICK-02 | label `\n` 처리 | multi-line 정상 표시 (스킬\n시뮬레이터) | [ ] |
| QA-QUICK-03 | 히스토리 모드 클릭 | `/mode/history` 이동 | [ ] |
| QA-QUICK-04 | 스킬 시뮬레이터 클릭 | navigate 차단 + RenewalNoticeModal 표시 | [ ] |
| QA-QUICK-05 | 추천 백과사전 클릭 | navigate 차단 + RenewalNoticeModal 표시 | [ ] |
| QA-QUICK-06 | 모달 닫기 | `onClose` → 모달 닫힘 / 페이지 상태 유지 | [ ] |
| QA-QUICK-07 | comingSoon 연타 | 모달 단일 유지 (다중 중첩 없음) | [ ] |
| QA-QUICK-08 | 키보드 enter | comingSoon 메뉴도 모달 표시 🟨 접근성 검증 | [ ] |

## 5. Quiz 섹션

| ID | 항목 | PASS 조건 | 결과 |
|---|---|---|---|
| QA-QUIZ-01 | 진입 시 dispatch | `requestLatestQuizAnswer` 1회 호출 (Redux DevTools 확인) | [ ] |
| QA-QUIZ-02 | title (title 있음) | `latestQuiz.title` 그대로 표시 | [ ] |
| QA-QUIZ-03 | title (round 만 있음) | `🎉컴프야 퀴즈 이벤트 {round}회 정답` | [ ] |
| QA-QUIZ-04 | title (둘 다 없음) | `컴프야 퀴즈 정답` | [ ] |
| QA-QUIZ-05 | imageUrl 있음 | `<img>` 정상 표시 | [ ] |
| QA-QUIZ-06 | imageUrl 없음 | empty placeholder (`🖼️ 이미지가 없습니다`) | [ ] |
| QA-QUIZ-07 | imageUrl 깨짐 | broken icon (브라우저 기본) ❓ fallback 정책 확인 | [ ] |
| QA-QUIZ-08 | thunk 실패 | 페이지는 계속 렌더 / empty placeholder | [ ] |
| QA-QUIZ-09 | 안내 문구 | `※ 매주 금요일 12:00 / 정답 100스타(★)` 표시 | [ ] |

## 6. 최신 쿠폰 섹션

| ID | 항목 | PASS 조건 | 결과 |
|---|---|---|---|
| QA-COUPON-01 | 섹션 title | `최신 쿠폰` | [ ] |
| QA-COUPON-02 | 전체보기 link | `ROUTE_META.COUPONS.path` 로 이동 | [ ] |
| QA-COUPON-03 | activeCoupon 정상 | CouponListHorizontal 정상 렌더 | [ ] |
| QA-COUPON-04 | activeCoupon 빈 배열 | 외부 도메인 empty UI 표시 | [ ] |
| QA-COUPON-05 | useCouponList 실패 | 페이지 계속 렌더 (home 영향 X) | [ ] |

## 7. 공지사항 섹션

| ID | 항목 | PASS 조건 | 결과 |
|---|---|---|---|
| QA-NOTICE-01 | 섹션 title | `공지사항` | [ ] |
| QA-NOTICE-02 | 전체보기 link | `/notices` 이동 | [ ] |
| QA-NOTICE-03 | 노출 건수 | 최대 3건 (`slice(0,3)`) | [ ] |
| QA-NOTICE-04 | 각 항목 구성 | dot + title + summary + publishedAt(YYYY-MM-DD) | [ ] |
| QA-NOTICE-05 | 항목 클릭 | `/notices/{id}` 상세 이동 | [ ] |
| QA-NOTICE-06 | siteNotices 빈 배열 | 빈 `<ul>` (placeholder 정책 ❓ 미정) | [ ] |
| QA-NOTICE-07 | siteNotices null | 런타임 에러 X (방어 코드 검증 🟨) | [ ] |
| QA-NOTICE-08 | publishedAt null | 빈 텍스트 (옵셔널 처리) | [ ] |
| QA-NOTICE-09 | 1~2건만 존재 | 그만큼만 정상 렌더 | [ ] |

## 8. 진행 중인 이벤트 섹션

| ID | 항목 | PASS 조건 | 결과 |
|---|---|---|---|
| QA-EVENT-01 | 섹션 title | `진행 중인 이벤트` | [ ] |
| QA-EVENT-02 | 전체보기 link | `ROUTE_META.EVENTS.path` 로 이동 | [ ] |
| QA-EVENT-03 | activeEvents 정상 | EventListHorizontal 정상 렌더 | [ ] |
| QA-EVENT-04 | activeEvents 빈 배열 | 외부 도메인 empty UI 표시 | [ ] |
| QA-EVENT-05 | useEventList 실패 | 페이지 계속 렌더 | [ ] |

## 9. 디자인 / 토큰 QA

| ID | 항목 | PASS 조건 | 결과 |
|---|---|---|---|
| QA-DESIGN-01 | 색상 토큰 사용 | hardcoded color 0건 (Hero.heroBadge ❓ 검증) | [ ] |
| QA-DESIGN-02 | spacing 토큰 | `$space-*` / `$layout-h-pad` 만 사용 | [ ] |
| QA-DESIGN-03 | radius 토큰 | `$radius-*` 만 사용 | [ ] |
| QA-DESIGN-04 | TopBar 통합 | 자체 헤더 없음 (글로벌 MobileLayout TopBar 사용) | [ ] |
| QA-DESIGN-05 | dark / light 모드 | 토큰 기반 자동 반영 🟨 검증 필요 | [ ] |

## 10. 회귀 / Cross-cutting

| ID | 항목 | PASS 조건 | 결과 |
|---|---|---|---|
| QA-REG-01 | dead code 영향 | MOCK_QUIZ / MOCK_POSTS import 제거해도 동작 동일 | [ ] |
| QA-REG-02 | community 주석 보존 | 코드 변경 X (재개 시점까지 보존) | [ ] |
| QA-REG-03 | KBO 메뉴 주석 보존 | LEGACY 보류 유지 | [ ] |
| QA-REG-04 | redux strict mode | dev double-render 안전 (useEffect dispatch 중복 OK) | [ ] |
| QA-REG-05 | 라우터 fallback | comingSoon 외 경로 정상 / 404 라우팅 | [ ] |

## 11. 성능 / 접근성 (선택)

| ID | 항목 | PASS 조건 | 결과 |
|---|---|---|---|
| QA-PERF-01 | LCP | 모바일 3G 시뮬레이션 < 2.5s 🟨 측정 권고 | [ ] |
| QA-PERF-02 | 4 hook 동시 fetch | 네트워크 탭에서 병렬 진행 확인 | [ ] |
| QA-A11Y-01 | 키보드 navigation | Tab / Enter 로 모든 인터랙션 가능 🟨 | [ ] |
| QA-A11Y-02 | 스크린리더 | section role / aria-label 부여 🟨 | [ ] |

## 12. 강제 HITL 4 분야 점검

home 도메인 자체로는 강제 HITL 4 분야 (법무 / 결제 / 권한 / DB 파괴적) 항목 **0건**.

다만 외부 도메인 의존:
- [ ] coupons / events 변경 시 home 회귀 테스트 필요
- [ ] notices 변경 시 home NoticeSection 회귀 테스트
- [ ] quiz 변경 시 home QuizSection 회귀 테스트

## 13. 사용자 확인 필요 항목 (QA 진행 전)

다음 정책 확정 후 QA 진행 권고:
- ❓ 비로그인 접근 정책 (QA-G-05)
- ❓ Hero.heroBadge 토큰화 (QA-HERO-04 / QA-DESIGN-01)
- ❓ Quiz broken image fallback (QA-QUIZ-07)
- ❓ Quiz thunk 실패 시 UI (QA-QUIZ-08)
- ❓ NoticeSection 빈 배열 placeholder (QA-NOTICE-06)
- 🟨 NoticeSection null safety 방어 (QA-NOTICE-07)
- 🟨 접근성 / 키보드 nav (QA-A11Y-*)

## 14. 완료 보고 양식

QA 완료 시 다음 양식으로 보고:

```
[home QA 결과] {YYYY-MM-DD}
- 전체 체크: {n}/{total}
- 실패 항목: {ID 리스트}
- 미정 항목 (정책 답변 대기): {ID 리스트}
- 회귀 영향 외부 도메인: {도메인 리스트}
```
