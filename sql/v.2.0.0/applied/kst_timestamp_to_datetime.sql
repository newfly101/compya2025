-- 이미 반영됨 · 재실행 금지 — 반영일 2026-09-28 (사용자 직접 실행, TIMESTAMP 잔존 0건 확인)
-- 원본: sql/draft/kst-timezone/01_set_session_kst.sql + 02_alter_timestamp_to_datetime.sql (ADR 0007 3단계)
-- 빈 DB 재현 시에는 불필요 — 01_site.sql 이 이미 DATETIME 이다.

SET time_zone = '+09:00';   -- TIMESTAMP→DATETIME 변환은 세션 타임존으로 해석된다. 같은 세션에서 아래를 이어 실행했다

ALTER TABLE site_coupons MODIFY created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE site_coupons MODIFY updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE site_notices MODIFY created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE site_notices MODIFY updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
