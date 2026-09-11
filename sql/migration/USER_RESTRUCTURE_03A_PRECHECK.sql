-- =====================================================================
-- 유저 테이블 개편 3단계 사전 검증 — 지우기 전에 반드시 통과해야 한다
--
-- 왜 필요한가
--   3단계는 site_users 의 oauth_* 6개 컬럼을 지운다. 그 컬럼들은 지금
--   «네이버 정보의 원본»이고, 새 테이블(site_user_oauth_accounts)은 2단계에서
--   그걸 복사해 만든 사본이다.
--
--   복사가 한 명이라도 어긋나 있으면 그 사람은 다음 로그인 때 자기 계정을
--   못 찾는다. 새 계정이 하나 더 만들어지고 옛 계정은 그대로 떠 있게 된다.
--   컬럼을 지운 뒤에는 무엇이 옳았는지 알 길이 사라진다.
--
--   그래서 «며칠 기다렸는가» 보다 «아래 조회가 전부 0인가» 가 중요하다.
--
-- 언제 돌리는가
--   3단계 직전. 아래 5개가 전부 기대값이면 03 파일로 넘어간다.
--   하나라도 어긋나면 멈추고 원인을 찾는다. 급할 이유가 없다 —
--   컬럼이 남아 있어서 생기는 문제는 없다.
--
-- ⚠️ 이 파일은 읽기만 한다. 아무것도 바꾸지 않는다.
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;


-- 1) 네이버 정보가 없는 유저 ------------------------------------------
--    기대값 0. 1 이상이면 그 사람은 로그인하는 순간 계정이 하나 더 생긴다.
SELECT COUNT(*) AS 짝없는_유저
FROM site_users u
         LEFT JOIN site_user_oauth_accounts o ON o.user_id = u.id
WHERE o.id IS NULL;

--    0 이 아니면 누구인지 본다 (위가 0 이면 이 조회는 건너뛴다)
-- SELECT u.id, u.service_nickname, u.email, u.user_status, u.created_at
-- FROM site_users u
--          LEFT JOIN site_user_oauth_accounts o ON o.user_id = u.id
-- WHERE o.id IS NULL;


-- 2) 복사가 어긋난 유저 ------------------------------------------------
--    기대값 0. 원본과 사본의 네이버 식별자가 다르면 남의 계정으로 이어진다.
--
--    ⚠️ 개편 이후 가입한 사람은 원본(site_users.oauth_*)이 비어 있는 게 정상이라
--       비교 대상에서 뺀다. 그게 아래 IS NOT NULL 조건이다.
SELECT COUNT(*) AS 어긋난_유저
FROM site_users u
         JOIN site_user_oauth_accounts o ON o.user_id = u.id
WHERE u.oauth_provider_id IS NOT NULL
  AND (u.oauth_provider_id <> o.oauth_provider_id
    OR u.oauth_provider <> o.oauth_provider);

--    0 이 아니면 누구인지 본다
-- SELECT u.id, u.oauth_provider_id AS 원본, o.oauth_provider_id AS 사본, u.email
-- FROM site_users u
--          JOIN site_user_oauth_accounts o ON o.user_id = u.id
-- WHERE u.oauth_provider_id IS NOT NULL
--   AND u.oauth_provider_id <> o.oauth_provider_id;


-- 3) 한 사람에게 여러 개 붙은 경우 --------------------------------------
--    기대값 0행. 지금은 로그인 수단이 네이버 하나뿐이라 1인 1행이어야 한다.
--    (나중에 구글 등을 붙이면 이 조회는 의미가 달라진다)
SELECT user_id, COUNT(*) AS 개수
FROM site_user_oauth_accounts
GROUP BY user_id
HAVING 개수 > 1;


-- 4) 같은 네이버 계정이 두 사람에게 붙은 경우 ---------------------------
--    기대값 0행. UNIQUE 제약이 막아주지만, 지우고 다시 가입하는 과정에서
--    옛 행이 남아 있으면 여기서 드러난다.
SELECT oauth_provider, oauth_provider_id, COUNT(*) AS 개수
FROM site_user_oauth_accounts
GROUP BY oauth_provider, oauth_provider_id
HAVING 개수 > 1;


-- 5) 전체 그림 ---------------------------------------------------------
--    site_users_전체 = oauth_accounts_전체 여야 한다.
--    개편후_가입 은 원본이 비어 있는 사람 수 — 정상이며 2)의 비교 대상에서 빠진 수다.
SELECT (SELECT COUNT(*) FROM site_users)                               AS site_users_전체,
       (SELECT COUNT(*) FROM site_user_oauth_accounts)                 AS oauth_accounts_전체,
       (SELECT COUNT(*) FROM site_users WHERE oauth_provider_id IS NULL) AS 개편후_가입,
       (SELECT COUNT(*) FROM site_users WHERE user_status = 'WITHDRAWN') AS 탈퇴상태;


-- =====================================================================
-- 통과 기준
--
--   1) 짝없는_유저        0
--   2) 어긋난_유저        0
--   3) 여러 개 붙은 경우  0행
--   4) 중복 네이버 계정   0행
--   5) 두 전체 수가 같음
--
-- 여기에 더해, 개편 전부터 있던 사용자 한 명이 실제로 로그인되는 것을
-- 눈으로 확인하는 게 가장 확실하다. 새로 가입한 사람이 되는 것과는 다른 이야기다 —
-- 기존 사용자는 복사된 사본으로 자기를 찾기 때문이다.
--
-- 전부 통과하면
--   1. mysqldump -u<user> -p compyafun site_users > site_users_backup_YYYYMMDD.sql
--   2. USER_RESTRUCTURE_03_DROP_SITE_USERS_OAUTH_COLUMNS.sql 실행
-- =====================================================================
