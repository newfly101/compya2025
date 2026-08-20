-- ============================================================
-- 01. 회원 이관 : users + user_roles  ->  site_users
-- 대상 : 182명 (2026-08-20 운영 DB 실측)
-- 대상 DB : compyafun (MariaDB 10.5)
-- ============================================================
--
-- [ 백업 : 실행 전 반드시 ]
--   mysqldump -u{user} -p compyafun users user_roles site_users > backup_users_20260820.sql
--
-- [ 실행 방법 ]
--   mysql -u{user} -p compyafun < 01_users_to_site_users.sql
--   * --force 옵션을 붙이지 말 것. 배치 실행은 오류가 나면 즉시 중단되므로
--     COMMIT 에 도달하지 못하고 세션 종료와 함께 롤백된다.
--
-- [ 멱등성 방식 ]
--   INSERT ... SELECT ... WHERE NOT EXISTS (oauth 키 기준) 을 쓴다.
--   - INSERT IGNORE 는 PK 충돌과 UNIQUE 충돌을 똑같이 조용히 삼켜서
--     아래 "id 충돌 1건" 문제를 덮어버리기 때문에 쓰지 않는다.
--   - REPLACE 는 기존 123명의 행을 지웠다 다시 넣는 셈이라 위험해서 쓰지 않는다.
--   같은 스크립트를 두 번 돌려도 두 번째는 0행이 들어간다.
--
-- ============================================================

SET NAMES utf8mb4;

-- ============================================================
-- [1] 실행 전 확인
-- ============================================================

-- 1-1. 현재 건수  (기대값 : users 305 / user_roles 305 / site_users 123)
SELECT
    (SELECT COUNT(*) FROM users)      AS `users_현재`,
    (SELECT COUNT(*) FROM user_roles) AS `user_roles_현재`,
    (SELECT COUNT(*) FROM site_users) AS `site_users_현재`;

-- 1-2. 이관 대상 총 건수  (기대값 : 182)
SELECT COUNT(*) AS `이관대상_전체`
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM site_users s
    WHERE s.oauth_provider    = u.provider
      AND s.oauth_provider_id = u.provider_id
);

-- 1-3. id 승계 가능분 / id 충돌분 분리 확인  (기대값 : 181 / 1)
--      충돌이란, 옮기려는 users.id 를 site_users 쪽에서 이미 다른 회원이 쓰고 있는 경우다.
--      실측상 users.id=123 회원 1명이 여기 해당한다.
--      site_users.id=123 자리는 users.id=223 회원이 이미 점유하고 있다.
SELECT
    SUM(CASE WHEN NOT EXISTS (SELECT 1 FROM site_users x WHERE x.id = u.id) THEN 1 ELSE 0 END) AS `id_승계가능`,
    SUM(CASE WHEN     EXISTS (SELECT 1 FROM site_users x WHERE x.id = u.id) THEN 1 ELSE 0 END) AS `id_충돌`
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM site_users s
    WHERE s.oauth_provider    = u.provider
      AND s.oauth_provider_id = u.provider_id
);
-- !! `id_충돌` 이 1 이 아니면 여기서 멈추고 확인할 것.
--    아래 [2-2] 는 새 id 를 1개만 계산하므로, 충돌이 2건 이상이면
--    같은 id 를 두 번 넣으려다 PK 오류가 나고 전체가 롤백된다 (데이터는 안전).

-- 1-4. 롤백용 id 목록 미리 확보  (결과를 복사해 파일 하단 롤백 구문에 붙여 넣는다)
SELECT GROUP_CONCAT(u.id ORDER BY u.id) AS `이관대상_users_id_목록`
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM site_users s
    WHERE s.oauth_provider    = u.provider
      AND s.oauth_provider_id = u.provider_id
);

-- 1-5. (선택) 스냅샷 백업 테이블. 롤백을 가장 확실하게 하는 방법.
--      주석을 풀고 이관 "전" 에 한 번만 실행한다.
-- CREATE TABLE bak_site_users_20260820 AS SELECT * FROM site_users;


-- ============================================================
-- [2] 이관
-- ============================================================

START TRANSACTION;

