# 관리자 화면 현황

이 문서는 재설계 이전 **현황 파악** 문서다. 좋다/나쁘다 판단이나 개선안은 담지 않는다. 마지막 "재설계 때 만들 부품 목록"만 예외로, 실측 결과에서 자연히 나오는 후보 목록이다.

두 계열이 섞여 있다.
- **(가) 모바일 신규**: `coupons`, `events`, `notices`, `users`, `wiki`, `admin`(대시보드) 도메인의 `mobile/admin` 계열 화면. 최근에 새로 만든 것.
- **(나) 예전 방식**: `community` 도메인의 `feature/components/admin` 계열. 표(table) + 모달(modal) 조합으로 만든 예전 관리자 화면.

## 한눈에 보기

| 도메인 | 파일 경로 | 계열 | 줄 수 | 하는 일 | 주소 연결 |
|---|---|---|---|---|---|
| admin | `domains/admin/mobile/AdminDashboardScreen.jsx` | (가) | 39 | 관리자 화면 전체 진입 허브(5개 메뉴 카드) | **미연결** — 라우터에 등록 안 됨 |
| coupons | `domains/coupons/mobile/admin/AdminCouponScreen.jsx` | (가) | 222 | 쿠폰 목록·검색·필터·등록·수정·삭제 | 연결 (`/admin/coupon`) |
| events | `domains/events/mobile/admin/AdminEventScreen.jsx` | (가) | 233 | 이벤트 목록·검색·필터·등록·수정·삭제 | 연결 (`/admin/event`) |
| notices | `domains/notices/mobile/admin/AdminNoticeScreen.jsx` | (가) | 232 | 공지 목록·검색·필터·등록·수정·즉시노출토글 | 연결 (`/admin/notice`) |
| users | `domains/users/mobile/admin/AdminUserScreen.jsx` | (가) | 124 | 유저 목록·검색·필터 (상세는 "다음 사이클" placeholder) | 연결 (`/admin/user`) |
| wiki | `domains/wiki/admin/mobile/AdminWikiScreen.jsx` | (가) | 58 | 위키 관리 진입(마구/등급/스탯 3개 카드) | 연결 (`/admin/wiki`) |
| wiki | `domains/wiki/admin/mobile/AdminWikiPitchScreen.jsx` | (가) | 207 | 마구 목록·등록·수정·삭제(비활성화) | 연결 (`/admin/wiki/pitches`) |
| wiki | `domains/wiki/admin/mobile/AdminWikiPitchGradeScreen.jsx` | (가) | 164 | 구종 등급 목록·등록·수정·삭제 | 연결 (`/admin/wiki/pitch-grades`) |
| wiki | `domains/wiki/admin/mobile/AdminWikiStatInfluenceScreen.jsx` | (가) | 187 | 스탯 영향 목록·등록·수정·삭제(비활성화) | 연결 (`/admin/wiki/stat-influences`) |
| wiki | `domains/wiki/admin/mobile/AdminWikiGameInfoScreen.jsx` | (가) | 4 | 실제 화면 없음, `AdminWikiScreen` 재수출(alias) | 연결이지만 별도 화면 아님 |
| wiki | `domains/wiki/admin/screens/AdminWikiGameInfoScreen.jsx` | — | 3 | 위와 동일 내용의 중복 파일 (다른 위치) | **연결 안 됨** — 아무 데서도 참조 안 함, 죽은 파일 |
| community | `domains/community/page/admin/AdminCommunityPage.jsx` | (나) | 14 | 관리자 커뮤니티 화면 진입점 | **미연결** — 라우터에 등록 안 됨 |
| community | `.../feature/components/admin/CommunityManagePage.jsx` | (나) | 27 | 탭 전환 컨테이너 (게시판/게시글/댓글/태그) | 위 페이지에서만 사용 |
| community | `.../admin/tabs/CommunityAdminTabs.jsx` | (나) | 29 | 탭 버튼 4개 | 위 컨테이너에서 사용 |
| community | `.../admin/board/BoardAdminTable.jsx` | (나) | 56 | 게시판 표 + 등록/수정 모달 호출 | import 오류 있음 (아래 참고) |
| community | `.../admin/post/PostAdminTable.jsx` | (나) | 63 | 게시글 표 + 등록/수정 모달 호출 | import 오류 있음 (아래 참고) |
| community | `.../admin/tag/TagAdminTable.jsx` | (나) | 59 | 태그 표 + 등록/수정 모달 호출 | 정상 동작 |
| community | `.../admin/board/CommentAdminTable.jsx` | (나) | 32 | 댓글 표 | **가짜 데이터만 표시** (실제 API 연결 없음) |

