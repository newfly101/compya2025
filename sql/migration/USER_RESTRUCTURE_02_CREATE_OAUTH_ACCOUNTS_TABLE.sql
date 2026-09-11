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
