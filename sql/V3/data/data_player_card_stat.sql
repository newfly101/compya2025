-- =====================================================================
-- 노말 카드 스탯 스키마 (data_player_legend_stat 오마주)
--
--   data_player_card_stat   태생 5스탯 + OVR         (카드 1:1)
--   data_player_card_pitch  투수 카드 보유 구종 + 등급  (1:N)
--
-- 스탯은 legend 와 같은 stat1~stat5 중립 슬롯을 쓴다. 카드 등급(노말~플래티넘)별
-- 스탯이 아니라 카드 원형(data_player_card) 1장당 태생 스탯 1세트다.
-- 화면 라벨은 애플리케이션(PlayerStatLabel)이 player_role 로 결정한다.
--
-- legend 와 다른 점 — rating / rating_rev(커뮤니티 평점)를 두지 않는다.
-- 노말 카드는 게임 화면 실측치라 "출처 불명 평점"이라는 개념 자체가 없다.
--
-- id 는 애플리케이션(파이썬) 생성 UUID. MariaDB UUID() 는 v1 이라 쓰지 않는다.
-- data_player_card_stat 은 별도 id 없이 PK 가 card_id 다(legend_stat 이 PK=legend_id 인 것과 동일).
-- data_player_card_pitch 의 id 는 UUID v5(카드id+구종코드 기반) — 근거는 아래 테이블 주석.
-- =====================================================================

USE compyafun;

-- FK 호환 확인 — 부모 data_player_card.id 와 COLUMN_TYPE / COLLATION_NAME 이 같아야 한다
-- SELECT COLUMN_TYPE, COLLATION_NAME FROM information_schema.COLUMNS
--  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'data_player_card' AND COLUMN_NAME = 'id';

-- DROP TABLE IF EXISTS data_player_card_pitch;
-- DROP TABLE IF EXISTS data_player_card_stat;

-- ─────────────────────────────────────────────────────────────────────
-- 노말 카드 태생 스탯
--
--   HITTER  stat1 정확 / stat2 파워 / stat3 선구 / stat4 주력 / stat5 수비
--   PITCHER stat1 제구 / stat2 구위 / stat3 체력 / stat4 직구 / stat5 변화
--
-- 정본: test-docs/노말선수_스탯,구종등급_정리_최종본.xlsx (게임 화면 실측, 3회 교차검수).
-- 에픽 카드는 이 정본에 스탯이 비어 있어 이번 적재 범위 밖이다.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_player_card_stat
(
    card_id CHAR(36)         NOT NULL COMMENT 'data_player_card.id. 카드 원형 1장당 1행',

    stat1   TINYINT UNSIGNED NOT NULL COMMENT '타자 정확 / 투수 제구',
    stat2   TINYINT UNSIGNED NOT NULL COMMENT '타자 파워 / 투수 구위',
    stat3   TINYINT UNSIGNED NOT NULL COMMENT '타자 선구 / 투수 체력',
    stat4   TINYINT UNSIGNED NOT NULL COMMENT '타자 주력 / 투수 직구',
    stat5   TINYINT UNSIGNED NOT NULL COMMENT '타자 수비 / 투수 변화',

    -- 기본 정렬 키. 애플리케이션에서 계산하거나 직접 INSERT 하지 않는다
    ovr DECIMAL(4, 1) AS ((stat1 + stat2 + stat3 + stat4 + stat5) / 5.0) STORED
        COMMENT '태생 5스탯 평균 (자동 계산)',

    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (card_id),
    INDEX idx_dpcs_ovr (ovr),

    CONSTRAINT fk_dpcs_card FOREIGN KEY (card_id)
        REFERENCES data_player_card (id) ON DELETE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '노말 카드 태생 스탯 (게임 화면 실측)';

-- ─────────────────────────────────────────────────────────────────────
-- 노말 카드 보유 구종 (투수 카드만)
--
-- 구종 마스터는 data_pitch_type 을 그대로 쓴다(legend 와 공용, 이 파일에서 새로 만들지 않는다).
--
-- 엑셀 「투수_구종등급」시트의 '-'(그 구종 없음)는 행으로 만들지 않는다 — 즉 보유한
-- 구종만 행이 생긴다(미보유 = 행 없음, legend_pitch 와 동일한 설계).
--
-- pitch_grade 를 NOT NULL 로 한다 — legend_pitch 는 "아직 조사 못 한 구종"이 있을 수 있어
-- NULL 을 허용했지만, 여기 정본은 게임 화면을 12,000회 캡처해 3회 교차검수한 표라 '-' 가
-- 아닌 칸은 전부 등급이 확정돼 있다. 미확정 상태로 행만 먼저 넣을 일이 없으므로 NULL 을
-- 열어둘 이유가 없다 — 등급 없는 행이 생기면 그 자체가 데이터 오류다.
--
-- ENUM 선언 순서는 정렬 전용. 노말 카드는 실측상 A~D 만 나오지만 E/S 도 열어둔다
-- (legend 와 등급 체계를 공유해야 두 테이블을 나란히 볼 때 등급 의미가 갈리지 않는다).
--
-- 무결성 책임 — FK: 존재하는 카드인가 / 생성 스크립트: 그 카드가 PITCHER 인가.
-- FK 로는 player_role 조건을 걸 수 없고, legend_pitch 와 같은 이유로 트리거는 이 규모에
-- 과하다고 판단했다 — scripts/gen_card_stat_sql.py 가 엑셀의 '타자/투수' 열로 걸러
-- PITCHER 카드에만 행을 만들고, 적재 SQL 끝의 검증 쿼리로 위반 여부를 확인한다.
-- ─────────────────────────────────────────────────────────────────────
CREATE TABLE data_player_card_pitch
(
    id          CHAR(36)    NOT NULL COMMENT '식별자 (UUID v5, card_id+pitch_code 기반)',
    card_id     CHAR(36)    NOT NULL COMMENT 'data_player_card.id. PITCHER 여부는 생성 스크립트가 검증',
    pitch_code  VARCHAR(20) NOT NULL COMMENT 'data_pitch_type.pitch_code',

    pitch_grade ENUM ('E','D','C','B','A','S')
                            NOT NULL COMMENT '태생 구종 등급. 행이 있으면 항상 확정값(위 주석 참고)',

    created_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at  DATETIME    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    PRIMARY KEY (id),
    UNIQUE KEY uk_dpcp (card_id, pitch_code),
    INDEX idx_dpcp_grade (pitch_grade),

    CONSTRAINT fk_dpcp_card FOREIGN KEY (card_id)
        REFERENCES data_player_card (id) ON DELETE CASCADE,

    -- 구종 마스터는 삭제 전파 대상이 아니다 (참조 중이면 삭제가 막혀야 한다)
    CONSTRAINT fk_dpcp_type FOREIGN KEY (pitch_code)
        REFERENCES data_pitch_type (pitch_code),

    CONSTRAINT chk_dpcp_pitch_grade CHECK (
        pitch_grade IN ('E', 'D', 'C', 'B', 'A', 'S')
        )
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT '노말 카드(투수) 보유 구종 + 태생 등급';
