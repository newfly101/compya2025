-- 목적: ADR 0007 3단계 — site_coupons/site_notices 의 TIMESTAMP 컬럼을 DATETIME 으로 통일
-- 되돌릴 수 있나: 아니오 — ALTER TABLE 은 즉시 반영된다 (되돌리려면 99_rollback.sql)
-- 실행 전 조건: 01_set_session_kst.sql 을 같은 세션에서 먼저 실행했어야 한다
-- 예상 소요: 즉시 — 대상 51행(site_coupons) + 11행(site_notices), 행수가 적어 락 시간도 짧다

-- site_coupons (51행)
ALTER TABLE site_coupons
    MODIFY created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE site_coupons
    MODIFY updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- site_notices (11행)
ALTER TABLE site_notices
    MODIFY created_at DATETIME DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE site_notices
    MODIFY updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;
