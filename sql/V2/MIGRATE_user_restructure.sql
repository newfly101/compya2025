-- =====================================================================
-- crud_migration_user.sql — 유저 테이블 개편 마이그레이션 (5개 파일 병합)
-- 병합 전 원본: USER_RESTRUCTURE_01/02/02B/03A/03 (2026-09-13 재편)
-- 실행 순서 = 파일 내 섹션 순서 (01 → 02 → 02B → 03A → 03). 반드시 순서대로,
-- 각 섹션의 ⚠️ 실행 조건을 확인한 뒤 진행할 것 (03 은 비가역).
-- =====================================================================

-- ── 원본: USER_RESTRUCTURE_01_ADD_PUBLIC_ID_AND_WITHDRAWN_AT.sql ──
-- =====================================================================
-- 유저 테이블 개편 1/3 — 값을 더하기만 하는 단계 (되돌리기 가능)
--
-- 설계 문서: docs/domain/account/prd/user-table-restructure.md § 2, § 3, § 5(1~4)
-- 다음 파일: USER_RESTRUCTURE_02_CREATE_OAUTH_ACCOUNTS_TABLE.sql
--
-- 이 파일이 하는 일 (site_users 컬럼만 만짐, oauth_* 원본은 아직 그대로 둔다)
--   1) public_id  CHAR(36)  — 밖으로 내보낼 식별자. UUID v4
--   2) withdrawn_at DATETIME — 탈퇴 시각 전용. updated_at 대용을 끝낸다
--   3) profile_image — 있으면 건너뛰고 없으면 추가 (ADD_SITE_USERS_PROFILE_IMAGE.sql
--      을 이미 실행했는지 알 수 없어 IF NOT EXISTS 로 양쪽 다 안전하게 둔다)
--
-- ⚠️ MariaDB 10.5.4 로 검증한 문법만 썼다
--   - ADD COLUMN IF NOT EXISTS : MariaDB 10.0.2+ 지원 (재실행해도 에러 안 남)
--   - UUID() 는 쓰지 않는다 — 10.5.4 의 UUID() 는 v1 이라 시각·MAC 주소가 값에 섞인다
--     (§ 3 판단과 동일한 이유로 data_player_legend.sql 14행도 배제)
--   - public_id 는 애플리케이션에서 생성하는 게 원칙(§ 3)이지만, 이미 있는 500행은
--     애플리케이션 코드가 없으므로 이번 한 번만 SQL 로 v4 형식을 흉내내 채운다.
--     RAND() 기반이라 암호학적으로 완벽한 난수는 아니지만, 122비트 조합에 500행이라
--     충돌 확률은 무시할 수준이고 실제 충돌 여부는 5)에서 UNIQUE 로 다시 검증한다.
--     앞으로 가입하는 유저의 public_id 는 이 SQL 이 아니라 애플리케이션이 만든다.
--
-- ⚠️ 실행 전
--   - site_users 는 500행. 전부 즉시 끝난다
--   - 기존 컬럼을 건드리지 않으므로 구버전 코드가 도는 중에 실행해도 서비스 영향 없음
--     (§ 5 순서표 1~4 단계 — 읽는 코드가 아직 없다)
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;

-- 0) 지금 상태 확인 (실행 전 눈으로 볼 것)
SELECT COUNT(*) AS 전체_유저,
       SUM(user_status = 'WITHDRAWN') AS 탈퇴_유저
FROM site_users;


-- 1) 컬럼 추가 ----------------------------------------------------------
ALTER TABLE site_users
    ADD COLUMN IF NOT EXISTS public_id CHAR(36) NULL
        COMMENT '밖으로 노출되는 사용자 식별자 (UUID v4). id(내부 PK)는 노출하지 않는다'
        AFTER id,
    ADD COLUMN IF NOT EXISTS withdrawn_at DATETIME NULL
        COMMENT '탈퇴 시각. updated_at 대용 금지(관리자가 권한만 바꿔도 updated_at 이 갱신되는 버그를 없앤다)'
        AFTER user_status,
    ADD COLUMN IF NOT EXISTS profile_image VARCHAR(500) NULL
        COMMENT '사용자가 마이페이지에서 직접 올린 프로필 이미지 URL. oauth_profile_image 와 별개. NULL이면 미설정'
        AFTER service_nickname;

-- 되돌리기: ALTER TABLE site_users
--   DROP COLUMN IF EXISTS public_id,
--   DROP COLUMN IF EXISTS withdrawn_at;
--   (profile_image 는 이 스크립트 이전에 이미 있었을 수 있으므로 여기서 되돌리지 않는다.
--    지우려면 ADD_SITE_USERS_PROFILE_IMAGE.sql 을 이 스크립트보다 먼저 실행했는지부터 확인할 것)


