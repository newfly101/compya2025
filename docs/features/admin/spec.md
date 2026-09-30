---
feature: admin
version: 1.5.0
status: active
created: 2026-01-29
updated: 2026-09-30
---

# admin

## 1. 무엇을 하는 기능인가

운영자(관리자 권한 1명) 전용 셸이다. 콘텐츠 도메인(퀴즈·이벤트·쿠폰·공지·유저) 관리 화면과 캐시 재적용 운영 기능을 탭 하나로 오가며 쓴다. `admin` 자체는 전용 데이터를 갖지 않고, 각 콘텐츠 도메인의 관리 화면을 셸 안에 배치하는 역할만 한다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 어드민 셸(홈·퀴즈·이벤트·쿠폰·공지·유저·통계·동기화 8탭) | `/admin`, `/admin/:tab` | 로그인 후(ADMIN 권한) 서랍 메뉴 "Admin" 1항목 클릭, 또는 주소 직접 접근/북마크 |
| 공지 글쓰기(셸을 벗어나는 유일한 예외) | `/admin/notice/write`, `/admin/notice/write/:id` | 공지 탭 "글쓰기" 클릭. 화면 자체 규칙은 공지 기능 문서 소관 |

근거: `web/src/app/router/routes/AdminRoutes.jsx:14-31`, `web/src/domains/admin/mobile/ADMIN_TABS.js:6-13`, `web/src/app/wrapper/mobile/config/MENU_GROUPS.js:37-41`.

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-ADM-01 | 셸 접근 | 로그인 + ADMIN 권한이 있어야 어드민 셸(8탭)에 접근할 수 있다 | `AdminRoutes.jsx:14-31` |
| REQ-ADM-02 | 이중 방어 | `/api/admin/**` 요청은 `SecurityConfig`(URL 레벨) + 각 컨트롤러 클래스 `@PreAuthorize`(메서드 레벨) 양쪽에서 ADMIN 권한을 검증한다 | `SecurityConfig.java:62`, `AdminUserController.java:20` |
| REQ-ADM-03 | 캐시 동기화 | 동기화 탭에서 대상 1건 또는 전체를 재시작 없이 다시 읽어올 수 있다. 대상 목록은 서버가 내려주는 순서 그대로 쓴다(FE 하드코딩 없음) | `CacheSyncController.java`, `useAdminCounts.js:18` |
| REQ-ADM-04 | 자기 보호 | 관리자는 자기 자신의 권한(role)·상태(status)를 스스로 바꿀 수 없다 | `AdminUserServiceImpl.java:74-92` |
| REQ-ADM-05 | 목록 전량 탐색 | 회원·이벤트처럼 서버가 페이지로 자르는 목록은 배지·집계를 위해 상한(1000건)까지 전량을 받는다. 상한에 닿으면 숫자 대신 배지를 숨긴다 | `useAdminCounts.js:24-34` |
| REQ-ADM-06 | 업로드 예외 순서 | `/api/upload/profile`은 로그인만 요구하는 규칙을 먼저 매칭시키고, 그 뒤에 `/api/upload/**` → ADMIN 규칙을 건다. `SecurityConfig` 안 규칙 순서가 실제 적용 여부를 바꾼다 | `SecurityConfig.java:63-66` |
| REQ-ADM-07 | 커뮤니티 모더레이션 동결 | 커뮤니티 모더레이션 6개 컨트롤러(게시판·게시글·댓글·태그연결·신고·태그)는 리디자인 전까지 클래스 레벨 `@PreAuthorize` 없이 URL 규칙 하나에만 걸린 채 진입 경로 없는 동결 상태를 유지한다 | `AdminBoardController.java` 등 6개, `SecurityConfig.java:53-68` |
| REQ-ADM-08 | 통계 탭 | 통계 탭은 기간(오늘·7일·30일·임의 기간)을 선택해 순방문자·페이지뷰·이벤트 종류별 건수·상위 경로(+순방문자·재방문율)·기기 비율·세션당 페이지뷰·신규/재방문 비율·가입 전환율·외부 유입 상위·일별 추이·시간대별 분포(최근 3개월)를 본다. "오늘"은 원본 이벤트 테이블을, 그 외 기간은 일별 집계 테이블을 조회한다(당일 미집계). 운영자는 날짜를 지정해 재집계할 수 있다(미래·서비스 시작일 이전 날짜는 거부) | `AdminAnalyticsController.java`, `AnalyticsAggregationServiceImpl.java` |
| REQ-ADM-09 | 카페 수집 | ADMIN 전용 `POST /api/admin/cafe-sync` 로 수동 실행한다(매일 11:01 스케줄과 같은 코드, 동시 실행 시 409). `/api/admin/**` 경로 + 클래스 레벨 `hasRole('ADMIN')` 이중 방어. 이벤트 탭의 "지금 수집" 버튼이 호출한다 | `AdminCafeSyncController.java` |
| REQ-ADM-10 | 검색어 수집 정비 | 검색창이 있는 화면은 검색어 추적 훅을 연결하고, 화면을 벗어날 때 남은 입력을 즉시 전송한다 | `useSearchTracking.js` |
| REQ-ADM-11 | country/city 수집 | 이벤트 저장 시 GeoIP(MaxMind GeoLite2)로 국가·도시를 추정해 저장한다. 조회용 DB 파일이 없으면 country/city 는 비운 채 계속 저장한다 | `GeoIpService.java` |
| REQ-ADM-12 | item_id 정리 | 콘텐츠 식별은 `content_id` 로 일원화하고 `item_id` 컬럼은 삭제한다 | `AnalyticsEventItemRequest.java` |
| REQ-ADM-13 | 상위 경로 상세 지표 | 상위 경로 목록 각 행에 순방문자·재방문율을 함께 보여준다(오늘은 재방문율 빈칸) | `AdminAnalyticsMapper.xml` |
| REQ-ADM-14 | 임의 기간·일별 추이 | 운영자가 시작·종료일을 직접 지정할 수 있고, 일자별 방문자·페이지뷰 추이를 본다 | `AdminAnalyticsController.getTrend` |
| REQ-ADM-15 | 시간대별 분포 | 0~23시 방문 분포를 보여준다(최근 3개월 데이터만) | `AdminAnalyticsMapper.sumHourlyTrend` |
| REQ-ADM-16 | 레이아웃 개편 | 통계 지표를 개요·상위 경로·추이·방문자 구성·외부 유입 5개 카드(box)로 세로 배치하고, 상단 바로가기로 카드를 오간다. 기간은 오늘·특정 일자·기간 3버튼이며 모든 카드가 같은 기간을 따른다 | `AdminAnalyticsTab.jsx` |
| REQ-ADM-17 | 기간 방문자 정확도 | 7일·30일 순방문자를 근사치가 아니라 정확한 값으로 계산한다 | `AdminAnalyticsMapper.sumRangeVisitors` |
| REQ-ADM-18 | 세션당 페이지뷰 통일 | 오늘·기간 모두 같은 중복 제거 기준으로 세션당 페이지뷰를 계산한다 | `AdminAnalyticsMapper.sumTodaySessionStats` |
| REQ-ADM-19 | 신규/재방문 구분 | 방문자를 신규·재방문으로 나눠 비율을 보여준다 | `AdminAnalyticsMapper.sumVisitorComposition` |
| REQ-ADM-20 | 원본 보관정책 | 원본 이벤트는 3개월만 보관하고, 그 이후는 매달 자동으로 정리한다(집계 테이블은 영구 보관) | `RetentionPartitionServiceImpl.java` |
| REQ-ADM-21 | 재집계 날짜 검증 | 미래 날짜나 서비스 시작일 이전 날짜로는 재집계·기간 조회·추이 조회를 할 수 없다 | `AnalyticsDateValidator.java` |
| REQ-ADM-22 | 가입 전환율 | 익명 방문자가 나중에 회원가입으로 이어진 비율을 보여주고, 방문 당일 가입인지 이후 가입인지 구분한다 | `AnalyticsFirstSeenRepository.java` |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 전용 테이블 | 없음 | 각 콘텐츠 도메인(쿠폰·이벤트·공지·퀴즈·유저) 테이블을 그대로 관리. 권한 구분 컬럼은 `site_users.user_role`(users 도메인 소유)뿐 |
| 캐시 동기화 | `GET /api/admin/cache-sync/targets`, `POST /api/admin/cache-sync/{id}/sync`, `POST /api/admin/cache-sync/sync-all` | admin 도메인이 직접 소유하는 유일한 API. `CacheSyncServiceImpl.definitions()`가 대상을 테이블 기반으로 관리 |
| 업로드 | `/api/upload/**`(`/profile` 제외 ADMIN) | admin 패키지 소유(`UploadController`), 콘텐츠 도메인 이미지 등록에 쓰임 |
| 6개 콘텐츠 목록 조회 | 퀴즈·이벤트·쿠폰·공지·유저·캐시대상 각 1회 | 셸 마운트 시 `useAdminCounts`가 한 번만 불러와 탭 배지·홈 카드에 공급. 각 도메인 CRUD 상세는 해당 기능 문서 소관 |
| 통계 조회 | `GET /api/admin/analytics/summary?range=`(+`from/to`), `GET /api/admin/analytics/trend?from&to&granularity=`(신규), `POST /api/admin/analytics/aggregate?date=`(재집계). 테이블 `site_user_event`·`site_user_event_daily`·`site_user_event_daily_device`·`_session`·`_referrer`·`site_user_first_seen`(신규, 전부 `site_` 접두 유지 — 사용자 결정) | admin 도메인이 API 는 소유(캐시 동기화와 같은 결)하되 테이블은 analytics 도메인 소유. 상위 경로에 순방문자·재방문율, 방문자 구성에 신규/재방문·가입전환율 추가(2026-09-30). `site_user_first_seen` 신규 테이블과 `site_user_event.city` 컬럼·`item_id` 삭제는 DDL 승인만 됐고 실제 반영은 사용자 실행 대기 — 반영 전 호출 시 DB 오류 위험(§6) |

