# 관리자 기능 코드 인벤토리

> 조사 전용 문서 — 코드 수정 없음. 기준일 2026-08-20.
> 목적: Figma admin v2 시안에 아직 반영 안 된 기존 관리자 기능 파악.

## 1. 총괄

| 도메인 | 화면 수 | 라우트 연결 | BE 연동 | 한 줄 상태 |
|---|---|---|---|---|
| admin(대시보드) | 1 | 0/1 | 해당없음 | 화면은 있으나 라우터·nav 어디서도 안 씀 (고아) |
| coupons | 1 | 1/1 | O | 정상 동작 |
| events | 1 | 1/1 | O | 정상 동작 |
| notices | 1 | 1/1 | O | 알려진 버그 2건 (§6) |
| users | 1 | 1/1 | O | 역할·상태 변경만, BE 범위와 일치 |
| wiki | 5 + 고아 1 | 5/5 (route는 열림) | 4/5 | game-info는 라우트만 있고 BE 없음(404), pitch-grades는 폐기 예정 |
| community | 5(보드/게시글/댓글/태그+통합) | 0/1 | 4/5 컨트롤러 대응 | 라우터 전체 미등록, 화면 내부 import 에러 있음 |
| quiz | 0 | - | 1 컨트롤러 | store 스캐폴딩만 있고 화면·라우트 없음 |
| player(선수카드) | 0 | - | 1 컨트롤러 | FE 전무, BE만 존재 |
| fun/playerCard | 0 | - | 1 컨트롤러 | FE 전무, BE만 존재 |

## 2. 화면별 상세

| 도메인 | 화면 | 파일 경로 | 라우트 | 연결 | BE 엔드포인트 | 비고 |
|---|---|---|---|---|---|---|
| admin | 대시보드 | `web/src/domains/admin/mobile/AdminDashboardScreen.jsx` | (없음, 코드 주석상 `/admin` 의도) | X | 없음(nav 허브) | 라우터 미등록 + Drawer nav 미노출 + 코드 전역에서 import 0건 |
| coupons | 쿠폰 관리 | `web/src/domains/coupons/mobile/admin/AdminCouponScreen.jsx` | `/admin/coupon` | O | `AdminCouponController` GET/POST/PATCH/PATCH visible/DELETE (5) | - |
| events | 이벤트 관리 | `web/src/domains/events/mobile/admin/AdminEventScreen.jsx` | `/admin/event` | O | `AdminEventController` GET external/POST/PATCH/PATCH visible/GET all/DELETE (6) | - |
| notices | 공지 관리 | `web/src/domains/notices/mobile/admin/AdminNoticeScreen.jsx` | `/admin/notice` | O | `AdminNoticeController` GET/GET·id/POST/PUT/PATCH visible/PATCH pinned/DELETE (7) | 버그 2건 — §6-1, §6-2 |
| users | 유저 관리 | `web/src/domains/users/mobile/admin/AdminUserScreen.jsx` | `/admin/user` | O | `AdminUserController` GET/GET·id/PATCH role/PATCH status (4) | 생성·삭제 없음 — BE도 동일 범위라 정합 |
| wiki | 위키 관리 홈 | `web/src/domains/wiki/admin/mobile/AdminWikiScreen.jsx` | `/admin/wiki` | O | 없음(하위 4개 이동 허브) | - |
| wiki | 마구 관리 | `web/src/domains/wiki/admin/mobile/AdminWikiPitchScreen.jsx` | `/admin/wiki/pitches` | O | `AdminWikiController` `/pitches` GET/POST/PUT/DELETE (4) | - |
| wiki | 마구 등급 관리 | `web/src/domains/wiki/admin/mobile/AdminWikiPitchGradeScreen.jsx` | `/admin/wiki/pitch-grades` | O | `AdminWikiController` `/pitch-grades` GET/POST/PUT/DELETE (4) | ⚠️ 폐기 예정 (2026-08-20 결정, 코드·라우트 아직 미제거) |
| wiki | 스탯 영향 관리 | `web/src/domains/wiki/admin/mobile/AdminWikiStatInfluenceScreen.jsx` | `/admin/wiki/stat-influences` | O | `AdminWikiController` `/stat-influences` GET/POST/PUT/DELETE (4) | - |
| wiki | 위키 게임정보 관리 | `web/src/domains/wiki/admin/mobile/AdminWikiGameInfoScreen.jsx` | `/admin/wiki/game-info` | O(라우트만) | ❌ 없음 | `AdminWikiController`에 game-info 매핑 자체가 없어 진입 시 404 |
| community | 통합 관리(보드/게시글/댓글/태그 탭) | `web/src/domains/community/page/admin/AdminCommunityPage.jsx` 외 다수(§3) | 없음 | X | `AdminBoardController`/`AdminPostController`/`AdminCommentController`/`AdminTagController` | 범위 밖 결정 + import 에러(§6-3) |
| community | 신고 관리 | 없음(FE 미구현) | - | - | `AdminReportController` GET/GET pending/GET target/GET·id/PATCH status/DELETE (6) | FE 자체가 없음 |
| quiz | 퀴즈 관리 | 없음(FE 미구현, store만 존재) | - | - | `AdminQuizController` GET/POST/PATCH/DELETE (4) | `store/admin/{api,endpoints,thunks}.js`만 있고 화면·라우트 없음 |
| player | 선수카드 관리 | 없음 | - | - | `AdminPlayerCardController` `/api/admin/player` GET teams/POST (2) | FE 전무 |
| fun/playerCard | fun 플레이어카드 관리 | 없음 | - | - | `FunAdminPlayerCardController` `/api/admin/player-cards` POST/PUT/GET·id (3) | FE 전무 |

