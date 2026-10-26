-- 미실행 · 사용자 실행 대기 · test=prod 동일 DB (실행 즉시 운영 반영). 실행 후 applied/ 로 옮긴다.
-- 근거: gsb-rules.md § 5.1 / feature simulators
CREATE TABLE site_user_simulator_saves
(
    id          BIGINT   NOT NULL AUTO_INCREMENT COMMENT '저장 기록 id',
    user_id     BIGINT   NOT NULL COMMENT 'site_users.id',
    legend_id   CHAR(36) NOT NULL COMMENT 'data_player_legend.id (FK 없음)',
    gsb_count   INT      NOT NULL COMMENT '그 시점 고스변 누적 횟수',
    sel_count   INT      NOT NULL COMMENT '그 시점 선변 누적 횟수',
    skill_id_1  CHAR(36) NOT NULL COMMENT 'data_player_skill.id — 카드 위 칸부터',
    skill_id_2  CHAR(36) NOT NULL,
    skill_id_3  CHAR(36) NOT NULL,
    skill_tier_1 CHAR(1) NOT NULL COMMENT '스킬1 등급 E~C',
    skill_tier_2 CHAR(1) NOT NULL COMMENT '스킬2 등급 E~C',
    skill_tier_3 CHAR(1) NOT NULL COMMENT '스킬3 등급 E~C',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '저장(이미지 저장 누른) 시각',
    PRIMARY KEY (id),
    INDEX idx_user_simulator_saves (user_id, created_at),
    CONSTRAINT fk_user_simulator_saves_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '스킬 시뮬레이터 이미지 저장 기록 (덧붙임 전용, 영구)';
