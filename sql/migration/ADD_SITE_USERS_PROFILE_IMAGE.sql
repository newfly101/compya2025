-- =====================================================================
-- site_users.profile_image — 사용자가 직접 올린 프로필 이미지 주소
--
-- site_users 에는 이미 oauth_profile_image 가 있지만, 이건 네이버가 준 이미지다.
-- 네이버 쪽에서 값이 바뀌거나 없어질 수 있고, 우리가 지우거나 관리할 수 있는 값이 아니다.
-- 유저가 마이페이지에서 직접 올리는 이미지는 별도 컬럼에 담아야
-- "네이버 이미지" 와 "우리가 보관하는 이미지" 가 서로 안 섞인다.
--
-- 값이 없으면(NULL) 화면에서 oauth_profile_image 나 기본 이미지로 대체해서 보여준다.
-- (API 응답은 두 값을 모두 내려주고, 어느 걸 보여줄지는 화면이 정한다)
--
-- ⚠️ 실행 전
--   - site_users 전체 행 수와 현재 oauth_profile_image 값 분포를 먼저 눈으로 볼 것
--   - ALTER TABLE ADD COLUMN (NULL 허용, 기본값 없음) 이라 기존 행에는 전부 NULL 로 채워진다.
--     즉시 서비스 영향은 없다 — 서버 재기동도 필요 없다 (JPA 아닌 MyBatis 라 컬럼 매핑은
--     select 절에 명시한 컬럼만 읽는다. 이 컬럼을 쓰는 코드가 먼저 배포되어 있어야 값이 채워진다)
-- =====================================================================

SET NAMES utf8mb4;
USE compyafun;

-- 0) 지금 상태 확인 (실행 전 눈으로 볼 것)
SELECT COUNT(*) AS 전체_유저,
       SUM(oauth_profile_image IS NOT NULL) AS 네이버_이미지_있음
FROM site_users;

-- 1) 컬럼 추가 --------------------------------------------------------
ALTER TABLE site_users
    ADD COLUMN profile_image VARCHAR(500) NULL
        COMMENT '사용자가 마이페이지에서 직접 올린 프로필 이미지 URL. 네이버 제공 이미지(oauth_profile_image)와 별개. NULL이면 미설정'
        AFTER service_nickname;

-- 2) 확인 --------------------------------------------------------------
--    새 컬럼이 전부 NULL 인지 (정상)
SELECT COUNT(*) AS 전체_유저,
       SUM(profile_image IS NOT NULL) AS profile_image_있음
FROM site_users;
