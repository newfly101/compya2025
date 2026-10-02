-- legendCollectionSkills 저장 테이블 2종(스킬 현재 상태·이벤트 로그). spec v0.3.4 § 4, LCSK-R1.
-- ⚠️ 미적용 — 사용자 승인 전 실행 금지. test DB = prod DB 이므로 실행 즉시 운영 반영
-- 목적: 레전드별 스킬 3칸 등록·강화 상태 저장 + 강화 횟수·사용량 집계용 로그. 없으면 /api/legend-collection-skills* 가 전부 500
-- 되돌릴 수 있나: 예 — 아래 99 롤백 절 (이용자 스킬 기록만 사라지고 마스터·legendCollections 테이블은 무관)
-- 실행 전 조건: site_users 존재. 스킬·레전드 id 는 참조만 하므로 FK 를 걸지 않는다(재적재 금지 규칙)
-- 탈퇴: 사용자 삭제 시 ON DELETE CASCADE 로 두 테이블 모두 함께 지워진다
-- 일괄 적용(BULK_*) 표식 컬럼은 없다 — spec 대로 로그(마지막 RESET 이후 BULK_* 유무)로 판단
-- 실행 순서: ① 이 파일 → ② BE 배포

CREATE TABLE IF NOT EXISTS site_user_legend_skills
(
    user_id        BIGINT   NOT NULL COMMENT 'site_users.id',
    legend_id      CHAR(36) NOT NULL COMMENT 'data_player_legend.id (FK 없음)',
    skill1_id      CHAR(36) NULL COMMENT '슬롯1 data_player_skill.id (FK 없음, 스킬 초기화 시 NULL)',
    skill1_base    ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯1 등록 등급',
    skill1_current ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯1 현재 등급(강화 반영)',
    skill2_id      CHAR(36) NULL COMMENT '슬롯2 data_player_skill.id',
    skill2_base    ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯2 등록 등급',
    skill2_current ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯2 현재 등급',
    skill3_id      CHAR(36) NULL COMMENT '슬롯3 data_player_skill.id',
    skill3_base    ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯3 등록 등급',
    skill3_current ENUM ('E','D','C','B','A','S') NULL COMMENT '슬롯3 현재 등급',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시 (동시 수정 경고 비교용)',
    PRIMARY KEY (user_id, legend_id),
    CONSTRAINT fk_user_legend_skills_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '이용자×레전드 스킬 3칸 현재 상태 (일괄 적용 여부는 로그로 판단)';

CREATE TABLE IF NOT EXISTS site_user_legend_skill_logs
(
    id         BIGINT   NOT NULL AUTO_INCREMENT COMMENT '로그 id',
    user_id    BIGINT   NOT NULL COMMENT 'site_users.id',
    legend_id  CHAR(36) NOT NULL COMMENT 'data_player_legend.id (FK 없음)',
    action     ENUM ('SAVE','BASE_UP','GCG_UP','GGG_UP','UNDO','RESET','BULK_S','BULK_NO_GGG') NOT NULL COMMENT '이벤트 종류',
    slot       TINYINT  NULL COMMENT '강화한 슬롯 1~3 (해당 없으면 NULL)',
    snapshot   JSON     NOT NULL COMMENT '그 시점 3슬롯 [{skillId, base, current} x3] — 조회 조건으로 쓰지 않으므로 JSON',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '발생 일시',
    PRIMARY KEY (id),
    INDEX idx_user_legend_skill_logs (user_id, legend_id),
    CONSTRAINT fk_user_legend_skill_logs_user FOREIGN KEY (user_id) REFERENCES site_users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COMMENT '레전드 스킬 이벤트 로그 (덧붙임 전용, 사용자 삭제 시 함께 삭제)';

-- 99 롤백
-- DROP TABLE site_user_legend_skill_logs;
-- DROP TABLE site_user_legend_skills;