## 3. 라우트 미연결 (열어도 안 뜸)

| 화면 | 파일 | 왜 미연결인지 |
|---|---|---|
| 대시보드 | `web/src/domains/admin/mobile/AdminDashboardScreen.jsx` | `AdminRoutes.jsx`에 `/admin` index 라우트 자체가 없음. Drawer `ADMIN_MENU_GROUPS`에도 링크 없음. 코드상 어디서도 import 안 됨 |
| 커뮤니티 통합 관리 | `web/src/domains/community/page/admin/AdminCommunityPage.jsx` | `AdminRoutes.jsx`/`UserRoutes.jsx` 어디에도 `/admin/community` 경로 없음 (기획 IA 보류 상태, 이미 확인된 사실) |

## 4. BE 엔드포인트 전수

| Controller | 메서드 | 경로 | 대응 FE |
|---|---|---|---|
| AdminCouponController | GET/POST/PATCH/PATCH/DELETE | `/api/admin/coupons`, `/{id}`, `/{id}/visible`, `/{id}` | coupons admin |
| AdminEventController | GET/POST/PATCH/PATCH/GET/DELETE | `/api/admin/events/external`, `/api/admin/events`, `/{id}`, `/{id}/visible`, `/api/admin/events`, `/{id}` | events admin |
| AdminNoticeController | GET/GET/POST/PUT/PATCH/PATCH/DELETE | `/api/admin/notices`, `/{id}`, `/api/admin/notices`, `/{id}`, `/{id}/visible`, `/{id}/pinned`, `/{id}` | notices admin |
| AdminUserController | GET/GET/PATCH/PATCH | `/api/admin/users`, `/{id}`, `/{id}/role`, `/{id}/status` | users admin |
| AdminWikiController | GET/POST/PUT/DELETE ×3세트 | `/api/admin/wiki/pitches`, `/pitch-grades`, `/stat-influences` (각 CRUD) | wiki admin (game-info 대응 없음) |
| AdminBoardController | GET/GET/POST/PUT/PATCH/DELETE | `/api/admin/boards`, `/{id}`, `/{id}`, `/{id}/visible`, `/{id}` | community `BoardAdminTable` (라우트 미연결) |
| AdminPostController | GET/POST/PUT/PATCH/PATCH/DELETE | `/api/admin/posts/{id}`, `/api/admin/posts`, `/{id}`, `/{id}/visible`, `/{id}/pinned`, `/{id}` | community `PostAdminTable` (라우트 미연결) |
| AdminCommentController | GET/GET/GET/PATCH/DELETE | `/api/admin/comments/posts/{postId}`, `/{id}`, `/{parentCommentId}/replies`, `/{id}/visible`, `/{id}` | community `CommentAdminTable` (라우트 미연결) |
| AdminTagController | GET/GET/POST/PUT/PATCH/DELETE | `/api/admin/tags`, `/{id}`, `/api/admin/tags`, `/{id}`, `/{id}/visible`, `/{id}` | community `TagAdminTable` (라우트 미연결) |
| AdminReportController | GET/GET/GET/GET/PATCH/DELETE | `/api/admin/reports`, `/pending`, `/target`, `/{id}`, `/{id}/status`, `/{id}` | 없음 (FE 미구현) |
| AdminQuizController | GET/POST/PATCH/DELETE | `/api/admin/quiz`, `/api/admin/quiz`, `/{id}`, `/{id}` | 없음 (store만) |
| AdminPlayerCardController | GET/POST | `/api/admin/player/teams`, `/api/admin/player` | 없음 |
| FunAdminPlayerCardController | POST/PUT/GET | `/api/admin/player-cards`, `/{id}`, `/{id}` | 없음 |
| UploadController(admin 패키지) | - | 이미지 업로드 유틸(도메인 무관, event/notice admin이 사용) | 인프라성, 화면 아님 |