관리자 화면(진입점+실제 관리 화면) 총 개수: **(가) 10개**(대시보드 1 + 쿠폰/이벤트/공지/유저 4 + 위키 5, alias 1개 제외 시 9개) / **(나) 7개**(진입 페이지 1 + 탭 컨테이너 1 + 표 4 + 탭바 1). `community` 도메인 전체가 라우터에서 "IA 재정리 보류" 상태라 (나) 계열은 전부 화면에 뜨지 않는다 (`PublicRoutes.jsx` 주석 확인).

`quiz` 도메인은 `store/admin/`(API 연동 코드)만 있고 관리 화면 자체가 없음 — 미구현으로 추정.

## 화면을 이루는 조각들

실측 대상: 쿠폰/이벤트/공지/유저(가), 위키 3종(가), 게시판/게시글/태그(나).

| 부품 | (가) 쿠폰·이벤트·공지·유저 | (가) 위키 3종 | (나) 게시판·게시글·태그 |
|---|---|---|---|
| 목록 표시 | 카드 나열 (`<ul><li>`), 컬럼 개념 없음 | 카드형 리스트 항목 (`<li>`), 이름/코드/타입 표시 | **표(table)**, 7~10개 컬럼 |
| 검색 | 있음. 상단 입력창 1개, 클라이언트 사이드 문자열 필터 | 없음 | 없음 |
| 필터 | 칩(chip) 버튼 형태. 2~4종류 (노출여부, 타입, 소스, 고정여부) | 없음 | 없음 |
| 등록/수정 입력 | 바텀시트(하단에서 올라오는 오버레이) | `createPortal` 모달 (화면 중앙) | 화면 중앙 모달 (오버레이 + wrapper) |
| 입력 항목 수 | 쿠폰 6 · 이벤트 6 · 공지 4(+2 체크박스) · 유저 없음(상세 미구현) | 마구/등급/스탯 각 6개 | 게시판 7 · 게시글 8 · 태그 4 |
| 삭제 | 쿠폰만 `window.confirm()` 확인창. 이벤트·공지·유저는 삭제 버튼 자체가 없음 | 별도 확인 모달(`ConfirmModal`)로 확인 후 삭제(=비활성화) | 없음 — 수정 모달의 "삭제 상태" 체크박스로 대신함 |
| 즉시 토글 (목록에서 바로 켜기/끄기) | **공지만** 목록 칩 클릭으로 노출 즉시 전환됨. 쿠폰·이벤트는 칩이 있지만 클릭 안 됨(표시만) | 없음 (수정 폼 진입 후 체크박스로만 변경) | 없음 (수정 모달 진입 후 체크박스로만 변경) |
| 여러 개 선택(체크박스) | 없음 | 없음 | 없음 |
| 페이지 넘기기 | 없음 (전체 목록을 한 번에 불러와 클라이언트에서 필터) | 없음 | 없음 |
| 이미지 업로드 | 없음. 이벤트 화면에 "이미지 URL" 텍스트 입력창만 있음(파일 업로드 아님) | 없음 | 없음 |

## 두 방식의 차이