## 5. 하지 않는 것

- 개별 콘텐츠 도메인(쿠폰·이벤트·공지·퀴즈·유저)의 관리 화면 규칙(입력 항목·검증·삭제 방식 등) — 각 기능 문서가 다룬다. 이 문서는 "탭이 무엇을 여는지" 수준만 적는다
- 커뮤니티 모더레이션 화면 — `community` 동결에 따른 방치, 진입 경로 없음(§3 REQ-ADM-07)
- 관리자 권한을 부여·회수하는 절차 자체 — 코드에 없음(DB 직접 변경), 기획 공백
- 캐시 TTL·만료 정책 변경 — 운영 설정 승인 사안, 코드 범위 밖
- country 수집을 CloudFront 경유(CDN 앞단)로 바꾸는 배포 구조 변경 — GeoIP 채택으로 대체, 인프라 변경은 범위 밖
- 원본 이벤트 보관기간을 3개월보다 세분화하는 이벤트 종류별 차등 보관 — 전종류 동일 3개월

## 6. 확인 필요

- ❓ `spring.cache.type=simple`이라 캐시 만료 정책이 없다(TTL 0건). 운영 설정 변경은 승인권자 결정 사안
- ❓ 로컬 개발 실행 환경 설정(`application-local.properties`) 공급 방식 미정 — 코드 문제가 아니라 운영 방식 결정
- 🟨 회원·이벤트 전량 조회 상한을 1000건으로 잡았다(REQ-ADM-05). 회원 545명 기준으로는 충분하나, 그 이상으로 늘면 총건수를 알려주는 별도 API가 필요하다(코드에 `ponytail:` 주석으로 남김, `useAdminCounts.js:28`)
- 🟨 재방문율은 "기간 내 2일 이상 방문"으로, 가입 전환 데이터는 "쓰기 시점 채움" 방식으로 가정했다
- 🟨 box peek 폭(320px) 등 통계 탭 레이아웃 세부 수치는 임시값 — designer 트랙에서 확정
- ⚠️ `site_user_first_seen` 신규 테이블·`site_user_event.city` 컬럼 추가·`item_id` 삭제·월별 파티션 전환 DDL 스크립트 4건은 `sql/v.2.0.0/`에 작성 완료됐고 실행만 사용자 대기 상태다 — 실행 전까지 이번 라운드 신규 지표(재방문율·신규/재방문·가입전환·GeoIP)는 호출 시 DB 오류가 난다(history.md 2026-09-30 참고)
