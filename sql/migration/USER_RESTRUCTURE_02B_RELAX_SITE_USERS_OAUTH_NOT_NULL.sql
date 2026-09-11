-- =====================================================================
-- 유저 테이블 개편 2.5/3 — site_users.oauth_provider / oauth_provider_id 를 NULL 허용으로 (되돌리기 가능)
--
-- 설계 문서: docs/domain/account/prd/user-table-restructure.md § 6, § 9
-- 앞 파일: USER_RESTRUCTURE_02_CREATE_OAUTH_ACCOUNTS_TABLE.sql
-- 다음 파일: USER_RESTRUCTURE_03_DROP_SITE_USERS_OAUTH_COLUMNS.sql (⚠️ 비가역 — 이 파일과는 별개로 한참 뒤)
--
-- ⚠️ 왜 필요한가
--   코드 개편(2단계 완료) 이후 신규 가입 INSERT 는 site_users.oauth_provider / oauth_provider_id 를
--   더 이상 채우지 않는다 (OAuth 원본은 이제 site_user_oauth_accounts 에만 쓴다).
--   그런데 이 두 컬럼은 원래 스키마(CREATE_TABLE_SITE.sql)에서 NOT NULL 이다.
--   → 이 SQL 을 먼저 돌리지 않고 새 코드를 배포하면, 배포 직후 첫 신규 가입에서
--     "Column 'oauth_provider' cannot be null" 로 INSERT 가 그 자리에서 실패한다.
--
-- ⚠️ 실행 순서 — 반드시 "새 코드 배포 전"에 실행한다
--   이 SQL 은 값을 지우지 않고 제약만 완화하므로, 지금 돌고 있는 구버전 코드에는 영향이 없다
--   (구버전은 여전히 두 컬럼을 채워서 INSERT 한다 — NULL 을 허용한다고 값을 안 채우게 되는 건 아니다).
--   즉 "언제 돌려도 안전"하지만 "새 코드 배포보다는 반드시 먼저"여야 한다.
--
-- UNIQUE KEY uk_oauth (oauth_provider, oauth_provider_id) 는 어떻게 되나
--   MariaDB(InnoDB) 의 UNIQUE 인덱스는 NULL 을 "서로 다른 값"으로 취급해 여러 행이 동시에
--   (NULL, NULL) 을 가져도 유니크 위반이 나지 않는다. 새 코드로 가입하는 사용자는 이 두 컬럼에
--   값을 넣지 않으므로 전부 NULL 이 되고, 기존 500행(NOT NULL 값 보유)과는 애초에 값이 달라
--   충돌 여지가 없다. 그래서 이 제약을 이번에 굳이 걷어내지 않는다 — 3번 파일에서 컬럼째 사라진다.
--
-- ⚠️ 실행 전
--   - 기존 500행의 값은 전혀 건드리지 않는다 (컬럼 정의만 NULL 허용으로 바뀐다)
--   - site_user_oauth_accounts 로의 복사(2번 파일)가 이미 끝나 있어야 한다는 전제는 없다 —
--     이 파일은 독립적으로 실행 가능하지만, 관례상 2번 다음 순서를 권장한다
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;

-- 0) 지금 상태 확인 (실행 전 눈으로 볼 것)
SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'compyafun'
  AND TABLE_NAME = 'site_users'
  AND COLUMN_NAME IN ('oauth_provider', 'oauth_provider_id');
-- IS_NULLABLE 이 둘 다 'NO' 로 나와야 정상 (아직 이 스크립트를 안 돌린 상태)


-- 1) NOT NULL 제거 ---------------------------------------------------------
ALTER TABLE site_users
    MODIFY COLUMN oauth_provider VARCHAR(20) NULL
        COMMENT 'OAuth 제공자 (NAVER). site_user_oauth_accounts 로 이관 완료 — 신규 가입은 더 이상 채우지 않는다. 3단계에서 컬럼째 DROP 예정',
    MODIFY COLUMN oauth_provider_id VARCHAR(100) NULL
        COMMENT 'OAuth 제공자 고유 ID. site_user_oauth_accounts 로 이관 완료 — 신규 가입은 더 이상 채우지 않는다. 3단계에서 컬럼째 DROP 예정';

-- 되돌리기 (기존 500행에는 여전히 값이 남아 있어야 안전 — 3번 파일 실행 전까지는 되돌릴 수 있다):
-- ALTER TABLE site_users
--     MODIFY COLUMN oauth_provider VARCHAR(20) NOT NULL,
--     MODIFY COLUMN oauth_provider_id VARCHAR(100) NOT NULL;
-- (단, 이 SQL 이후 새 코드로 가입한 행은 두 컬럼이 NULL 이라 되돌리기 ALTER 자체가 실패한다 —
--  그런 행이 생기기 전에만 되돌릴 수 있다)


-- 2) 확인 (IS_NULLABLE 이 둘 다 'YES' 로 바뀌어야 한다) -----------------------
SELECT COLUMN_NAME, IS_NULLABLE, COLUMN_TYPE
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = 'compyafun'
  AND TABLE_NAME = 'site_users'
  AND COLUMN_NAME IN ('oauth_provider', 'oauth_provider_id');