-- ------------------------------------------------------------
-- 2-1. id 를 그대로 승계하는 181명
--      기존 이관분 123명 중 122명이 id 승계 방식이라 같은 규칙을 유지한다.
--
--   * user_role / user_status 는 user_roles 에서 가져온다.
--     실측상 누락 0건이지만, INNER JOIN 으로 묶으면 누락된 회원이 조용히
--     빠질 수 있어 LEFT JOIN + 기본값으로 방어한다.
--     (실측상 이관 대상은 전원 USER / ACTIVE)
--   * last_login_at : 구 테이블 기본값이 '0000-00-00 00:00:00' 이라
--     그런 값은 NULL 로 바꿔 넣는다 (로그인 기록 없음). 실제 해당 건수는 미측정.
--   * updated_at : 이관은 내용 변경이 아니므로 가입 시각을 그대로 넣는다.
--     "이관한 시각" 을 남기고 싶으면 u.created_at 대신 NOW() 로 바꾼다.
--   * email : V3 에서 새로 생긴 서비스 자체 이메일 컬럼. 실제 값이 없으므로 NULL.
--     (site_users 에 email 컬럼이 아직 없다면 컬럼 목록의 email 과 값 NULL 을 지운다)
-- ------------------------------------------------------------
INSERT INTO site_users
    (id, oauth_provider, oauth_provider_id, oauth_nickname, oauth_email,
     oauth_profile_image, oauth_age_range, service_nickname, email,
     user_role, user_status, created_at, updated_at, last_login_at)
SELECT
    u.id,
    u.provider,
    u.provider_id,
    u.oauth_nickname,
    u.oauth_email,
    u.oauth_profile_image,
    u.oauth_age_range,
    u.nickname,
    NULL,
    COALESCE(r.role,   'USER'),
    COALESCE(r.status, 'ACTIVE'),
    u.created_at,
    u.created_at,
    NULLIF(u.last_login_at, '0000-00-00 00:00:00')
FROM users u
LEFT JOIN user_roles r ON r.user_id = u.id
WHERE NOT EXISTS (
        SELECT 1 FROM site_users s
        WHERE s.oauth_provider    = u.provider
          AND s.oauth_provider_id = u.provider_id
      )
  AND NOT EXISTS (
        SELECT 1 FROM site_users x WHERE x.id = u.id
      );
-- 기대 : 181 rows affected

-- ------------------------------------------------------------
-- 2-2. id 충돌 1명 : 새 id 를 부여해서 따로 넣는다
--
--   왜 이 사람만 다른가
--     이 회원의 구 id 는 123 인데, site_users 쪽 123번 자리는
--     이미 다른 회원(users.id=223)이 쓰고 있다.
--     id 를 그대로 가져가면 PK 충돌이 나므로 이 1명만 새 번호를 받는다.
--     회원 식별은 oauth_provider + oauth_provider_id 로 하므로
--     id 가 바뀌어도 로그인/조회에는 영향이 없다.
--     (이 회원의 id 를 참조하는 다른 데이터가 v2 로 함께 넘어간다면
--      그쪽 참조도 새 id 로 맞춰야 한다. 이번 이관 범위에는 그런 데이터가 없다.)
--
--   2-1 이 끝난 뒤이므로 아직 안 들어간 회원은 이 1명뿐이다.
-- ------------------------------------------------------------
SELECT COALESCE(MAX(id), 0) + 1 INTO @new_user_id FROM site_users;
SELECT @new_user_id AS `충돌회원_새_id`;   -- 기대값 : 306

INSERT INTO site_users
    (id, oauth_provider, oauth_provider_id, oauth_nickname, oauth_email,
     oauth_profile_image, oauth_age_range, service_nickname, email,
     user_role, user_status, created_at, updated_at, last_login_at)
SELECT
    @new_user_id,
    u.provider,
    u.provider_id,
    u.oauth_nickname,
    u.oauth_email,
    u.oauth_profile_image,
    u.oauth_age_range,
    u.nickname,
    NULL,
    COALESCE(r.role,   'USER'),
    COALESCE(r.status, 'ACTIVE'),
    u.created_at,
    u.created_at,
    NULLIF(u.last_login_at, '0000-00-00 00:00:00')
FROM users u
LEFT JOIN user_roles r ON r.user_id = u.id
WHERE NOT EXISTS (
    SELECT 1 FROM site_users s
    WHERE s.oauth_provider    = u.provider
      AND s.oauth_provider_id = u.provider_id
);
-- 기대 : 1 row affected

COMMIT;


