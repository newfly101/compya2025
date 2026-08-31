-- v1 커뮤니티 → v2 이관
-- 작성 2026-08-31 · 실행 전 반드시 아래 내용을 읽을 것
--
-- ⚠️ 이 스크립트는 아직 실행되지 않았다. 운영자 승인 후 실행한다.
--
-- ─────────────────────────────────────────────────────────────
-- 실측 (2026-08-31 운영 DB)
--   boards   4개   TIP(팁 모아보기) · CLUB(클럽 구인) · " TEST" · DPRIAN
--   posts  242건   TIP 237 · DPRIAN 5 · CLUB 0 · TEST 0
--                  전부 author_type=ADMIN · author_id=1 · is_visible=1
--                  전부 link_type=EXTERNAL · content 0자
--   tags     6개   posts_tags 0건 (연결된 것이 없다)
--   site_board / site_post 는 0건 (비어 있음)
--
-- ⚠️ 이 글들은 본문이 없는 외부 링크 모음이다.
--    실제 내용은 네이버 카페·블로그에 있고 여기에는 제목과 URL 만 있다.
--    검색엔진에 색인시키면 "가치 없는 콘텐츠" 로 판정될 소지가 크다.
--    애드센스 심사 중에는 특히 위험하다 — 2026-08-30 반려 사유가 그것이었다.
--    → 이관하더라도 화면 공개 시 noindex 를 걸 것을 권한다.
--
-- 이관 제외
--   " TEST"(id=5)  이름 앞에 공백이 있는 테스트 게시판. 글 0건
--   DPRIAN(id=6)   테스트로 보이는 게시판. 글 5건
--   → 둘 다 뺀다. 필요하면 아래 WHERE 절을 고쳐라.
--
-- 실행 순서
--   1) 백업        mysqldump ... boards posts posts_tags tags site_board site_post
--   2) 게시판 이관  STEP 1
--   3) 글 이관      STEP 2
--   4) 검증         STEP 3 (건수 일치 확인)
-- ─────────────────────────────────────────────────────────────


-- ══════════════════════════════════════════════════
-- STEP 0. 실행 전 확인 (읽기만 — 반드시 먼저 돌려볼 것)
-- ══════════════════════════════════════════════════
SELECT 'v1 boards'  AS src, COUNT(*) FROM boards
UNION ALL SELECT 'v1 posts',      COUNT(*) FROM posts
UNION ALL SELECT 'v2 site_board', COUNT(*) FROM site_board
UNION ALL SELECT 'v2 site_post',  COUNT(*) FROM site_post;
-- site_board · site_post 가 0 이 아니면 여기서 멈추고 상황을 먼저 확인한다.


-- ══════════════════════════════════════════════════
-- STEP 1. 게시판 이관 (TIP · CLUB 만)
-- ══════════════════════════════════════════════════
-- write_role  ADMIN  운영자만 글을 쓸 수 있게 시작한다.
--                    회원 글쓰기를 열려면 쓰기 API 인증 정비가 끝난 뒤에 USER 로 바꾼다.
-- read_role   ALL    비로그인도 읽을 수 있게 한다.
-- use_comment 0      댓글은 인증 정비 후에 켠다.
INSERT INTO site_board
    (id, code, name, description, write_role, read_role,
     use_comment, use_like, use_tag, is_visible, is_deleted, sort_order,
     created_at, updated_at)
SELECT
    b.id,
    TRIM(b.code),
    TRIM(b.name),
    NULL,
    'ADMIN',
    'ALL',
    0, 0, 0,
    1, 0,
    b.id,
    NOW(), NOW()
FROM boards b
WHERE b.id IN (1, 2);   -- TIP, CLUB


-- ══════════════════════════════════════════════════
-- STEP 2. 게시글 이관 (TIP 237건)
-- ══════════════════════════════════════════════════
-- id 를 그대로 유지한다. site_post 가 비어 있어 충돌하지 않는다.
-- 카운터 컬럼(comment_count · like_count · dislike_count · report_count)은 0 으로 시작한다.
--   → v1 에 대응 데이터가 없다. view_count 만 옮긴다.
INSERT INTO site_post
    (id, board_id, author_type, author_id, author_name,
     title, content, link_type, external_url,
     is_pinned, is_visible, is_deleted,
     view_count, comment_count, like_count, dislike_count, report_count,
     created_at, updated_at)
SELECT
    p.id,
    p.board_id,
    p.author_type,
    p.author_id,
    p.author_name,
    p.title,
    COALESCE(p.content, ''),
    p.link_type,
    p.external_url,
    COALESCE(p.is_pinned, 0),
    COALESCE(p.is_visible, 1),
    0,
    COALESCE(p.view_count, 0),
    0, 0, 0, 0,
    p.created_at,
    p.updated_at
FROM posts p
WHERE p.board_id IN (1, 2)   -- TIP, CLUB 만
  AND p.is_visible = 1;


-- ══════════════════════════════════════════════════
-- STEP 3. 검증
-- ══════════════════════════════════════════════════
-- 기대값 — site_board 2건 · site_post 237건
SELECT 'site_board' AS tbl, COUNT(*) AS cnt FROM site_board
UNION ALL SELECT 'site_post', COUNT(*) FROM site_post;

-- 게시판별 분포
SELECT b.code, b.name, COUNT(p.id) AS posts
FROM site_board b LEFT JOIN site_post p ON p.board_id = b.id
GROUP BY b.id;

-- 작성자가 site_users 에 실제로 있는지 (미매칭이 0 이어야 한다)
SELECT COUNT(*) AS unmatched_author
FROM site_post p LEFT JOIN site_users u ON p.author_id = u.id
WHERE u.id IS NULL;

-- 원본과 대조 (양쪽 건수가 같아야 한다)
SELECT
    (SELECT COUNT(*) FROM posts WHERE board_id IN (1,2) AND is_visible = 1) AS v1_cnt,
    (SELECT COUNT(*) FROM site_post) AS v2_cnt;


-- ══════════════════════════════════════════════════
-- 되돌리기
-- ══════════════════════════════════════════════════
-- 원본(posts · boards)은 건드리지 않으므로 아래 두 줄이면 원상복구된다.
-- DELETE FROM site_post  WHERE id IN (SELECT id FROM posts WHERE board_id IN (1,2));
-- DELETE FROM site_board WHERE id IN (1, 2);


-- ══════════════════════════════════════════════════
-- 이관하지 않은 것
-- ══════════════════════════════════════════════════
--   tags(6) · posts_tags(0)   연결이 0건이라 옮길 것이 없다.
--                             태그를 쓰려면 site_tag 에 새로 정의하는 편이 낫다.
--   DPRIAN(5건) · TEST(0건)   테스트 게시판으로 판단해 제외했다.
--   댓글 · 반응 · 신고         v1 에 해당 테이블이 없다.
