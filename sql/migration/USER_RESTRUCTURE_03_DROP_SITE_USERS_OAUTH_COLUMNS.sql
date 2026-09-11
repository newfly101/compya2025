-- =====================================================================
-- 🔴 유저 테이블 개편 3/3 — site_users 에서 oauth_* 6개 컬럼 DROP
--
-- ⚠️⚠️⚠️ 이 단계는 되돌릴 수 없다. 실행 전 site_users 전체 덤프를 떠라. ⚠️⚠️⚠️
--   예) mysqldump -u<user> -p compyafun site_users > site_users_backup_YYYYMMDD.sql
--
-- ⚠️ 실행 조건 (전부 만족해야 실행 가능. 하나라도 아니면 이 파일을 열지 말 것)
--   1) USER_RESTRUCTURE_01, 02 가 이미 끝나 있고 검증 쿼리가 전부 정상이었다
--   2) site_user_oauth_accounts 를 읽고 쓰도록 코드가 이미 배포되어 있다
--      (설계 문서 § 5 순서표 5~7단계 — UserMapper.xml JOIN 전환, insertUser 분리,
--       읽기·쓰기 모두 새 테이블 기준으로 전환 완료)
--   3) 배포 후 며칠 관찰해서 두 곳 값이 어긋나지 않는 것을 확인했다
--   4) 커뮤니티 v1→v2 이관(V1_TO_V2_COMMUNITY.sql)과 같은 날 실행하지 않는다
--      (설계 문서 § 4 — 별개 위험이라 섞으면 원인 추적이 어려워진다)
--
-- 설계 문서: docs/domain/account/prd/user-table-restructure.md § 5(8)
-- 앞 파일: USER_RESTRUCTURE_02_CREATE_OAUTH_ACCOUNTS_TABLE.sql
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;

-- 0) 실행 전 마지막 확인 — 두 테이블 값이 여전히 일치하는지, 새 테이블에 코드가
--    이미 의존하고 있다는 전제이므로 site_users 쪽 oauth_* 는 이제 아무도 안 읽어야 정상
SELECT (SELECT COUNT(*) FROM site_users)               AS site_users_전체,
       (SELECT COUNT(*) FROM site_user_oauth_accounts) AS oauth_accounts_전체;
-- 두 숫자가 다르면 여기서 멈출 것. 02번 파일부터 다시 확인.


-- 1) oauth_provider/oauth_provider_id 를 참조하는 유니크 제약을 먼저 뗀다 --
--    (컬럼을 지우기 전에 제약부터 떼지 않으면 DROP COLUMN 이 막힌다)
ALTER TABLE site_users
    DROP INDEX uk_oauth;


-- 2) 🔴 oauth_* 6개 컬럼을 지운다 — 여기부터 되돌릴 수 없다 ------------------
ALTER TABLE site_users
    DROP COLUMN oauth_provider,
    DROP COLUMN oauth_provider_id,
    DROP COLUMN oauth_nickname,
    DROP COLUMN oauth_email,
    DROP COLUMN oauth_profile_image,
    DROP COLUMN oauth_age_range;


-- 3) 마무리 확인 — site_users 에 oauth_* 컬럼이 하나도 안 남아야 정상 --------
SELECT COLUMN_NAME
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'compyafun'
  AND TABLE_NAME = 'site_users'
  AND COLUMN_NAME LIKE 'oauth\_%';
-- 결과가 0행이어야 한다.

-- =====================================================================
-- 되돌리는 법: 없다. 위 0)번 덤프로 복구하는 것 뿐이다.
--   덤프가 없다면 site_user_oauth_accounts 값으로 컬럼을 다시 만들고 채워
--   비슷하게 복원할 수는 있으나, 그 사이 site_users 에 생긴 변경(탈퇴 등)과
--   시점이 어긋날 수 있어 완전한 복구가 아니다. 그래서 덤프가 필수다.
-- =====================================================================
