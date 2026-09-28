-- 목적: 02(+선택 03) 실행 후 상태를 00_check.sql 결과와 대조한다
-- 되돌릴 수 있나: 해당 없음 (읽기 전용)
-- 실행 전 조건: 02_alter_timestamp_to_datetime.sql 실행 완료
-- 예상 소요: 즉시

-- 1) 00 과 같은 타임존 조회 — 03 을 실행했다면 global_time_zone 도 +09:00 이어야 한다
SELECT @@global.time_zone   AS global_time_zone,
       @@session.time_zone  AS session_time_zone,
       @@system_time_zone   AS system_time_zone,
       NOW()                AS now_local,
       UTC_TIMESTAMP()      AS now_utc;

-- 2) site_coupons/site_notices 표본 5행 재조회 — 00 의 표본과 같은 벽시계 값인지 대조
SELECT id, expire_at, created_at, updated_at
FROM site_coupons
ORDER BY id DESC
LIMIT 5;

SELECT id, published_at, created_at, updated_at
FROM site_notices
ORDER BY id DESC
LIMIT 5;

-- 3) TIMESTAMP 잔존 컬럼 0건 확인 — site_coupons/site_notices 에는 더 이상 TIMESTAMP 가 없어야 한다
SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'compyafun'
  AND TABLE_NAME IN ('site_coupons', 'site_notices')
  AND DATA_TYPE = 'timestamp';
-- 위 쿼리가 0행이면 성공
