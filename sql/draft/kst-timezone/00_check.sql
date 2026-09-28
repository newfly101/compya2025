-- 목적: 변경 전 기준값을 남긴다 (조회만, 아무것도 바꾸지 않는다)
-- 되돌릴 수 있나: 해당 없음 (읽기 전용)
-- 실행 전 조건: 없음
-- 예상 소요: 즉시 (36테이블 컬럼 목록 + 표본 10행)

-- 1) 현재 타임존 3종 + 서버 시각 비교
SELECT @@global.time_zone   AS global_time_zone,
       @@session.time_zone  AS session_time_zone,
       @@system_time_zone   AS system_time_zone,
       NOW()                AS now_local,
       UTC_TIMESTAMP()      AS now_utc;

-- 2) 36테이블 전수 — DATETIME/TIMESTAMP 컬럼 목록 (테이블·컬럼·타입·DEFAULT·ON UPDATE)
SELECT TABLE_NAME,
       COLUMN_NAME,
       DATA_TYPE,
       COLUMN_DEFAULT,
       EXTRA
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'compyafun'
  AND DATA_TYPE IN ('datetime', 'timestamp')
ORDER BY TABLE_NAME, ORDINAL_POSITION;

-- 3) site_coupons 표본 5행 — expire_at(DATETIME) 과 created_at/updated_at(TIMESTAMP) 을 나란히
--    같은 벽시계 값으로 보이는지 눈으로 대조한다
SELECT id, expire_at, created_at, updated_at
FROM site_coupons
ORDER BY id DESC
LIMIT 5;

-- 4) site_notices 표본 5행 — published_at(DATETIME) 과 created_at/updated_at(TIMESTAMP) 대조
SELECT id, published_at, created_at, updated_at
FROM site_notices
ORDER BY id DESC
LIMIT 5;
