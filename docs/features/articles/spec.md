---
feature: articles
version: 0.1.0
status: active
created: 2026-10-17
updated: 2026-10-17
---

# 공략 글 (articles)

## 1. 무엇을 하는 기능인가

운영자가 어드민에서 이미지와 설명이 들어간 초보자용 공략 글을 쓰고 발행한다. 이용자는 카테고리별로 글을 훑고 글마다 고유 주소로 읽는다. 구글 애드센스가 "자체 콘텐츠 부족"으로 승인하지 않아서 만든다. 그래서 글 상세는 빌드 때 미리 HTML 로 구워(prerender, 사전 렌더) 크롤러가 본문을 바로 읽게 한다.

기존 `guides`(정적 12편, 사이트 사용법 도움말)는 그대로 둔다. 이 기능은 운영자가 계속 늘려 가는 글이고 DB 에 저장한다. 이름과 위치는 아래 6번의 🟨 가정이다.

| 비교 | guides (기존) | articles (신규) |
|---|---|---|
| 저장 | 코드 안 구조화 객체 | DB 에 HTML 본문 |
| 추가 방법 | 코드 수정 + 배포 | 어드민에서 작성, 배포 없이 발행 |
| 본문 HTML | 금지 (REQ-GD-04) | 허용 — 살균 후 `RichContent` 로 렌더 |

## 2. 화면과 진입 경로

SC 번호는 `docs/overview/domain.md` 의 다음 번호(SC-19) 를 쓴다. 🟨 가정.

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 공략 목록 (SC-19-01) | `/articles`, 카테고리 필터는 `/articles?category={slug}` | 홈 메뉴·서랍, 가이드 목록 하단 링크, 각 도메인 화면 내부 링크 |
| 공략 상세 (SC-19-02) | `/articles/:slug` | 목록 카드, 다른 글의 같은 카테고리·태그 링크 |
| 관리자 — 공략 목록/관리 (SC-01-01 내부 탭) | `/admin/article` | 관리자 셸 상단 탭 (탭 이름 후보 "인사이트", 6번 ❓) |
| 관리자 — 공략 글쓰기 (SC-19-03) | `/admin/article/write`, `/admin/article/write/:id` | 관리자 공략 목록의 글쓰기·수정 버튼 (공지 글쓰기 SC-04-03 과 같은 전체 페이지 방식) |
| 관리자 — 카테고리 관리 | 관리자 공략 목록 안 보조 영역 | 같은 탭. 별도 화면 번호 없음 🟨 |

탭 추가 위치: `web/src/domains/admin/mobile/ADMIN_TABS.js`. 현재 순서가 "공지 · 유저 · 통계 · 동기화" 라 공지 바로 뒤에 둔다 🟨.

## 3. 규칙

ID 약어 `ART` 🟨 (traceability 표에 아직 없음).

### 3.1 공개 화면

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-ART-01 | 노출 조건 | 공개 목록·상세는 `is_visible = TRUE` 인 글만. 숨긴 글의 주소로 들어가면 404 안내 | 공지 REQ-NTC-01 선례 |
| REQ-ART-02 | 목록 구성 | 카드에 대표 이미지·제목·요약·카테고리·작성일. 최신순. 카테고리 필터는 "전체 + 카테고리 칩". 본문은 목록 응답에서 뺀다 | 공지 REQ-NTC-07 선례 |
| REQ-ART-03 | 상세 주소 | `/articles/:slug`. slug 는 영문 소문자·숫자·하이픈. 글마다 유일. 한 번 발행한 slug 는 수정해도 바뀌지 않는 것이 기본 🟨 (바뀌면 검색 노출이 끊김) | 공지는 제목 기반 slug 에 id 접미어(REQ-NTC-06) — 한글 제목이 잦은 이 사이트에선 운영자가 직접 입력하는 방식이 더 안정적 🟨 |
| REQ-ART-04 | 상세 구성 | 제목 · 카테고리 · 작성/수정일 · 대표 이미지 · 본문 · 태그 칩 · 같은 카테고리 링크 · 하단에 관련 도메인 화면 링크(예: 마일리지, 레전드 재료) | 내부 링크가 체류와 크롤링에 도움 |
| REQ-ART-05 | 메타 정보 | 상세 `<title>` = "제목 \| 컴프야펀", `meta description` = 요약(없으면 본문 앞 120자), `og:image` = 대표 이미지. 목록은 고정 문구 | `web/src/infra/seo/routeSeo.js` 방식 따름 |
| REQ-ART-06 | 본문 렌더 | 저장된 HTML 을 `RichContent` 로 렌더. 렌더 시 DOMPurify 로 다시 살균, `<a>` 는 `target="_blank"` + `rel="noopener noreferrer"` 강제 (guides 의 HTML 금지와 다른 점) | `RichContent.jsx`, 공지 REQ-NTC-09·10 |
| REQ-ART-07 | 이미지 접근성 | 본문 이미지는 `alt` 입력을 권장하고 대표 이미지는 `alt`(기본값 = 제목)를 가진다. 이미지는 지연 로딩, 가로 폭 480 에 맞춰 축소 | 접근성 + 검색 이미지 노출 |
| REQ-ART-08 | 광고 | 상세는 본문 끝 1개, 목록은 하단 1개 (`fe-ads.md` § 2 룰 1·2·7). 로딩·오류·빈 상태에서는 슬롯 없음. 슬롯 상수 추가와 § 3 인벤토리 갱신 필수 | `.claude/rules/fe/fe-ads.md` |
| REQ-ART-09 | 빈 상태·오류 | 글 0건, 조회 실패는 `StateBox`. 공개 화면은 어드민 상태와 섞지 않는다 | 공지 REQ-NTC-05·08 |