## 5. 고아 파일 (아무도 import 안 함)

| 파일 | 크기 | 추정 사유 |
|---|---|---|
| `web/src/domains/wiki/admin/screens/AdminWikiGameInfoScreen.jsx` | 3줄 | `AdminWikiScreen.jsx`를 re-export만 하는 shim. 파일 내 주석은 "AdminRoutes.jsx가 이 경로를 import함"이라 적혀 있으나 실제 라우터는 `mobile/AdminWikiGameInfoScreen.jsx`를 import — 주석과 실제가 불일치하는 죽은 코드 |
| `web/src/global/ui/visibleToggle/VisibleToggle.jsx` (+ `index.js`) | - | 공용 컴포넌트로 만들어졌으나 어떤 admin 화면도 사용 안 함 (기존 확인된 사실) |
| `web/src/domains/admin/mobile/AdminDashboardScreen.jsx` (+ `.module.scss`) | 39줄 | §3과 동일 파일 — 라우트 미연결이면서 동시에 어디서도 import 안 되는 고아이기도 함 |

## 6. 알려진 결함

| # | 내용 | 파일:라인 | 심각도 |
|---|---|---|---|
| 1 | 공지 수정 API가 PATCH↔PUT 불일치 — BE는 `@PutMapping("/{noticeId}")`인데 FE `fetchAdminUpdateNotice`는 `API.patch(...)` 호출 | `AdminNoticeController.java:52`(PUT) ↔ `web/src/domains/notices/store/admin/api.js:6`(patch) | 높음 — 405 Method Not Allowed 예상 |
| 2 | 공지 수정 시 URL에 함수 자체를 전달, 호출(`(id)`) 안 함 — `ADMIN_NOTICES.UPDATE`는 `(id) => .../{id}` 함수인데 인자 없이 그대로 axios url로 넘김 | `web/src/domains/notices/store/admin/api.js:6` (`API.patch(ADMIN_NOTICES.UPDATE, notice)`) | 높음 — #1과 겹쳐 수정 기능 자체가 동작 안 할 가능성 |
| 3 | 커뮤니티 admin `BoardAdminTable`/`PostAdminTable`이 존재하지 않는 훅을 import — `@/global/hooks/useTableModal.js` 파일 자체가 없음 (`find` 결과 0건) | `web/src/domains/community/feature/components/admin/board/BoardAdminTable.jsx:3`, `.../post/PostAdminTable.jsx:3` | 높음 — 렌더 시 모듈 resolve 실패 (단, 라우트 미연결이라 현재는 도달 불가) |
| 4 | 위키 game-info admin 화면은 라우트가 열려 있으나 대응 BE 엔드포인트가 `AdminWikiController`에 없음 | `web/src/app/router/routes/AdminRoutes.jsx:36`, `AdminWikiController.java`(전체) | 중간 — 진입 시 404 |
| 5 | `VisibleToggle` 공용 컴포넌트를 만들었으나 실제 사용하는 화면이 없음 | `web/src/global/ui/visibleToggle/*` | 낮음 — 중복 토글 UI 구현 가능성 |
| 6 | 마구·구종 등급 관리(`AdminWikiPitchGradeScreen`, `/admin/wiki/pitch-grades`)는 2026-08-20 폐기 결정됐으나 코드·라우트·nav 링크 미제거 상태 | `web/src/domains/wiki/admin/mobile/AdminWikiPitchGradeScreen.jsx`, `AdminRoutes.jsx:35` | 정보성 — Figma v2에도 반영 불필요 |

## 7. HITL — 사용자 결정 필요

| # | 항목 | 결정 필요 사항 |
|---|---|---|
| 1 | 대시보드(`/admin` 진입점) | Figma v2에 admin 홈 화면을 넣을지, 넣는다면 라우트 등록 방식(별도 작업으로 진행할지) |
| 2 | 퀴즈 관리 | BE·store 스캐폴딩은 있는데 화면이 없음 — v2 범위에 신규 포함할지 |
| 3 | 신고 관리(AdminReportController) | FE가 아예 없음 — v2 범위 포함 여부 |
| 4 | 선수카드 / fun 플레이어카드 관리 | FE 전무 — v2 범위 포함 여부, 포함 시 마구 등급 폐기와 별개 기능인지 확인 필요 |
| 5 | 커뮤니티 admin 4개 화면(보드/게시글/댓글/태그) | 기존 결정대로 범위 밖 유지할지, v2에서 재개할지 |
