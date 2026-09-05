-- site_notices 발행일(published_at) 보정
--
-- 어드민 글쓰기 화면에 발행일 입력이 없어서 지금까지 등록된 공지는
-- published_at 이 비어 있다. 이후 등록/수정 건은 서버에서 자동으로 채우도록
-- 바꿨으니(등록 시각으로 대체), 과거 데이터만 한 번 보정한다.
--
-- ⚠️ 실행하지 말 것 — 파일만 만들어 둔다. 적용 시점은 별도 결정.

UPDATE site_notices
SET published_at = created_at
WHERE published_at IS NULL;
