-- ⚠️ 접두 불일치 (2026-09-27 실측) — 운영 DB 접두 분포는 site_ 15 · data_ 13 ·
-- fun_ 2 · 접두없음 1인데, fun_teams 는 게임에서 받아오는 참조 데이터라 결이
-- data_ 에 더 맞는다 (fun_ 은 site 관리자가 운용하는 컨텐츠 계열). 아직 이름은
-- 바꾸지 않았다 — 바꾸려면 mapper XML·엔티티까지 함께 고쳐야 한다.
CREATE TABLE fun_teams
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '팀 고유 식별자 (PK)',
    team_code      VARCHAR(10)  NOT NULL COMMENT '팀 코드',
    team_name      VARCHAR(50)  NOT NULL COMMENT '팀명',
    latest_team_id BIGINT       NULL COMMENT '현재 기준 연결되는 후속 팀 ID',
    city_name      VARCHAR(50)  NULL COMMENT '연고지명',
    start_year     SMALLINT     NULL COMMENT '팀명/엠블럼 사용 시작 연도',
    end_year       SMALLINT     NULL COMMENT '팀명/엠블럼 사용 종료 연도, 현재 사용 중이면 NULL',
    emblem_url     VARCHAR(255) NULL COMMENT '팀 엠블럼 이미지 URL',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    UNIQUE KEY uk_fun_teams_code_period (team_code, start_year),
    INDEX idx_fun_teams_latest_team_id (latest_team_id),

    CONSTRAINT fk_fun_teams_latest_team
        FOREIGN KEY (latest_team_id) REFERENCES fun_teams (id)
);

-- ─────────────────────────────────────────────────────────────────────
-- fun_quiz 는 여기 없다 — sql/V3/CREATE_05_fun.sql 이 최종 정의를 갖는다.
--
-- 원래 이 파일에도 같은 테이블이 있었는데, V3 쪽이 DROP & CREATE 로 다시
-- 만드는 구조라 두 곳에 있으면 V2 → V3 순서로 실행할 때 방금 만든 것을
-- 지우고 다시 만든다. 데이터가 든 상태에서 다시 돌리면 그게 날아간다.
-- (2026-09-13 정리)
-- ─────────────────────────────────────────────────────────────────────
