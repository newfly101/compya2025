# 커뮤니티 현황 · 재개 참고 문서

> 커뮤니티는 2026-08-31 **읽기 전용으로 재오픈**된 상태다. 글쓰기·댓글·좋아요·신고는 화면에 없다.
> 다시 손대기 전에 이 문서부터 읽을 것. (코드 실측 기준일: 2026-09-11)

---

## 1. 지금 사용자에게 보이는 것

- `/community` 진입 시 `CommunityScreen.jsx` 하나만 뜬다. 상단 카테고리 칩(게시판 목록) + 게시글 목록.
- 게시글 클릭 시 전부 **새 탭으로 외부 링크**가 열린다 (v1 이관 글이 전부 외부 링크형이라, 코드 실측).
- 화면 하단에 "글쓰기는 준비 중입니다" 문구만 있고 버튼은 없다 (코드 실측, `CommunityScreen.jsx`).
- `/community` 는 검색엔진 노출에서 **제외**돼 있다 (`infra/seo/routeSeo.js` `NOINDEX_PATHS`, 코드 실측).

## 2. 어디에 무엇이 있는가

| 영역 | 경로 | 상태 |
|---|---|---|
| 사용자 화면(현재 라우팅됨) | `web/src/domains/community/mobile/CommunityScreen.jsx` | **실제 API 연동** (mock 아님) |
| 사용자 화면 훅 | `feature/hooks/user/board/useUserBoards.js`, `feature/hooks/user/post/useUserPost.js` | 게시판 목록·게시글 목록 GET |
| PC/구버전 화면·훅 | `feature/`, `page/` 하위 전체 | README 상 "이번 모바일 작업 대상 아님" — 실사용 여부 미확인 |
| 관리자 화면 | `page/admin/AdminCommunityPage.jsx` → `feature/components/admin/CommunityManagePage.jsx` | **라우터에 미등록** (아래 § 4) |
| Redux 스토어 | `store/{api,dto,endpoints,slices}.js`, `store/thunks/*` | 게시판·글·태그 액션 정의 |
| BE 컨트롤러 | `domain/community/controller/*` (Board/Post/Comment/Tag/Reaction/Report + Admin* 8종) | 읽기 GET 엔드포인트만 실사용, 나머지는 아래 참조 |
| DB DDL | `sql/V2/site/CREATE_TABLE_SITE.sql` (site_board 부터) | 게시판·글·댓글·태그·반응·신고 8개 테이블 |
| v1→v2 이관 스크립트 | `sql/migration/V1_TO_V2_COMMUNITY.sql` | **미실행** |

## 3. 동결이 실제로 어떻게 구현돼 있는가 (코드 실측)

- 글쓰기·댓글·반응 관련 **BE 쓰기 API 자체는 살아 있다** (`CommentController`, `PostReactionController`, `ReportController` 등 컨트롤러 존재). FE 가 안 부르고 있을 뿐, 서버 차단이 아니다.
- 유저용 GET 경로(`USER_COMMUNITY`, `web/src/domains/community/store/endpoints.js`)는 2026-08-31 에 실제 컨트롤러 경로(`/api/boards`, `/api/posts/boards/{id}`)에 맞춰 **고쳐졌다** — 주석에 "기존 `/community/*` 경로는 404 원인이었다" 고 남아 있다.
- 반면 관리자용 경로(`ADMIN_COMMUNITY`, 같은 파일)는 이 수정에서 **빠졌다**. `CREATE_POST: "/community/admin/posts"` 로 남아 있는데 실제 컨트롤러는 `AdminPostController` `@RequestMapping("/api/admin/posts")` 다 — **호출하면 404.** (코드 실측, 대조 확인함)
- 게시판 `write_role` 은 v1 이관 스크립트 기준 `ADMIN` 으로 시작하게 설계돼 있다 (주석 근거) — 일반 유저 글쓰기를 열려면 이 값을 `USER` 로 바꾸는 결정이 별도로 필요하다.

## 4. 미사용 / 삭제 대상 파일 (실측 — grep 으로 참조처 없음 확인)