-- 2) 기존 500행의 public_id 를 UUID v4 형식으로 채운다 --------------------
--    xxxxxxxx-xxxx-4xxx-{8,9,a,b}xxx-xxxxxxxxxxxx  (버전 4 / 변형 비트 고정)
UPDATE site_users
SET public_id = LOWER(CONCAT(
        LPAD(HEX(FLOOR(RAND() * POW(2, 32))), 8, '0'), '-',
        LPAD(HEX(FLOOR(RAND() * POW(2, 16))), 4, '0'), '-',
        '4', LPAD(HEX(FLOOR(RAND() * POW(2, 12))), 3, '0'), '-',
        HEX(8 + FLOOR(RAND() * 4)), LPAD(HEX(FLOOR(RAND() * POW(2, 12))), 3, '0'), '-',
        LPAD(HEX(FLOOR(RAND() * POW(2, 48))), 12, '0')
    ))
WHERE public_id IS NULL;

-- 되돌리기: UPDATE site_users SET public_id = NULL;


-- 3) 채워졌는지 + 겹치는 값이 없는지 확인 (다음 단계 전에 반드시 볼 것) -----
--    null_남음 = 0 이고 전체 = distinct_개수 여야 한다. 하나라도 어긋나면 4)를 멈출 것
SELECT COUNT(*)                    AS 전체,
       SUM(public_id IS NULL)      AS null_남음,
       COUNT(DISTINCT public_id)   AS distinct_개수
FROM site_users;


-- 4) 값이 다 찬 뒤에만 제약을 건다 (NOT NULL + UNIQUE) ---------------------
--    ⚠️ 이 문장은 재실행에 안전하지 않다 — 이미 걸려 있으면 에러가 난다.
--       에러가 나면 "이미 이 단계까지 끝났다"는 뜻이니 그냥 다음 파일로 넘어가면 된다.
ALTER TABLE site_users
    MODIFY COLUMN public_id CHAR(36) NOT NULL COMMENT '밖으로 노출되는 사용자 식별자 (UUID v4)',
    ADD UNIQUE KEY uk_site_users_public_id (public_id);

-- 되돌리기: ALTER TABLE site_users
--   DROP INDEX uk_site_users_public_id,
--   MODIFY COLUMN public_id CHAR(36) NULL;


-- 5) 이미 탈퇴한 유저의 withdrawn_at 을 채운다 -----------------------------
--    지금까지는 updated_at 을 탈퇴 시각처럼 써왔다(버그). 지금 남아있는 값을
--    그대로 옮겨 채우는 것으로 그 버그를 끝낸다. 이후 갱신은 애플리케이션이 담당(§ 6)
UPDATE site_users
SET withdrawn_at = updated_at
WHERE user_status = 'WITHDRAWN'
  AND withdrawn_at IS NULL;

-- 되돌리기: UPDATE site_users SET withdrawn_at = NULL WHERE user_status = 'WITHDRAWN';


-- 6) 마무리 확인 ----------------------------------------------------------
SELECT COUNT(*)                                            AS 전체,
       SUM(user_status = 'WITHDRAWN')                      AS 탈퇴_유저,
       SUM(user_status = 'WITHDRAWN' AND withdrawn_at IS NOT NULL) AS 탈퇴시각_채워짐,
       SUM(public_id IS NULL)                              AS public_id_비어있음
FROM site_users;

-- =====================================================================
-- ⚠️ 탈퇴 계정 파기(1개월 후 삭제/비우기)는 이번에 만들지 않는다. 컬럼만 둔다.
--    (docs/domain/account/prd/user-table-restructure.md 결정란 — 보류)
-- =====================================================================

-- ── 원본: USER_RESTRUCTURE_02_CREATE_OAUTH_ACCOUNTS_TABLE.sql ──
-- =====================================================================
-- 유저 테이블 개편 2/3 — OAuth 테이블 신설 + 데이터 복사 (되돌리기 가능)
--
-- 설계 문서: docs/domain/account/prd/user-table-restructure.md § 2, § 5(1~4)
-- 앞 파일: USER_RESTRUCTURE_01_ADD_PUBLIC_ID_AND_WITHDRAWN_AT.sql (먼저 실행되어 있어야 함)
-- 다음 파일: USER_RESTRUCTURE_03_DROP_SITE_USERS_OAUTH_COLUMNS.sql (⚠️ 비가역 — 코드 배포 후에만)
--
-- 이 파일이 하는 일
--   1) site_user_oauth_accounts 테이블 신설
--   2) site_users 의 oauth_* 6개 컬럼 값을 "복사" (원본은 그대로 둔다 — 아직 지우지 않음)
--   3) 옮겨진 개수 확인
--
-- 로그인 수단을 여러 개 붙일 수 있게 구조는 열어두되(user_id 는 UNIQUE 로 묶지 않는다),
-- 지금은 사람당 로그인 수단이 1개뿐이라 결과적으로 한 사람 = 한 행이다.
-- 연결/해제 화면·API 는 이번에 만들지 않는다 (설계 문서 § 8).
--
-- ⚠️ 실행 전
--   - site_users 는 500행, oauth_provider/oauth_provider_id 는 전부 NOT NULL 이라
--     500행이 그대로 복사되어야 정상이다
--   - 원본 컬럼(oauth_*)을 전혀 건드리지 않으므로 서비스 영향 없음. 읽는 코드가 아직 없다
--   - 재실행해도 안전 — 이미 옮겨진 user_id 는 다시 넣지 않는다(2번 INSERT 의 WHERE NOT EXISTS)
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;

