-- ============================================================
-- 03. 이벤트 이관 : events  ->  site_events
-- 대상 : 12건 (2026-08-20 운영 DB 실측)
-- 대상 DB : compyafun (MariaDB 10.5)
-- ============================================================
--
-- [ 백업 : 실행 전 반드시 ]
--   mysqldump -u{user} -p compyafun events site_events > backup_events_20260820.sql
--
-- [ 실행 방법 ]
--   mysql -u{user} -p compyafun < 03_events_to_site_events.sql
--   * --force 옵션을 붙이지 말 것. 오류가 나면 즉시 중단되어 COMMIT 에 도달하지 않는다.
--
-- [ 전제 (실측) ]
--   - 컬럼 구조가 동일하다. created_at / updated_at 만 timestamp <-> datetime 차이인데
--     값 그대로 대입되므로 별도 변환이 필요 없다
--   - 이미 넘어간 21건은 양쪽 id 가 같다
--   - events 최대 id 33 / site_events 최대 id 21 이라 id 를 그대로 승계해도 충돌이 없다
--
-- [ 멱등성 방식 ]
--   INSERT ... SELECT ... WHERE NOT EXISTS (id 기준).
--   이벤트에는 coupon_code 같은 자연 키가 없고, 기존 21건이 전부 id 가 일치하므로
--   id 를 기준으로 삼는 것이 가장 명확하다.
--   두 번 돌려도 두 번째는 0행이 들어간다.
--
-- [ 주의 ]
--   site_events 에는 chk_site_events_expire_after_start (expire_at > start_at) 제약이 있다.
--   구 데이터에 이 조건을 어기는 행이 있으면 INSERT 가 통째로 실패한다.
--   [1-3] 에서 미리 확인한다.
--
-- ============================================================

SET NAMES utf8mb4;

-- ============================================================
-- [1] 실행 전 확인
-- ============================================================

-- 1-1. 현재 건수  (기대값 : events 33 / site_events 21)
SELECT
    (SELECT COUNT(*) FROM events)      AS `events_현재`,
    (SELECT COUNT(*) FROM site_events) AS `site_events_현재`;

-- 1-2. 이관 대상 건수  (기대값 : 12)
SELECT COUNT(*) AS `이관대상`
FROM events e
WHERE NOT EXISTS (SELECT 1 FROM site_events s WHERE s.id = e.id);

-- 1-3. 기간 제약 위반 확인  (기대값 : 0)
--      0 이 아니면 해당 행을 먼저 바로잡고 이관할 것.
SELECT COUNT(*) AS `기간제약_위반`
FROM events e
WHERE NOT EXISTS (SELECT 1 FROM site_events s WHERE s.id = e.id)
  AND e.expire_at <= e.start_at;

-- 1-4. 필수값 누락 확인  (기대값 : 0. title / image_url / 기간은 NOT NULL 이다)
SELECT COUNT(*) AS `필수값_누락`
FROM events e
WHERE NOT EXISTS (SELECT 1 FROM site_events s WHERE s.id = e.id)
  AND (e.title IS NULL OR e.image_url IS NULL OR e.start_at IS NULL OR e.expire_at IS NULL);

-- 1-5. 롤백용 id 목록 미리 확보  (결과를 복사해 파일 하단 롤백 구문에 붙여 넣는다)
SELECT GROUP_CONCAT(e.id ORDER BY e.id) AS `이관대상_id_목록`
FROM events e
WHERE NOT EXISTS (SELECT 1 FROM site_events s WHERE s.id = e.id);


-- ============================================================
-- [2] 이관
--     created_at / updated_at 은 대상 컬럼이 NOT NULL 이라
--     혹시 값이 비어 있으면 현재 시각으로 채운다 (실측상 해당 없음).
-- ============================================================

START TRANSACTION;

INSERT INTO site_events
    (id, event_type, title, start_at, expire_at, image_url, external_link,
     is_visible, created_at, updated_at)
SELECT
    e.id,
    e.event_type,
    e.title,
    e.start_at,
    e.expire_at,
    e.image_url,
    e.external_link,
    e.is_visible,
    COALESCE(e.created_at, NOW()),
    COALESCE(e.updated_at, NOW())
FROM events e
WHERE NOT EXISTS (SELECT 1 FROM site_events s WHERE s.id = e.id);
-- 기대 : 12 rows affected

COMMIT;


-- ============================================================
-- [3] AUTO_INCREMENT 보정
--     ALTER 는 자동 커밋되므로 반드시 COMMIT 뒤에 둔다.
--     기대값 : 34 (site_events 최대 id 33 + 1)
-- ============================================================
SELECT COALESCE(MAX(id), 0) + 1 INTO @next_ai FROM site_events;
SET @sql := CONCAT('ALTER TABLE site_events AUTO_INCREMENT = ', @next_ai);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT @next_ai AS `설정된_AUTO_INCREMENT`;


-- ============================================================
-- [4] 실행 후 검증
-- ============================================================

-- 4-1. 총 건수  (기대값 : 33 / 33 — 두 값이 같아야 정상)
SELECT
    (SELECT COUNT(*) FROM events)      AS `events`,
    (SELECT COUNT(*) FROM site_events) AS `site_events`;

-- 4-2. 아직 안 넘어간 이벤트  (기대값 : 0)
SELECT COUNT(*) AS `미이관_잔여`
FROM events e
WHERE NOT EXISTS (SELECT 1 FROM site_events s WHERE s.id = e.id);

-- 4-3. 값이 어긋난 이벤트  (기대값 : 0행)
SELECT e.id, e.title
FROM events e
JOIN site_events s ON s.id = e.id
WHERE NOT (e.title <=> s.title)
   OR NOT (e.event_type <=> s.event_type)
   OR NOT (e.start_at <=> s.start_at)
   OR NOT (e.expire_at <=> s.expire_at)
   OR NOT (e.image_url <=> s.image_url)
   OR NOT (e.external_link <=> s.external_link)
   OR NOT (e.is_visible <=> s.is_visible);

-- 4-4. 제목 중복  (참고용. 제약은 없지만 중복 등록을 눈으로 확인한다)
SELECT title, COUNT(*) AS cnt
FROM site_events
GROUP BY title
HAVING cnt > 1;

-- 4-5. 노출 여부 / 유형 분포  (참고용)
SELECT event_type, is_visible, COUNT(*) AS cnt
FROM site_events
GROUP BY event_type, is_visible;


-- ============================================================
-- [5] 롤백 방법
-- ============================================================
--
-- 방법 1 (가장 확실) : 백업 덤프 복원
--   mysql -u{user} -p compyafun < backup_events_20260820.sql
--
-- 방법 2 : [1-5] 에서 뽑아 둔 id 목록으로 지우기
--   -- DELETE FROM site_events WHERE id IN ( 여기에 1-5 결과 붙여넣기 );
--
-- 방법 3 : 이관 직후, 그 사이 신규 이벤트 등록이 없었다면 (실측 기준 id 22 이상이 이관분)
--   -- DELETE FROM site_events WHERE id BETWEEN 22 AND 33;
--   ! 이관 전 site_events 최대 id 가 21 이었다는 실측에 기댄 방법이다.
--     실행 전에 [1-5] 목록과 대조할 것.
-- ============================================================