| 파일 | 상태 |
|---|---|
| `mobile/CategoryScreen.jsx`, `.module.scss` | 파일 자체 주석에 "미사용/삭제 대상, 삭제 권한이 없어 주석만 남김" |
| `mobile/hooks/useCategoryFeed.js`, `mobile/hooks/useCommunity.js` | `CategoryScreen.jsx` 외 참조처 없음 (grep 실측) — `CategoryScreen` 이 죽었으므로 이 둘도 죽음 |
| `@/data/community/*` (mock: categories/notices/hotPosts/posts) | 위 훅들만 참조 — 같이 죽음 |
| `page/admin/AdminCommunityPage.jsx` 계열 전체 | **라우터 미등록** (`AdminRoutes.jsx` 에 community 문자열 없음, 실측) — 만들어졌지만 어디서도 진입 불가 |
| `app/page/CommunityPage.jsx` | README 상 2026-05-09 폐기, "정리 보류 중" 표시 (README 근거, 파일 직접 미확인) |

주의 — README.md(`mobile/README.md`)는 mock 데이터 시절 구조를 설명한다. **지금 라우팅되는 `CommunityScreen.jsx` 는 이미 실제 API 로 갈아탄 뒤라 README 내용과 어긋난다.** README 를 그대로 믿지 말 것.

## 5. 테이블 구조 — 역할과 관계만 (DDL 실측, 컬럼 나열 생략)

| 테이블 | 역할 |
|---|---|
| `site_board` | 게시판 정의. `write_role`(ADMIN/USER)·`read_role`(ALL/LOGIN)·`use_comment`·`use_like`·`use_tag` 로 게시판별 기능 on/off |
| `site_post` | 게시글. `author_id` 는 탈퇴 시 NULL 허용, `author_name` 은 작성 시점 닉네임을 스냅샷으로 별도 저장(탈퇴/개명 후에도 유지) |
| `site_comment` | 댓글. `parent_comment_id` 로 대댓글까지 2단계, 3단계 금지가 DDL 주석에 명시 |
| `site_tag` / `site_post_tag` | 태그 정의 및 글-태그 매핑(N:M) |
| `site_post_reaction` / `site_comment_reaction` | 좋아요/싫어요, `(대상, user_id)` UNIQUE 로 1인 1반응 강제 |
| `site_report` | 글·댓글 공용 신고. `target_type`+`target_id` 로 다형 참조, 사유 ENUM 5종 |

현재 v2 테이블 전부 **0건** — 이관 미실행이라 (문서 근거: `V1_TO_V2_COMMUNITY.sql` 상단 실측 코멘트, DB 직접 조회는 하지 않음, **미확인**).

## 6. v1 → v2 차이 (이관 스크립트 실측)

- v1 `posts` 242건 중 이관 대상은 TIP·CLUB 게시판 237건뿐(" TEST"·DPRIAN 제외, 문서 근거).
- **237건 전부 `author_type=ADMIN, author_id=1, link_type=EXTERNAL, content 0자`** — 즉 본문 없이 제목+외부URL만 있는 북마크형 글이라는 서술이 스크립트 주석에 있다. → 다시 열어도 이 237건엔 "본문 보기"가 없다. 목록에서 클릭하면 외부 링크로 튈 뿐이라는 뜻이고, 지금 FE 동작과 일치한다 (코드·문서 상호 확인함).
- 스크립트는 **작성자를 그대로(`author_id=1`) 복사**한다 — 사용자가 미리 알려준 지뢰. 몇 건인지는 위에서 확인(237건 전부).
- 댓글·반응·신고는 v1 에 대응 테이블이 없어 이관 대상에서 아예 빠진다.
- 이관 스크립트 자체가 "아직 실행되지 않았다"고 못박아 두었다 (문서 근거).

## 7. 어드민

- `CommunityManagePage.jsx` (게시판/글/태그 탭 + 모달 CRUD) 가 **코드로는 존재**하지만 `AdminRoutes.jsx` 에 등록되지 않아 **접근 경로가 없다** (실측).
- 등록하더라도 § 3 에서 확인한 API 경로 불일치 때문에 **생성/수정 호출이 그대로는 404** 난다.

---

## 8. 다시 열 때 할 일 (순서대로)