### 3.2 크롤러 대응 (애드센스 핵심)

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-ART-10 | 상세 사전 렌더 | 빌드 때 공개 글 목록 API 를 받아 `/articles/{slug}` 를 모두 사전 렌더한다. 실패 시 재시도 후 글 상세만 건너뛰고 정적 라우트는 계속 (공지와 같은 방식) | `web/scripts/prerender.mjs`, `notice-source.mjs` |
| REQ-ART-11 | 사전 렌더 대상 공유 | `article-source.mjs` 신규 — 공개 글 목록 조회·필터를 한 곳에 둬서 사이트맵 글 목록 = 사전 렌더 글 목록이 항상 같게 한다 | `notice-source.mjs` 방식 |
| REQ-ART-12 | 사이트맵 | `/articles` 와 각 `/articles/{slug}` 를 `sitemap.xml` 에 넣는다. `lastmod` = 수정일 | `web/scripts/generate-sitemap.mjs` |
| REQ-ART-13 | 목록 사전 렌더 | `/articles` 도 정적 라우트로 사전 렌더, 카드 링크를 기다리는 선택자 추가 | `prerender.mjs` DATA_ROUTES 방식 |
| REQ-ART-14 | 새 글 반영 시점 | 어드민에서 발행해도 사전 렌더 HTML 은 다음 배포(빌드) 때 갱신된다. 화면은 접속 후 API 로 최신 목록을 다시 받는다. 발행 즉시 반영이 필요하면 재빌드 트리거를 따로 정한다 ❓ | 정적 사이트 구조의 한계 |

### 3.3 어드민

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-ART-15 | 권한 🔴 | 작성·수정·삭제·노출 토글·카테고리/태그 변경·이미지 업로드는 ADMIN 만. 공개 조회는 누구나 | `AdminNoticeController` 클래스 레벨 권한 선례 |
| REQ-ART-16 | 글 입력 | 제목(필수) · slug(필수, 유일) · 요약(선택, 160자) · 본문(필수) · 대표 이미지(필수 🟨) · 카테고리(1개 필수) · 태그(0~5개) · 노출 여부 | 6번 🟨 |
| REQ-ART-17 | 에디터 | 기존 `global/ui/richEditor/RichEditor.jsx` 재사용. 별도 에디터를 새로 만들지 않는다 | 공지 글쓰기 |
| REQ-ART-18 | 저장 시 살균 | 서버가 저장 전에 먼저 살균(`Jsoup Safelist.relaxed()`)하고, 그다음 빈 본문 여부를 검증한다 (순서 고정). `<img>` 의 `src` 는 우리 이미지 저장소 주소만 허용 🟨 | 공지 REQ-NTC-09 |
| REQ-ART-19 | 이미지 업로드 | 기존 S3 업로드 컨트롤러에 공략 전용 경로를 하나 추가(예: `POST /api/upload/articles`). 파일 형식·용량 제한은 기존 업로드와 같거나 더 엄격하게. 저장 폴더는 `articles/` 로 분리 🟨 | `UploadController.java` |
| REQ-ART-20 | 노출 토글 | 목록에서 글 단위 노출/숨김 토글. 숨겨도 글은 지워지지 않는다. 새로 작성한 글의 기본값은 숨김 🟨 (임시저장 대신) | 임시저장 기능은 첫 버전 밖 |
| REQ-ART-21 | 삭제 | 삭제 전 확인 창. 삭제된 글 주소는 404. 사이트맵·사전 렌더에서도 다음 빌드부터 빠진다 | — |
| REQ-ART-22 | 카테고리 관리 | 이름 · slug · 정렬 순서 · 노출 여부. 글이 연결된 카테고리는 삭제 불가(숨김만 가능) | 데이터 일관성 |
| REQ-ART-23 | 태그 | 글 저장 시 입력한 태그 이름이 없으면 새로 만든다(별도 태그 관리 화면 없음). 이름 중복은 공백·대소문자 정리 후 합친다 | 운영 단순화 🟨 |
| REQ-ART-24 | 저장 직후 반영 | 등록·수정 후 화면은 서버 응답 값을 그대로 반영한다 | 공지 REQ-NTC-14 |
| REQ-ART-25 | 캐시 | 쓰기 후 공개 목록·상세 캐시를 비운다. 커밋 전이 아니라 **커밋 후** 비우도록 구현 (공지 REQ-NTC-15 의 알려진 문제를 되풀이하지 않는다) | 공지 spec § 3 |

