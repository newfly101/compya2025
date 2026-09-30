-- legendCollections 저장 테이블 3종(재료 상태·레전드 상태·선호). 사용자 승인 2026-09-29, 운영 DB 적용 완료(자가 테스트 2026-09-29~30). ⚠️ test DB = prod DB
-- 목적: 레전드 재료 보유 현황 저장 테이블 3종. 없으면 /api/legend-collections* 4개가 전부 500
-- 되돌릴 수 있나: 예 — 아래 99 롤백 절 (이용자 기록만 사라지고 마스터 data_player_legend* 는 무관)
-- 실행 전 조건: site_users 존재. 마스터 재료 id 는 조회·참조만 하므로 FK 를 걸지 않는다(재적재 금지 규칙)
-- 탈퇴: 기존 탈퇴 처리(보관 기간 후 사용자 삭제)에 맡기고, 사용자 삭제 시 ON DELETE CASCADE 로 함께 지워진다
-- 실행 순서: ① 이 파일 (CREATE TABLE IF NOT EXISTS 라 재실행 안전) → ② BE 재시작 없이 바로 동작
-- 01_site.sql 에 통합 완료(a43d49a8). 이 파일은 적용 이력 보존용 — draft/ 에서 applied/ 로 이동 2026-09-30

CREATE TABLE IF NOT EXISTS site_legend_material_states
(
    user_id     BIGINT      NOT NULL COMMENT 'site_users.id',
    material_id CHAR(36)    NOT NULL COMMENT 'data_player_legend_material.id (마스터 원본은 읽기만, FK 없음 — 재적재 금지)',
    state       ENUM ('HAVE','INSERTED') NOT NULL COMMENT '재료 칸 상태. 미보유는 행 없음',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    PRIMARY KEY (user_id, material_id),
    CONSTRAINT fk_legend_material_states_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '이용자별 레전드 재료 칸 상태 (보유/삽입)';

CREATE TABLE IF NOT EXISTS site_legend_states
(
    user_id    BIGINT   NOT NULL COMMENT 'site_users.id',
    legend_id  CHAR(36) NOT NULL COMMENT 'data_player_legend.id (FK 없음)',
    status     ENUM ('FRAME','OWNED') NOT NULL COMMENT '레전드 상태. 미보유는 행 없음',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    PRIMARY KEY (user_id, legend_id),
    CONSTRAINT fk_legend_states_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '이용자별 레전드 상태 (액자/보유중)';

CREATE TABLE IF NOT EXISTS site_legend_preferences
(
    user_id    BIGINT   NOT NULL COMMENT 'site_users.id',
    legend_id  CHAR(36) NOT NULL COMMENT 'data_player_legend.id (FK 없음)',
    rank_no    TINYINT  NOT NULL COMMENT '선호 순위 1~10',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',
    PRIMARY KEY (user_id, legend_id),
    UNIQUE KEY uk_legend_preferences_rank (user_id, rank_no),
    CONSTRAINT fk_legend_preferences_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '이용자별 선호 레전드 순위 (최대 10)';

-- 99 롤백
-- DROP TABLE site_legend_preferences;
-- DROP TABLE site_legend_states;
-- DROP TABLE site_legend_material_states;
