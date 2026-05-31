-- ============================================================
-- site_users 테이블에 서비스 자체 email 컬럼 추가 (V3)
-- oauth_email (OAuth 제공자 이메일) 과 별도 관리
-- 실행 순서: 1) ALTER  2) (선택) 백필  3) 인덱스
-- ============================================================

-- 1) 컬럼 추가
ALTER TABLE site_users
    ADD COLUMN email VARCHAR(255) NULL
        COMMENT '서비스 자체 이메일 (관리자 표시용, OAuth 이메일과 분리)'
        AFTER service_nickname;

-- 2) (선택) oauth_email 값으로 백필
--    oauthEmail 이 존재하는 기존 유저를 일괄 채움
UPDATE site_users
SET email = oauth_email
WHERE email IS NULL
  AND oauth_email IS NOT NULL;

-- 3) 이메일 검색 인덱스 추가
ALTER TABLE site_users
    ADD INDEX idx_user_email (email);

-- ============================================================
-- prod DB 적용 안내
-- ⚠️ 운영 DB 는 release 절차를 통해 사용자가 직접 적용 필요
--    (접근 권한 부재 / 안전장치 절차)
-- ============================================================
