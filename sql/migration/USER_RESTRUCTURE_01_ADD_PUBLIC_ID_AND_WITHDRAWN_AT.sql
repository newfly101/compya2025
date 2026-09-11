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
