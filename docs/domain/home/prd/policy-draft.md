# home 도메인 정책 결정 (Draft)

> **확정 X — Draft**. 사용자 / 운영자 합의 후 `policy.md` 로 promote.
> **모드**: reverse engineering
> **선행 산출물**: `ia.md` + `requirements.md`
> **작성일**: 2026-05-11

---

## 1. 강제 HITL 4 분야 항목

home 도메인은 자체 결제 / 권한 / DB 파괴적 / 법무 결정 없음 → **강제 HITL 4 분야 해당 항목 0건**.

(이유: 모든 결제/권한/DB 변경은 외부 도메인 (coupons / events / quiz / notices) 책임. home 은 read-only 소비자.)

## 2. 일반 운영 정책

### 2.1 퀵메뉴 (Quick) 정책

| 항목 | 현재 정책 | 마커 |
|---|---|---|
| comingSoon 메뉴 처리 | navigate 차단 + `RenewalNoticeModal` 표시 | 확정 (코드 baseline) |
| comingSoon 추가/제거 | `QUICK_MENUS` config 직접 수정 (코드 배포 필요) | 🟨 **가정** — 운영 어드민 없음, 코드 배포 기반 |
| 폐기 메뉴 보존 기간 | 미정 — `comingSoon: true` 로 표시 유지 중 (skill / encyclopedia) | ❓ **미정** — 영구 보존 / 시점별 제거? |
| 신규 메뉴 추가 절차 | `QUICK_MENUS.js` 에 항목 추가 → 배포 | 🟨 **가정** — 현재 워크플로우 |
| 그리드 col 수 | 4-col 고정 | 🟨 **가정** — 향후 메뉴 개수 변경 시 review |
| 모달 (RenewalNoticeModal) 문구 | 글로벌 컴포넌트 — home 도메인 비종속 | 🟨 **가정** — 별도 운영 정책 (글로벌) |

### 2.2 Quiz 섹션 정책

| 항목 | 현재 정책 | 마커 |
|---|---|---|
| 정답 조회 시점 | 페이지 진입 시 1회 (`useEffect` 마운트) | 확정 (코드) |
| 재조회 (refresh) | 없음 — 페이지 재방문 시만 | 🟨 **가정** — 신규 정답 등록 시 즉시 반영 needed 면 별도 트리거 |
| empty 상태 (imageUrl 없음) | `🖼️ 이미지가 없습니다` placeholder | 확정 (코드) |
| empty 상태 (latestQuiz 자체 null) | 동일 placeholder (코드상 quiz?. 옵셔널) | 🟨 **가정** — 의도된 동작 |
| 신규 등장 안내 문구 | `※ 매주 금요일 12:00 / 정답 100스타` 정적 | ❓ **미정** — 운영 시간 변경 시 코드 배포 필요 |
| 정답자 추첨/공개 정책 | home 범위 외 (quiz 도메인 책임) | — |

### 2.3 공지사항 (Notice) 섹션 정책

| 항목 | 현재 정책 | 마커 |
|---|---|---|
| 노출 건수 | 상위 3건 (`slice(0, 3)`) | 확정 (코드) |
| 정렬 기준 | `useNoticeList().siteNotices` 정렬 위임 (외부) | 🟨 **가정** — 최신 publishedAt 순 추정 |
| 빈 배열 처리 | 빈 `<ul>` 만 렌더 (placeholder 없음) | ❓ **미정** — empty UI 추가 여부 |
| 카테고리 필터 | siteNotices 만 (eventNotices / gameNotices 제외) | 확정 (코드) |
| 클릭 navigate | `/notices/{id}` 상세 페이지 | 확정 (코드) |
| publishedAt 표시 | 앞 10자 (YYYY-MM-DD) | 확정 |

### 2.4 외부 도메인 위임 정책

home 은 외부 도메인 hook 만 호출 — empty / loading / error UX 는 **외부 도메인 책임**.

| 섹션 | 위임 대상 | home 책임 |
|---|---|---|
| 최신 쿠폰 | `CouponListHorizontal` (coupons 도메인) | 그대로 render |
| 진행 중 이벤트 | `EventListHorizontal` (events 도메인) | 그대로 render |
| 공지사항 | `useNoticeList` (notices 도메인) | dot-list UI 만 home 소유 |
| 퀴즈 | `requestLatestQuizAnswer` thunk (quiz 도메인) | empty UI 만 home 소유 |

🟨 **가정**: 외부 도메인 컴포넌트의 empty / loading / error UX 가 home 톤 (모바일 미니멀) 과 정합되어야 함. 현재 미검증 — design QA 단계 필요.

### 2.5 페이지 레벨 통합 게이트 정책

| 항목 | 현재 정책 | 마커 |
|---|---|---|
| 페이지 전체 loading 게이트 | **없음** — 섹션별 독립 분기 | ❓ **미정** — 의도된 설계 vs 결함 |
| 페이지 전체 error 게이트 | **없음** | ❓ **미정** |
| 외부 hook 실패 시 | 섹션 단위로 처리 위임 | 🟨 **가정** — 1개 섹션 실패가 나머지 차단 X 의도 |

### 2.6 dead code / 보류 정책

| 항목 | 현재 상태 | 권고 (기획자 의견) |
|---|---|---|
| `MOCK_QUIZ.js` import | dead (실제 redux 사용) | 즉시 제거 — develop 트랙 후속 |
| `MOCK_POSTS.js` / `MOCK_TEAM_POSTS.js` import | dead (community 주석) | community IA 재개 결정 후 일괄 처리 |
| 커뮤니티 섹션 주석 코드 | 보존 (2026-05-09 보류) | 🟨 **가정** — 재개 시점 결정 후 처리 |
| KBO 퀵메뉴 주석 | 보존 (LEGACY 보류) | 🟨 **가정** — BE API 구현 완료까지 유지 |
| `.sep` / `.postRowList` style | dead | community 결정 시점에 처리 |

## 3. 사용자 확인 필요 항목 (운영자 / 사용자 답변 필요)

- ❓ **미정** §2.1 폐기 메뉴 (comingSoon) 보존 기간 정책
- ❓ **미정** §2.2 Quiz 안내 문구 운영 절차 (시간 변경 시 코드 배포 vs 어드민)
- ❓ **미정** §2.3 NoticeSection 빈 배열 UX (placeholder 추가 여부)
- ❓ **미정** §2.5 페이지 통합 loading/error 게이트 도입 여부
- 🟨 **가정** §2.4 외부 도메인 empty/loading UX home 톤 정합 — design QA 필요
- 🟨 **가정** §2.6 dead code 즉시 제거 권고 — develop 트랙 합의 필요

## 4. promote 절차

이 Draft 는 다음 합의 후 `policy.md` 로 promote:
1. 위 ❓ **미정** 4건 운영자 답변
2. 🟨 **가정** 3건 검토 / 확정
3. promote 시 모든 마커 (🟨 / ❓) 제거 → 확정 값으로 대체
