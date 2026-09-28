-- 목적: 02(+03)를 되돌린다 — DATETIME -> TIMESTAMP, 전역 타임존 원복
-- 되돌릴 수 있나: 이 파일 자체가 되돌리는 작업이다. 세션 타임존이 +09:00 인 상태에서 실행해야
--   저장된 벽시계 값이 보존된다(세션이 다른 타임존이면 TIMESTAMP 로 재변환될 때 값이 밀린다)
-- 실행 전 조건: 같은 세션에서 SET time_zone = '+09:00'; 을 먼저 실행
-- 예상 소요: 즉시

SET time_zone = '+09:00';

-- site_coupons
ALTER TABLE site_coupons
    MODIFY created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE site_coupons
    MODIFY updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- site_notices
ALTER TABLE site_notices
    MODIFY created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE site_notices
    MODIFY updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 03_set_global_kst.sql 을 실행했었다면 전역 설정도 원복 (OS 타임존을 그대로 따르게)
SET GLOBAL time_zone = 'SYSTEM';
