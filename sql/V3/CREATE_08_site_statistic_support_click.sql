-- =====================================================================
-- 후원(카카오페이 송금) 버튼 클릭 기록 — 로그인 유저에 한해 "누가 언제 눌렀는지"만 남기는
-- 최소 통계. 비로그인 클릭은 기록하지 않는다(서비스 로직 상 insert 자체를 안 함 — 이
-- 테이블에 애초에 들어오지 않는다).
--
-- target 을 별도 컬럼으로 둔 이유: 지금은 카카오페이뿐이지만 후원 수단이 늘어날 수 있어
-- 구분자로 남겨둔다 (기본값 'kakaopay').
--
-- site_user_event(CREATE_07) 관례를 따라 user_id 에 FK 는 걸지 않는다
-- (쓰기 비용 최소화, 정합성은 앱 레벨 보장) — 인덱스만 둔다.
--
-- 실행 순서: site_users(V2/CREATE_04_TABLE_SITE.sql) 다음 아무 때나 — 독립 테이블.
-- =====================================================================

USE compyafun;

-- DROP TABLE IF EXISTS statistic_support_click;

CREATE TABLE statistic_support_click
(
    id         BIGINT AUTO_INCREMENT PRIMARY KEY          COMMENT '기록 고유 ID',
    user_id    BIGINT      NOT NULL                       COMMENT 'site_users.id. 로그인 유저만 기록되므로 NULL 없음. FK 는 걸지 않는다(site_user_event 관례, 앱 레벨 정합성)',
    target     VARCHAR(20) NOT NULL DEFAULT 'kakaopay'    COMMENT '후원 수단 구분자. 현재는 카카오페이뿐이나 수단이 늘 수 있어 구분',
    created_at DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '클릭 시각',

    INDEX idx_statistic_support_click_user (user_id, created_at)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COMMENT = '홈 화면 후원(카카오페이 송금) 버튼 클릭 기록 — 로그인 유저만 적재';
