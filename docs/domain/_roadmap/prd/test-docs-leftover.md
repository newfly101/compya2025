# 남은 작업 — 지난 작업지시 문서에서 추린 미구현 항목

> 2026-09-13 정리. `test-docs/` 에 흩어져 있던 작업지시 문서 16개를 현재 코드와 대조해,
> 이미 구현된 11건은 소거하고 아직 안 된 항목만 여기 모았다.

## 한눈에 보기

| # | 항목 | 영역 | 상태 |
|---|---|---|---|
| 1 | 이벤트 등록 화면에 이벤트 타입 선택 UI가 없음 | 관리자(이벤트) | 확인 필요 (사양 변경 추정) |
| 2 | 특정 화면 유형에서 로그아웃 버튼이 아예 안 보임 | 로그인/네비게이션 | 해결 (2026-09-13) |
| 3 | 탈퇴 후 재로그인 시 "재활성화됐다"는 사실을 화면에 안내 못 함 | 계정(마이페이지) | 미구현 (원래도 후속 작업으로 남겨둔 항목) |

## 상세

### 1. 이벤트 등록 화면에 이벤트 타입 선택 UI가 없음
- **무슨 일**: 원래 지시는 이벤트 타입을 2종으로 줄이고, 관리자가 등록할 때 타입을 골라 칩으로 보여주게 하는 것이었다.
- **지금 상태**: `EVENT_TYPES`/`EVENT_TYPE_LABELS` 자체가 코드에 없다. 새 이벤트는 항상 "공식(OFFICIAL)"로 고정되고, 수정할 때만 기존 값을 유지한다. 목록의 칩은 타입이 아니라 진행중/종료 상태를 보여준다.
  - 근거: `web/src/domains/events/mobile/admin/AdminEventScreen.jsx:28-33, 41, 325-327`
- **왜 안 됐나 / 판단**: 타입 선택 자체를 없애는 쪽으로 방침이 바뀐 것으로 보이나, 의도적 단순화인지 빠뜨린 것인지 문서만으로는 단정 못 한다.
- **하려면**: 관리자가 실제로 타입을 골라야 하는지부터 확인. 필요하면 `AdminEventScreen.jsx` 등록 폼에 타입 select + 라벨 칩 추가.

### 2. 특정 화면 유형에서 로그아웃 버튼이 아예 안 보임
- **무슨 일**: 원래 지시는 서랍(Drawer)에도 로그아웃 버튼을 만들어, 상단바에 진입점이 없는 화면을 보완하는 것이었다.
- **지금 상태**: `Drawer.jsx` 코드 주석에 "로그아웃은 TopBar 쪽 진입점을 그대로 쓴다(여기서는 만들지 않는다)"고 명시돼 있고 실제로 버튼이 없다. 그런데 `TopBar.jsx`는 `variant: page/section` 화면에서 로그아웃 진입점을 제공하지 않는다. 결과적으로 이 variant 화면들에서는 로그아웃할 방법이 전혀 없다.
  - 근거: `web/src/app/wrapper/mobile/parts/Drawer.jsx:54-55`, `web/src/app/wrapper/mobile/parts/TopBar.jsx:12-49`
- **왜 안 됐나 / 판단**: 코드 주석과 실제 동작이 일치하는 걸 보면 "Drawer에 안 만든다"는 결정 자체는 의도적이다. 다만 그 전제였던 "TopBar가 보완한다"는 부분이 비어 있어, 일부 화면에서 로그아웃 진입점이 완전히 사라진 상태였다.
- **해결 (2026-09-13)**: 사용자가 page/section variant에도 로그아웃을 넣기로 확정. `TopBar.jsx`의 두 variant 분기에 로그인 상태일 때만 보이는 아이콘 버튼(`⏻`, `aria-label="로그아웃"`)을 추가했다. 기존 `rightAction`과 나란히 배치되도록 `.rightAction` 래퍼를 공유하고, `section`의 빈 `rightPlaceholder`는 `rightAction`도 로그아웃도 없을 때만 남도록 조건을 정리했다.
  - 근거: `web/src/app/wrapper/mobile/parts/TopBar.jsx`, `web/src/app/wrapper/mobile/parts/TopBar.module.scss`

### 3. 탈퇴 후 재로그인 시 "재활성화됐다"는 사실을 화면에 안내 못 함
- **무슨 일**: 탈퇴(WITHDRAWN) 후 1개월 내 재로그인하면 계정이 자동 재활성화되는데, 이 사실을 로그인 리다이렉트 응답에 담아 프론트가 안내할 수 있게 하자는 것.
- **지금 상태**: 재활성화 로직 자체(`withdrawn_at` 기준 판단)는 구현돼 있지만, 로그인 콜백 응답에 재활성화 여부를 실어 보내는 부분은 없다.
  - 근거: `src/main/java/.../oauth/service/UserServiceImpl.java:184-202` (재활성화 로직), `AuthController.naverCallback` 관련 코드에 재활성화 플래그 없음