| 항목 | (가) 모바일 신규 | (나) 예전 방식 |
|---|---|---|
| 목록 형태 | 카드 나열 | 표(table), PC 화면 기준 컬럼 배치 |
| 등록/수정 입력 | 바텀시트 (쿠폰·이벤트·공지·유저) 또는 중앙 모달(`createPortal`, 위키 3종) | 중앙 모달 (오버레이 + wrapper) |
| 상단 바 | 공용 `useSetTopBar`/`useDomainTopBar` 훅 사용 | 화면 안에 `<h1>` 직접 작성 (공용 상단바 없음) |
| 상태 분기(로딩/에러/빈 목록) | 화면마다 직접 분기 처리, 문구도 화면마다 다시 씀 | 분기 처리 자체가 없음 (빈 배열이면 표만 비어 보임) |
| 검색/필터 | 있음 (칩 방식) | 없음 |
| 데이터 연동 | Redux Thunk(쿠폰·이벤트·공지·유저) 또는 react-query 스타일 훅(위키 3종) — **같은 (가) 안에서도 방식이 갈림** | Redux `useSelector` 직접 참조 |
| 삭제 확인 | 있는 화면도, 없는 화면도 있음 (화면마다 다름) | 없음 (체크박스로 상태만 바꿈) |
| 공용 부품 재사용 | 화면마다 자체 `FormModal`/`ConfirmModal`을 파일 안에 다시 정의 (위키 3종) | `useTableModal` 공용 훅을 쓰려 하지만 파일이 존재하지 않음 (아래 참고) |

## 반복되는 문제 (추정 — "매번 개박살난다"의 코드적 근거)

1. **공용 부품이 없어 화면마다 새로 만듦** — 검색창, 필터 칩, 바텀시트, 로딩/에러/빈 상태 문구가 `AdminCouponScreen.jsx`(222줄), `AdminEventScreen.jsx`(233줄), `AdminNoticeScreen.jsx`(232줄)에 각각 처음부터 다시 작성돼 있다. 각 파일의 스타일시트(`.module.scss`)에도 `.toolbar`, `.searchInput`, `.chip`, `.sheet`, `.overlay`, `.form`, `.label`, `.submitBtn` 등 거의 같은 이름의 클래스가 파일마다 30개 안팎 따로 정의돼 있다 (`AdminCouponScreen.module.scss` 30개, `AdminEventScreen.module.scss` 33개, `AdminNoticeScreen.module.scss` 32개). 한 곳의 스타일이나 동작을 고쳐도 나머지 화면엔 반영되지 않는 구조다. — **추정**

2. **모달 컴포넌트가 화면 파일 안에 그대로 복사돼 있음** — 위키 관리 3개 화면(`AdminWikiPitchScreen.jsx`, `AdminWikiPitchGradeScreen.jsx`, `AdminWikiStatInfluenceScreen.jsx`)은 각자 파일 맨 아래에 `function FormModal(...)`, `function ConfirmModal(...)`을 똑같이 다시 작성해 넣었다. 공용 컴포넌트로 분리돼 있지 않아 3곳에 사실상 같은 코드가 있다. — **실측 확인** (3개 파일 모두에서 동일 함수명·구조 확인)

3. **불러오다 만 공용 부품** — `global/ui/visibleToggle/VisibleToggle.jsx` 라는 "노출 켜기/끄기" 공용 토글 컴포넌트가 이미 만들어져 있지만, 검색해보면 **자기 자신 외에는 어디서도 쓰이지 않는다.** 정작 노출 토글이 필요한 5개 관리 화면(쿠폰·이벤트·공지·유저·위키)은 전부 자기 화면 안에서 토글 UI를 다시 만들었다. — **실측 확인**

4. **깨진 참조(import)를 그대로 쓰고 있음** — `community` 관리자 화면의 `BoardAdminTable.jsx`, `PostAdminTable.jsx`는 `@/global/hooks/useTableModal.js`를 불러오는데, 이 파일은 저장소 어디에도 존재하지 않는다(검색 결과 0건). 반면 같은 계열의 `TagAdminTable.jsx`는 이 훅을 안 쓰고 자기 안에서 `useState`로 직접 모달 상태를 관리한다 — 같은 화면 묶음 안에서도 방식이 갈려 있다. — **실측 확인**

