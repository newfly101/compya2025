-- ADR 0009 규칙 변경(2026-09-30 운영자 자가 테스트) 후 1회 정리.
-- 새 규칙: 구간 못 찾음·마감 미확인 글은 행을 만들지 않고, 수동 등록 이벤트와 짝이 맞으면 새 행 대신 그 행에 본문을 넣는다.
-- 옛 규칙으로 이미 만들어진 "자동 수집 + 아직 비공개" 초안만 지운 뒤, 새 코드로 관리자 "지금 수집" 을 누르면
-- 남은 글이 새 규칙(병합 포함)으로 다시 들어온다.
-- ⚠️ test DB = prod DB. 운영자가 직접 실행. 공개(승인)된 행·수동 등록 행은 건드리지 않는다.

-- 1) 먼저 지울 대상 확인
SELECT id, title, source_article_id, is_visible,
       content_html IS NULL                AS no_body,
       expire_at = '2099-12-31 23:59:59'   AS no_deadline,
       image_url
FROM site_events
WHERE source_article_id IS NOT NULL
  AND is_visible = FALSE
ORDER BY id;

-- 2) 확인 후 삭제
-- DELETE FROM site_events
-- WHERE source_article_id IS NOT NULL
--   AND is_visible = FALSE;

-- 3) 쿠폰 글로 만들어진 이벤트 행(공개 여부 무관) — 쿠폰 글은 이벤트가 아니라 쿠폰으로만 등록한다(2026-09-30 운영자 결정)
-- SELECT id, title, is_visible FROM site_events
-- WHERE source_article_id IS NOT NULL AND title LIKE '%쿠폰%';
-- DELETE FROM site_events WHERE source_article_id IS NOT NULL AND title LIKE '%쿠폰%';

-- 4) 이미 승인(공개)했는데 본문 없음·마감 미확인인 자동 수집 행이 있으면 1)과 같이 조회해 개별 판단
-- SELECT id, title FROM site_events
-- WHERE source_article_id IS NOT NULL AND is_visible = TRUE
--   AND (content_html IS NULL OR expire_at = '2099-12-31 23:59:59');
