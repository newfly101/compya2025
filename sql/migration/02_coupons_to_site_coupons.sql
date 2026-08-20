-- ============================================================
-- 02. 쿠폰 이관 : coupons  ->  site_coupons
-- 대상 : 22건 (2026-08-20 운영 DB 실측)
-- 대상 DB : compyafun (MariaDB 10.5)
-- ============================================================
--
-- [ 백업 : 실행 전 반드시 ]
--   mysqldump -u{user} -p compyafun coupons site_coupons > backup_coupons_20260820.sql
--
-- [ 실행 방법 ]
--   mysql -u{user} -p compyafun < 02_coupons_to_site_coupons.sql
--   * --force 옵션을 붙이지 말 것. 오류가 나면 즉시 중단되어 COMMIT 에 도달하지 않는다.
--
-- [ 전제 (실측) ]
--   - 컬럼 구조가 두 테이블 완전히 동일하다
--   - 이미 넘어간 28건은 coupon_code 도 id 도 양쪽이 같다
--   - coupons 최대 id 50 / site_coupons 최대 id 28 이라 id 를 그대로 승계해도 충돌이 없다
--
-- [ 멱등성 방식 ]
--   INSERT ... SELECT ... WHERE NOT EXISTS (coupon_code 기준).
--   coupon_code 가 쿠폰의 실질 식별자이고 UNIQUE 제약도 걸려 있어 기준으로 삼았다.
--   INSERT IGNORE 로도 되지만, 어떤 이유로 걸러졌는지 드러나지 않아 쓰지 않는다.
--   두 번 돌려도 두 번째는 0행이 들어간다.
--
-- ============================================================

SET NAMES utf8mb4;

-- ============================================================
-- [1] 실행 전 확인
-- ============================================================

-- 1-1. 현재 건수  (기대값 : coupons 50 / site_coupons 28)
SELECT
    (SELECT COUNT(*) FROM coupons)      AS `coupons_현재`,
    (SELECT COUNT(*) FROM site_coupons) AS `site_coupons_현재`;

-- 1-2. 이관 대상 건수  (기대값 : 22)
SELECT COUNT(*) AS `이관대상`
FROM coupons c
WHERE NOT EXISTS (SELECT 1 FROM site_coupons s WHERE s.coupon_code = c.coupon_code);

-- 1-3. id 충돌 확인  (기대값 : 0)
--      이관 대상의 id 를 site_coupons 쪽에서 다른 쿠폰이 쓰고 있는지 본다.
--      0 이 아니면 여기서 멈추고 확인할 것.
SELECT COUNT(*) AS `id_충돌`
FROM coupons c
WHERE NOT EXISTS (SELECT 1 FROM site_coupons s WHERE s.coupon_code = c.coupon_code)
  AND EXISTS     (SELECT 1 FROM site_coupons x WHERE x.id = c.id);

-- 1-4. 롤백용 id 목록 미리 확보  (결과를 복사해 파일 하단 롤백 구문에 붙여 넣는다)
SELECT GROUP_CONCAT(c.id ORDER BY c.id) AS `이관대상_id_목록`
FROM coupons c
WHERE NOT EXISTS (SELECT 1 FROM site_coupons s WHERE s.coupon_code = c.coupon_code);


-- ============================================================
-- [2] 이관
-- ============================================================

START TRANSACTION;

INSERT INTO site_coupons
    (id, coupon_code, title, detail, expire_at, is_visible, created_at, updated_at)
SELECT
    c.id,
    c.coupon_code,
    c.title,
    c.detail,
    c.expire_at,
    c.is_visible,
    c.created_at,
    c.updated_at
FROM coupons c
WHERE NOT EXISTS (SELECT 1 FROM site_coupons s WHERE s.coupon_code = c.coupon_code);
-- 기대 : 22 rows affected

COMMIT;


-- ============================================================
-- [3] AUTO_INCREMENT 보정
--     ALTER 는 자동 커밋되므로 반드시 COMMIT 뒤에 둔다.
--     기대값 : 51 (site_coupons 최대 id 50 + 1)
-- ============================================================
SELECT COALESCE(MAX(id), 0) + 1 INTO @next_ai FROM site_coupons;
SET @sql := CONCAT('ALTER TABLE site_coupons AUTO_INCREMENT = ', @next_ai);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT @next_ai AS `설정된_AUTO_INCREMENT`;


-- ============================================================
-- [4] 실행 후 검증
-- ============================================================

-- 4-1. 총 건수  (기대값 : 50 / 50 — 두 값이 같아야 정상)
SELECT
    (SELECT COUNT(*) FROM coupons)      AS `coupons`,
    (SELECT COUNT(*) FROM site_coupons) AS `site_coupons`;

-- 4-2. 아직 안 넘어간 쿠폰  (기대값 : 0)
SELECT COUNT(*) AS `미이관_잔여`
FROM coupons c
WHERE NOT EXISTS (SELECT 1 FROM site_coupons s WHERE s.coupon_code = c.coupon_code);

-- 4-3. coupon_code 중복  (기대값 : 0행)
SELECT coupon_code, COUNT(*) AS cnt
FROM site_coupons
GROUP BY coupon_code
HAVING cnt > 1;

-- 4-4. id 가 어긋난 쿠폰  (기대값 : 0행. 코드가 같은데 id 가 다르면 여기 잡힌다)
SELECT c.id AS `coupons_id`, s.id AS `site_coupons_id`, c.coupon_code
FROM coupons c
JOIN site_coupons s ON s.coupon_code = c.coupon_code
WHERE c.id <> s.id;

-- 4-5. 값이 어긋난 쿠폰  (기대값 : 0행. 제목/만료일/노출여부 대조)
SELECT c.coupon_code
FROM coupons c
JOIN site_coupons s ON s.coupon_code = c.coupon_code
WHERE NOT (c.title <=> s.title)
   OR NOT (c.detail <=> s.detail)
   OR NOT (c.expire_at <=> s.expire_at)
   OR NOT (c.is_visible <=> s.is_visible);

-- 4-6. 노출 여부 분포  (참고용)
SELECT is_visible, COUNT(*) AS cnt FROM site_coupons GROUP BY is_visible;


-- ============================================================
-- [5] 롤백 방법
-- ============================================================
--
-- 방법 1 (가장 확실) : 백업 덤프 복원
--   mysql -u{user} -p compyafun < backup_coupons_20260820.sql
--
-- 방법 2 : [1-4] 에서 뽑아 둔 id 목록으로 지우기
--   -- DELETE FROM site_coupons WHERE id IN ( 여기에 1-4 결과 붙여넣기 );
--
-- 방법 3 : 이관 직후, 그 사이 신규 쿠폰 등록이 없었다면 (실측 기준 id 29 이상이 이관분)
--   -- DELETE FROM site_coupons WHERE id BETWEEN 29 AND 50;
--   ! 이관 전 site_coupons 최대 id 가 28 이었다는 실측에 기댄 방법이다.
--     실행 전에 [1-4] 목록과 대조할 것.
-- ============================================================