### 3.4 애드센스 대비 콘텐츠 기준 (🟨 전부 가정)

| ID | 항목 | 기준 |
|---|---|---|
| REQ-ART-26 | 글 1편 분량 | 본문 한글 1,200자 이상(권장 1,500~2,500자), 이미지 3장 이상(대표 포함), 소제목(h2) 3개 이상. 어드민 저장 시 강제하지 않고 작성 화면에 글자 수·이미지 수만 보여 준다 |
| REQ-ART-27 | 초기 목표 편수 | 신청 재시도 전 15편 이상, 카테고리별 3편 이상 (기획자 의견: 기존 guides 12편과 합쳐 사이트 전체 본문이 충분히 커 보이게) |
| REQ-ART-28 | 독창성 | 게임사 공지·외부 글 복사 금지. 사이트 데이터(스킬·레전드·마일리지)를 직접 해석한 내용과 직접 찍은 화면 이미지를 쓴다 |
| REQ-ART-29 | 내부 링크 | 글마다 관련 도메인 화면(마일리지·레전드 재료·스킬 백과 등) 링크를 본문에 1개 이상 넣는다 |
| REQ-ART-30 | 정책 페이지 연결 | 공략 목록·상세 하단과 푸터에서 소개(`/about`)·개인정보(`/privacy`)·문의(`/contact`)로 이동 가능해야 한다. 기존 SC-13 화면 재사용, 신규 작성 없음 |

카테고리 초안 🟨:

| 카테고리 | 이어지는 사이트 화면 |
|---|---|
| 초보 입문 | 가이드 `/guides/start`, 쿠폰, 공지 |
| 레전드·히스토리 | `/legend-stats`, `/history-mode/legend` |
| 마일리지·재화 | `/mileage` |
| 선수·스킬 | `/players`, `/skills` |
| 이벤트·쿠폰 활용 | `/events`, `/coupons` |

## 4. 데이터

DDL 은 🔴 (test = prod 같은 DB 라 실행 즉시 운영 반영). 아래는 컬럼 **가정**이며 확정이 아니다. 사용자 승인 + ops 트랙에서 `sql/` 로 별도 진행한다.

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 글 🔴 | `site_articles`(`id`, `title`, `slug` UNIQUE, `summary` nullable, `content` MEDIUMTEXT, `cover_image_url`, `cover_image_alt` nullable, `category_id` FK, `is_visible` 기본 FALSE, `created_at`, `updated_at`) | 테이블 접두 `site_` 🟨. 노출 시각(`published_at`)은 첫 버전에 두지 않음 |
| 카테고리 🔴 | `site_article_categories`(`id`, `name`, `slug` UNIQUE, `sort_order`, `is_visible`) | 글과 1:N |
| 태그 🔴 | `site_article_tags`(`id`, `name` UNIQUE) | |
| 글-태그 🔴 | `site_article_tag_map`(`article_id`, `tag_id`, PK 복합) | 다대다. 글 삭제 시 연결 행도 삭제 |
| 공개 목록 | `GET /api/articles?category={slug}` | 본문 제외, 상한 200건 🟨, 캐시 `article` |
| 공개 상세 | `GET /api/articles/{slug}` | 본문 포함, 숨김이면 404 |
| 공개 카테고리 | `GET /api/articles/categories` | 노출 카테고리 + 글 수 |
| 관리자 목록·단건 | `GET /api/admin/articles`, `GET /api/admin/articles/{id}` | ADMIN, 노출 무관 |
| 등록·수정·삭제 | `POST` `PUT /{id}` `DELETE /{id}` `/api/admin/articles` | ADMIN, 저장 시 살균 |
| 노출 토글 | `PATCH /api/admin/articles/{id}/visible` | ADMIN |
| 카테고리 CRUD | `/api/admin/articles/categories` | ADMIN |
| 이미지 업로드 | `POST /api/upload/articles` | ADMIN, 기존 `UploadController` 에 1개 추가 |
| 빌드 스크립트 | `web/scripts/article-source.mjs`(신규), `prerender.mjs`·`generate-sitemap.mjs`(수정) | REQ-ART-10~13 |
| 코드 위치 | FE `web/src/domains/articles`, BE `domain/article` | 스토어 이름 `articles` (`fe-store.md`·`domain-naming.md`) |