- **왜 안 됐나 / 판단**: 원래 작업지시 문서 자체가 이 부분을 범위 밖으로 명시했던 항목 — 누락이 아니라 처음부터 다음 순번 작업으로 미뤄둔 것.
- **하려면**: 로그인 콜백 응답 DTO에 재활성화 플래그 추가 + FE에서 안내 토스트/모달 노출.

## 판단 보류

- **사이트맵 · 프리렌더 대상 URL 개수 불일치**: 여러 문서(`adsense-A1-policy-sitemap.md`, `adsense-prerender.md`, `community-readonly-noindex.md`)가 "정적 11 + 동적 61 = 72개"를 기준으로 서술하는데, 실제 `sitemap.xml`과 `prerender.mjs` 대상은 13개뿐이고 동적 섹션(확률표 61개)은 아예 빠져 있다. `routeSeo.js:38-40` 주석(2026-09-04)에 확률표를 NOINDEX 처리했다는 기록이 있어 정책이 바뀐 것으로 보이나, 도메인 추가(legend-stats/skills 등)와 확률 섹션 노출 정책 변경이 섞여 있어 72라는 숫자가 지금도 유효한 목표치인지는 확정할 수 없다. **확인하면 될 것**: 확률표 섹션을 sitemap/prerender에 다시 넣을지 여부를 정책으로 못박기.
- **프리렌더 `<title>` 버그 재현 안 됨**: 문서(`adsense-prerender.md`)는 라우트별 `<title>`이 안 바뀌는 버그(handle.title 이중 접근 오류)를 지적하지만, 현재 `useDocumentMeta.js:90`은 `handle` 객체를 한 번만 접근하는 구조라 해당 버그 패턴 자체가 없다. 이미 고쳐졌는지, 애초에 문서가 오해한 것인지 코드만으로는 알 수 없다.
- **EventCard 내부 `/events/:id` 링크 전환**: 문서(`adsense-C-internal-links.md`)는 이벤트 카드 내부 이동 링크를 `<Link>`로 바꾸라고 지시했는데, 현재 코드에는 그 내부 이동 로직 자체가 없다(이벤트 상세 페이지 라우트가 없음). 죽은 링크가 나중에 통째로 제거된 것으로 보이나, 이벤트 상세 페이지를 앞으로 만들 계획이 있는지는 확인이 필요하다.
- **`UserRow.jsx` / `UserRow.module.scss` 사용 여부**: 관리자 유저 화면이 `AdminTable` 인라인 렌더로 리팩터되면서 이 컴포넌트를 아무도 import하지 않는 것으로 보인다(`fix-users-admin.md` 재검증 결과). 죽은 코드인지, 다른 곳에서 곧 쓸 예정인지 재확인 후 정리 필요.

## 소거한 문서 (참고용 기록)

| 문서명 | 판정 | 비고 |
|---|---|---|
| adsense-A1-policy-sitemap.md | 부분 | 미구현분(sitemap 개수)은 판단 보류로 이관 |
| adsense-A2-seo-404.md | 완료 | - |
| adsense-prerender.md | 부분 | 미구현분(대상 개수, title 버그)은 판단 보류로 이관 |
| adsense-C-internal-links.md | 부분 | 미구현분(EventCard 내부 링크)은 판단 보류로 이관 |
| adsense-B-footer-logout.md | 부분 | 미구현분(로그아웃 진입점)은 위 목록 2번으로 이관 |
| adsense-D-user-email.md | 완료 | - |
| adsense-policy-content.md | 완료 | - |
| community-readonly-noindex.md | 완료 | sitemap 개수 불일치만 판단 보류로 이관 |
| community-auth-fix.md | 완료 | - |
| fix-admin-user-guard.md | 완료 | - |
| fix-events-admin.md | 부분 | 미구현분(이벤트 타입 UI)은 위 목록 1번으로 이관, 페이지네이션 방식 변경은 기능상 해결됨 |
| fix-notices-admin.md | 완료 | 파일 위치만 이후 리팩터로 이동 |
| fix-upload-response.md | 완료 | - |
| fix-users-admin.md | 완료 | 죽은 코드(UserRow) 건은 판단 보류로 이관 |
| users-me-api.md | 완료 | 미구현분(재활성화 안내)은 위 목록 3번으로 이관 |
| users-mypage-fe.md | 완료 | - |