5. **가짜 데이터를 그대로 화면에 심어둠** — `CommentAdminTable.jsx`는 실제 API 호출 없이 파일 안에 `MOCK_COMMENTS` 배열을 하드코딩해 그대로 표에 보여준다. 완성된 것처럼 보이지만 실제로는 동작하지 않는다. — **실측 확인**

6. **화면 하나가 라우터에 연결도 안 된 채로 커밋됨** — 가장 최근 커밋(`AdminDashboardScreen 신규 (미완)`)으로 추가된 `AdminDashboardScreen.jsx`는 "모든 관리 화면의 뒤로가기가 여기로 돌아온다"는 주석까지 있지만, 실제 라우터 파일(`AdminRoutes.jsx`)에는 등록돼 있지 않다. `community` 관리자 진입점(`AdminCommunityPage.jsx`)도 마찬가지로 라우터 미등록 상태다. 화면은 만들어졌는데 실제로 켜보면 안 뜨는 상태가 반복되는 것으로 보인다. — **실측 확인 + 추정(원인)**

7. **같은 스타일시트를 복붙 후 확장** — `.../post/AdminTable.module.scss`는 `.../board/AdminTable.module.scss`를 그대로 복사한 뒤 뒤에 규칙을 추가한 형태다(앞부분 22줄이 동일). 공용 스타일을 나눠 쓰는 대신 파일 단위로 복제·확장하는 패턴이 이 계열에도 있다. — **실측 확인**

## 재설계 때 만들 부품 목록

위 실측에서 반복적으로 나타난, 화면마다 다시 만들어져 있는 부품들이다.

> ⚠️ PC 화면 폭 지원은 나중으로 미뤄졌다 (`responsive-foundation.md` 참고). 아래 "필요 시점" 열은 이 결정에 맞춰, 각 부품이 지금 모바일 재설계에 필요한지 / PC 폭 지원 때 가서 필요한지 구분한 것이다. 대부분 모바일에도 필요하다.

| 후보 부품 | 현재 몇 곳에 중복돼 있나 | 필요 시점 |
|---|---|---|
| 검색창 (텍스트 입력 + 클라이언트 필터) | 4곳 (쿠폰·이벤트·공지·유저) — 위키 3종·커뮤니티 3종은 아예 없음 | 모바일 (지금) |
| 필터 칩 그룹 | 4곳 (쿠폰·이벤트·공지·유저), 화면마다 필터 종류·개수 다름 | 모바일 (지금) |
| 등록/수정 입력 폼 컨테이너 (바텀시트 또는 모달) | 최소 7곳에서 각자 다시 작성 (쿠폰·이벤트·공지 바텀시트, 위키 3종 모달, 커뮤니티 3종 모달) | 모바일 (지금) |
| 목록 상태 분기 (로딩중 / 에러 / 빈 목록) | 화면마다 문구·마크업 재작성, 최소 8곳 | 모바일 (지금) |
| 노출 on/off 토글 | 5곳에서 재구현. 이미 만들어졌지만 안 쓰이는 `VisibleToggle` 컴포넌트 존재 | 모바일 (지금) |
| 삭제 확인 절차 | 있는 곳/없는 곳이 뒤섞여 있음 — 표준 패턴 없음 | 모바일 (지금) |
| 상단 관리자 메뉴 진입 허브 | `AdminDashboardScreen` 존재하나 라우터 미연결 — 정리 필요 | 모바일 (지금) |
| 표(table) ↔ 카드 목록 중 무엇을 기본형으로 할지 | (가)는 카드, (나)는 표로 서로 다름 | 모바일 (지금, 카드로 통일) — 표(table) 방식은 PC 폭 지원을 다시 하기로 할 때나 쓸 방식이라 나중 사안 |
