-- 레전드 보유 현황: 획득일(사용자 입력) 컬럼 + 상태 변경 로그 테이블. ⚠️ 미적용 — 사용자 승인 후 ops 트랙에서 실행 (test DB = prod DB)
-- 목적: 보유중(OWNED) 레전드의 획득 일자 표시 · 상태가 바뀐 이력 쌓기
-- 되돌릴 수 있나: 예 — 아래 99 롤백 절 (획득일·로그만 사라짐, 기존 상태 행은 그대로)
-- 실행 전 조건: site_users · site_legend_states 존재. 기존 행의 acquired_at 은 NULL 로 둔다(백필 금지)
-- 실행 순서: ① 이 파일 → ② BE 배포. ⚠️ 배포가 먼저면 /api/legend-collections* 가 500 (없는 컬럼 조회)
-- 01_site.sql 의 정의와 동기화됨

ALTER TABLE site_legend_states
    ADD COLUMN acquired_at DATE NULL COMMENT '레전드 획득일 (사용자 입력)' AFTER status;

CREATE TABLE IF NOT EXISTS site_legend_state_logs
(
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT   NOT NULL COMMENT 'site_users.id',
    legend_id   CHAR(36) NOT NULL COMMENT 'data_player_legend.id (FK 없음)',
    from_status ENUM ('FRAME','OWNED') NULL COMMENT '변경 전 상태. NULL = 미보유',
    to_status   ENUM ('FRAME','OWNED') NULL COMMENT '변경 후 상태. NULL = 미보유',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '변경 일시',
    INDEX idx_legend_state_logs_user_legend (user_id, legend_id),
    CONSTRAINT fk_legend_state_logs_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '이용자별 레전드 상태 변경 로그 (덧붙임 전용)';

-- 99 롤백
-- DROP TABLE site_legend_state_logs;
-- ALTER TABLE site_legend_states DROP COLUMN acquired_at;