1. **관리자 API 경로부터 고친다** — `endpoints.js` 의 `ADMIN_COMMUNITY.*` 를 실제 컨트롤러(`/api/admin/posts` 등)에 맞춘다. 왜: 안 고치면 관리자 화면을 연결해도 전부 404.
2. **`postThunks.js` 의 `authorId: user.id` 를 점검한다** — 유저 테이블 개편(`docs/domain/account/prd/user-table-restructure.md`)으로 서버가 숫자 `id` 대신 `publicId` 를 내려주는 방향으로 이미 바뀌는 중이다(users 도메인 어드민 화면은 이미 `publicId` 로 전환 완료, 코드 실측). 그대로 두면 **에러 없이 작성자 없는 글이 생긴다.** 왜: 조용히 실패하는 종류라 테스트 없이는 못 잡는다.
3. **v1 이관 스크립트의 작성자 처리 방식을 다시 검토한다** — 지금 그대로 돌리면 237건이 전부 `author_id=1`(관리자 1명) 소유가 된다. 왜: "누가 쓴 글인가"가 처음부터 틀어진 채 시작한다.
4. **관리자 화면을 라우터에 올릴지 결정한다** — 지금은 코드만 있고 진입 불가. 왜: 만들어놓고 못 쓰는 상태를 방치 중.
5. **게시판 `write_role` 을 언제 `USER` 로 바꿀지 정한다** — 지금 설계는 이관 시 `ADMIN` 고정 시작이다. 왜: 이 값을 바꾸는 순간이 "회원 글쓰기 오픈" 시점이라, 인증·신고 정책이 먼저 준비돼 있어야 한다.
6. **누가 쓸 수 있는가 결정** — `read_role`(ALL/LOGIN), `write_role`(ADMIN/USER) 는 게시판별로 이미 컬럼이 있다. 게시판마다 다르게 열지 결정 필요.
7. **신고 처리 흐름 결정** — `site_report` 테이블·`AdminReportController` 는 이미 있지만 FE 소비 코드가 없다. 신고 접수 후 관리자 화면에서 어떻게 처리할지 정의 필요.
8. **SEO 재오픈 여부 결정** — `NOINDEX_PATHS` 에서 `/community` 를 뺄지는 콘텐츠 품질(§ 6, 본문 없는 외부링크 237건)이 정리된 뒤에 판단. 애드센스 반려 이력이 있었다는 서술이 이관 스크립트 주석에 있다 (문서 근거, 미확인).
9. **§ 4 의 죽은 파일 정리** — `CategoryScreen.jsx` 등은 삭제 권한 문제로 주석만 남아있다. 실제 삭제 여부 결정.

## 9. 지뢰 (모르고 건드리면 사고)

- ⚠️ **`postThunks.js` 25행 `authorId: user.id`** — 지금은 안 닿는 코드라 조용하다. 유저 개편 배포 후 가장 먼저 터진다. (§ 8-2)
- ⚠️ **`V1_TO_V2_COMMUNITY.sql` 을 검토 없이 그대로 실행** — 237건이 전부 한 사람 글이 된다. 되돌리기 SQL은 스크립트 하단에 있지만, 실행 전 반드시 작성자 처리 방식부터 다시 판단할 것. (§ 8-3)
- ⚠️ **`ADMIN_COMMUNITY.*` 엔드포인트를 안 고치고 관리자 화면부터 라우터에 연결** — 화면은 뜨는데 저장은 전부 실패해서 "버그"로 오인하기 쉽다. 원인은 경로 불일치. (§ 8-1)

## 10. 미확인으로 남긴 것

- v2 `site_board`/`site_post` 등이 실제로 0건인지는 이관 스크립트 주석 근거일 뿐, DB 를 직접 조회해 확인하지 않았다 (로컬 DB 가 운영 DB 를 터널로 보는 환경이라 쓰기·조회 자제).
- `feature/`, `page/` 하위 PC/구버전 커뮤니티 코드가 실제로 어디선가 라우팅되어 쓰이고 있는지는 확인하지 않았다.
- 애드센스 반려 사유가 정확히 이 콘텐츠 때문이었는지는 이관 스크립트 주석 서술뿐이고 별도 근거를 찾지 않았다.
