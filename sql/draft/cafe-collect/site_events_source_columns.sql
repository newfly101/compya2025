-- ADR 0009 공식 카페 이벤트·쿠폰 자동 수집 — site_events 원문 추적 컬럼 4개
-- 승인: 운영자 2026-09-30 ("물어보는 모든 항목 승인"). ⚠️ test DB = prod DB — 적용 즉시 운영 반영.
-- 적용은 운영자가 직접 실행한다(guard-ddl 훅이 세션의 DDL 실행을 막는다). 적용 후 sql/v.2.0.0/01_site.sql 에 통합하고 applied/ 로 옮긴다.
-- 모두 NULL 허용 → 기존 행·수동 등록 경로에 영향 없음.

ALTER TABLE site_events
    ADD COLUMN source_article_id BIGINT     NULL COMMENT '원문 카페 글번호 — 자동 수집 중복 방지·재확인 대상 식별' AFTER external_link,
    ADD COLUMN content_html      MEDIUMTEXT NULL COMMENT '정제된 이벤트 본문 HTML (이벤트 기간 ~ 감사합니다 구간)' AFTER source_article_id,
    ADD COLUMN content_hash      CHAR(64)   NULL COMMENT '원문 구간 SHA-256 — 원문 변경 감지' AFTER content_html,
    ADD COLUMN synced_at         DATETIME   NULL COMMENT '마지막 수집 시각 (KST)' AFTER content_hash,
    ADD UNIQUE KEY uk_site_events_source_article (source_article_id);

-- 되돌리기
-- ALTER TABLE site_events
--     DROP INDEX uk_site_events_source_article,
--     DROP COLUMN synced_at, DROP COLUMN content_hash, DROP COLUMN content_html, DROP COLUMN source_article_id;