-- ============================================================
-- [3] AUTO_INCREMENT 보정
--     ALTER 는 자동 커밋되므로 반드시 COMMIT 뒤에 둔다.
--     기대값 : 307 (site_users 최대 id 306 + 1)
-- ============================================================
SELECT COALESCE(MAX(id), 0) + 1 INTO @next_ai FROM site_users;
SET @sql := CONCAT('ALTER TABLE site_users AUTO_INCREMENT = ', @next_ai);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT @next_ai AS `설정된_AUTO_INCREMENT`;


-- ============================================================
-- [4] 실행 후 검증
-- ============================================================

-- 4-1. 총 건수  (기대값 : 305 / 305 — 두 값이 같아야 정상)
SELECT
    (SELECT COUNT(*) FROM users)      AS `users`,
    (SELECT COUNT(*) FROM site_users) AS `site_users`;

-- 4-2. 아직 안 넘어간 회원  (기대값 : 0)
SELECT COUNT(*) AS `미이관_잔여`
FROM users u
WHERE NOT EXISTS (
    SELECT 1 FROM site_users s
    WHERE s.oauth_provider    = u.provider
      AND s.oauth_provider_id = u.provider_id
);

-- 4-3. oauth 키 중복  (기대값 : 0행. uk_oauth 제약이 있어 원래 0이어야 한다)
SELECT oauth_provider, oauth_provider_id, COUNT(*) AS cnt
FROM site_users
GROUP BY oauth_provider, oauth_provider_id
HAVING cnt > 1;

-- 4-4. 권한/상태 분포  (이관분 182명은 전원 USER / ACTIVE)
SELECT user_role, user_status, COUNT(*) AS cnt
FROM site_users
GROUP BY user_role, user_status;

-- 4-5. 닉네임 비어 있는 회원  (이관 대상 182명은 실측상 0건)
SELECT COUNT(*) AS `service_nickname_NULL`
FROM site_users
WHERE service_nickname IS NULL;

-- 4-6. id 가 바뀐 회원 확인  (기대값 : 1행, 구 id 123 -> 새 id 306)
SELECT u.id AS `구_users_id`, s.id AS `새_site_users_id`, s.service_nickname
FROM users u
JOIN site_users s
  ON s.oauth_provider = u.provider AND s.oauth_provider_id = u.provider_id
WHERE u.id <> s.id;

-- 4-7. (선택) V3 email 컬럼 정책 맞추기.
--      기존 123명이 V3 ALTER 스크립트의 백필로 email = oauth_email 상태라면
--      새로 들어온 182명도 같게 맞추고 싶을 수 있다. 필요할 때만 주석 해제.
-- UPDATE site_users SET email = oauth_email WHERE email IS NULL AND oauth_email IS NOT NULL;


-- ============================================================
-- [5] 롤백 방법
-- ============================================================
--
-- 방법 1 (가장 확실) : 백업 덤프 복원
--   mysql -u{user} -p compyafun < backup_users_20260820.sql
--
-- 방법 2 : [1-5] 스냅샷 테이블을 만들어 뒀을 때
--   DELETE FROM site_users
--    WHERE id NOT IN (SELECT id FROM bak_site_users_20260820);
--
-- 방법 3 : [1-4] 에서 뽑아 둔 id 목록으로 지우기
--   -- 구 id 를 승계한 181명
--   -- DELETE FROM site_users WHERE id IN ( 여기에 1-4 결과 붙여넣기 );
--   -- id 가 바뀐 1명 (2-2 에서 출력된 새 id, 실측 기준 306)
--   -- DELETE FROM site_users WHERE id = 306;
--
-- 방법 4 : 실측 수치가 맞다면 한 줄로도 가능하다
--   이관 전 site_users 는 id 1~123 (123행) 만 있었다.
--   이관분은 id 124~222, 224~305, 그리고 새로 부여한 306 이다. 합계 182행.
--   -- DELETE FROM site_users WHERE id >= 124;   -- 182행이 지워져야 정상
--   ! 실행 전 SELECT COUNT(*) FROM site_users WHERE id >= 124; 로 182 인지 먼저 확인할 것.
--
-- ! 이관 이후 신규 가입이 발생했다면 방법 1/2 는 그 회원까지 되돌린다.
--   서비스 오픈 전에만 사용할 것.
-- ============================================================