## 5. 하지 않는 것

- 임시저장·예약 발행 — 첫 버전에서 뺀다. 노출 토글(기본 숨김)로 대신한다
- 조회수·체류 시간 통계 — 첫 버전에서 뺀다. 이미 있는 방문 통계(통계 탭)만 쓴다
- 관련 글 추천 — 같은 카테고리·태그 링크만 둔다
- 기존 `guides` 정적 12편 수정·이전 — 그대로 유지한다. 필요하면 나중에 목록에서 두 곳을 서로 링크만 한다
- 댓글·좋아요·공유 버튼 — 목적(애드센스 콘텐츠 확충) 밖
- 태그 전용 목록 화면(`/articles/tag/..`) — 태그는 상세 화면 표시용이다

그다음 / 여유 있을 때 (순서 제안, 기획자 의견):

| 시기 | 항목 |
|---|---|
| 그다음 | 예약 발행, 임시저장, 글 발행 시 자동 재빌드 호출, 태그별 목록 |
| 여유 있을 때 | 조회수·체류 통계, 관련 글 추천, 본문 목차 자동 생성, 대표 이미지 자동 리사이즈 |

## 6. 확인 필요

| 마커 | 항목 | 가정값 |
|---|---|---|
| 🔴 | 새 테이블 4개 DDL (운영 DB 동일 인스턴스) | 위 4번 컬럼 가정만, 승인 전 실행 금지 |
| 🔴 | 작성·수정·삭제·업로드 권한 | ADMIN 만, 공개 조회는 누구나 |
| 🔴 | 업로드 경로 신설과 `<img src>` 허용 범위 (보안) | 우리 저장소 주소만 허용, 형식·용량 기존 수준 이상 |
| ❓ | 도메인 이름 | `articles` 로 가정. 대안: `strategies`(공략, 의미는 정확하나 영문이 길고 guides 와 구분이 약함), `tips`(가볍지만 글 길이를 암시 못 함), `playbook`(브랜드 느낌, 검색어와 거리). 한글 노출명은 "공략" |
| ❓ | 어드민 탭 이름 | "인사이트"는 사용자가 부른 이름. 가정: 키 `article`, 라벨 "공략" (뜻이 "인사이트"는 분석 글을 연상시켜 헷갈릴 수 있음, 기획자 의견) |
| ❓ | 발행 후 사전 렌더 반영 방법 | 다음 배포 때 갱신(REQ-ART-14). 즉시 반영이 필요하면 배포 웹훅 필요 |
| ❓ | 초기 목표 편수·분량 기준 | 15편, 1,200자, 이미지 3장 (REQ-ART-26·27) |
| 🟨 | SC 번호 | SC-19-01~03 |
| 🟨 | 약어 | `ART` |
| 🟨 | slug 입력 방식 | 운영자가 영문으로 직접 입력, 발행 후 변경 지양 |
| 🟨 | 대표 이미지 필수, 새 글 기본 숨김, 카테고리 1개 | REQ-ART-16·20 |
| 🟨 | 카테고리 초안 5개 | 3.4 표 |
| 🟨 | 목록 상한 200건 | 공지와 동일. 글이 많아지면 페이지네이션 필요 |
| 🟨 | 어드민 탭 위치 | 공지 바로 뒤 |