-- 0) 지금 상태 확인 (실행 전 눈으로 볼 것)
SELECT COUNT(*)                                   AS site_users_전체,
       COUNT(DISTINCT oauth_provider, oauth_provider_id) AS oauth_고유조합_수
FROM site_users;


-- 1) 테이블 신설 ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS site_user_oauth_accounts
(
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY  COMMENT '로그인 수단 고유 ID',
    user_id                 BIGINT       NOT NULL              COMMENT 'site_users.id 참조. 여러 행이 같은 user_id 를 가질 수 있다',

    oauth_provider          VARCHAR(20)  NOT NULL              COMMENT 'OAuth 제공자 (NAVER)',
    oauth_provider_id       VARCHAR(100) NOT NULL              COMMENT 'OAuth 제공자 고유 ID',
    oauth_nickname          VARCHAR(20)                        COMMENT 'OAuth 제공자 닉네임 (원본 스냅샷)',
    oauth_email             VARCHAR(255)                       COMMENT 'OAuth 제공자 이메일 (원본 스냅샷)',
    oauth_profile_image     VARCHAR(500)                       COMMENT 'OAuth 제공자 프로필 이미지 URL (원본 스냅샷)',
    oauth_age_range         VARCHAR(10)                        COMMENT 'OAuth 제공자 연령대. 계속 수집(결정 유지) — 쓰는 화면은 없음',

    created_at              DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '연결(가입) 시각',
    updated_at              DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정일',

    UNIQUE KEY uk_oauth_provider (oauth_provider, oauth_provider_id) COMMENT '같은 네이버 계정이 두 사람에 붙지 못하게',
    KEY idx_oauth_user_id (user_id),
    CONSTRAINT fk_oauth_accounts_user
        FOREIGN KEY (user_id) REFERENCES site_users (id)
            ON DELETE CASCADE
) COMMENT = '로그인 수단(OAuth) 원본 — 한 사람이 여러 개 가질 수 있다';

-- 되돌리기: DROP TABLE IF EXISTS site_user_oauth_accounts;
--   (site_users 원본 oauth_* 컬럼은 이 단계에서 전혀 바뀌지 않으므로 순수 복사본만 사라진다)


-- 2) 기존 500명의 OAuth 원본을 복사 (재실행해도 중복 안 생기게 NOT EXISTS 가드) ----
INSERT INTO site_user_oauth_accounts
    (user_id, oauth_provider, oauth_provider_id, oauth_nickname,
     oauth_email, oauth_profile_image, oauth_age_range, created_at)
SELECT su.id, su.oauth_provider, su.oauth_provider_id, su.oauth_nickname,
       su.oauth_email, su.oauth_profile_image, su.oauth_age_range, su.created_at
FROM site_users su
WHERE NOT EXISTS (
    SELECT 1 FROM site_user_oauth_accounts o WHERE o.user_id = su.id
);

-- 되돌리기: DELETE FROM site_user_oauth_accounts; (또는 테이블째 DROP)


-- 3) 옮겨졌는지 확인 (500 = 500 이어야 한다) -------------------------------
SELECT (SELECT COUNT(*) FROM site_users)                 AS site_users_전체,
       (SELECT COUNT(*) FROM site_user_oauth_accounts)   AS oauth_accounts_전체,
       (SELECT COUNT(*) FROM site_user_oauth_accounts o
            JOIN site_users su
                ON su.id = o.user_id
               AND su.oauth_provider = o.oauth_provider
               AND su.oauth_provider_id = o.oauth_provider_id) AS 값_일치_행수;

-- 위 세 숫자가 전부 같아야 정상이다. 다르면 3번 파일(비가역)로 절대 넘어가지 말 것.

-- ── 원본: USER_RESTRUCTURE_02B_RELAX_SITE_USERS_OAUTH_NOT_NULL.sql ──
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

-- ── 원본: USER_RESTRUCTURE_03A_PRECHECK.sql ──
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

-- ── 원본: USER_RESTRUCTURE_03_DROP_SITE_USERS_OAUTH_COLUMNS.sql ──
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

-- 0) 실행 전 마지막 확인 --------------------------------------------------
--    ⚠️ 먼저 USER_RESTRUCTURE_03A_PRECHECK.sql 을 돌려 5개 조회가 전부
--       기대값인지 확인할 것. 아래 개수 비교만으로는 부족하다 —
--       짝이 서로 어긋나 있어도 전체 개수는 똑같이 나온다.
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
