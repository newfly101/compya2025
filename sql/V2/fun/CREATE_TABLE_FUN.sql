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

CREATE TABLE fun_player_card
(
    id             BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '카드 고유 식별자 (PK)',
    card_code      VARCHAR(60)               NOT NULL COMMENT '카드 고유 코드 (GRADE_ROLE_TEAM_PLAYER_YEAR 규칙)',
    player_id      CHAR(36)                  NULL COMMENT '선수 마스터 ID (fun_players.id, 추후 FK 연결 예정)',
    player_name    VARCHAR(50)               NOT NULL COMMENT '카드 기준 선수명 (예: 박찬호, 박찬호S, 박찬호B)',
    team_id        BIGINT                    NULL COMMENT '소속 팀 ID (fun_teams.id 참조)',
    player_role    ENUM ('HITTER','PITCHER') NOT NULL COMMENT '선수 역할 (타자: HITTER, 투수: PITCHER)',
    card_grade     ENUM ('LEGEND','EPIC','PLATINUM','MVP','NATIONAL','ALLSTAR','GOLDEN')
                                             NOT NULL COMMENT '카드 등급',
    season_year    SMALLINT                  NOT NULL COMMENT '카드 기준 시즌 연도 (LEGEND=9999, 일반=1982~현재)',
    overall_rating SMALLINT                  NOT NULL COMMENT '카드 종합 능력치',
    created_at     DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '생성 일시',
    updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '수정 일시',

    UNIQUE KEY uk_fun_player_card_card_code (card_code),

    INDEX idx_fun_player_card_player_id (player_id),
    INDEX idx_fun_player_card_team_id (team_id),
    INDEX idx_fun_player_card_grade (card_grade),
    INDEX idx_fun_player_card_role (player_role),
    INDEX idx_fun_player_card_grade_year (card_grade, season_year),

    -- FK는 fun_players 생성 이후 추가 권장
    -- CONSTRAINT fk_fun_player_card_player FOREIGN KEY (player_id) REFERENCES fun_players (id)

    -- 팀은 바로 연결 가능
    CONSTRAINT fk_fun_player_card_team FOREIGN KEY (team_id) REFERENCES fun_teams (id)
);

CREATE TABLE fun_player_card_hitter_stats
(
    card_id    BIGINT PRIMARY KEY COMMENT '타자 카드 ID (fun_player_card.id)',
    accuracy   SMALLINT NOT NULL COMMENT '정확',
    power      SMALLINT NOT NULL COMMENT '파워',
    discipline SMALLINT NOT NULL COMMENT '선구',
    speed      SMALLINT NOT NULL COMMENT '주력',
    defense    SMALLINT NOT NULL COMMENT '수비',

    CONSTRAINT fk_fun_player_card_hitter_stats_card
        FOREIGN KEY (card_id)
            REFERENCES fun_player_card (id)
            ON DELETE CASCADE
);

CREATE TABLE fun_player_card_pitcher_stats
(
    card_id  BIGINT PRIMARY KEY COMMENT '투수 카드 ID (fun_player_card.id)',
    control  SMALLINT NOT NULL COMMENT '제구',
    velocity SMALLINT NOT NULL COMMENT '구위',
    stamina  SMALLINT NOT NULL COMMENT '체력',
    fastball SMALLINT NOT NULL COMMENT '직구',
    breaking SMALLINT NOT NULL COMMENT '변화',

    CONSTRAINT fk_fun_player_card_pitcher_stats_card
        FOREIGN KEY (card_id)
            REFERENCES fun_player_card (id)
            ON DELETE CASCADE
);

CREATE TABLE fun_player_card_pitcher_pitch_grades
(
    card_id               BIGINT PRIMARY KEY COMMENT '투수 카드 ID (fun_player_card.id)',
    four_seam_grade       VARCHAR(2) NULL COMMENT '포심 등급',
    two_seam_grade        VARCHAR(2) NULL COMMENT '투심 등급',
    changeup_grade        VARCHAR(2) NULL COMMENT '체인지업 등급',
    circle_changeup_grade VARCHAR(2) NULL COMMENT '서클체인지업 등급',
    slider_grade          VARCHAR(2) NULL COMMENT '슬라이더 등급',
    curve_grade           VARCHAR(2) NULL COMMENT '커브 등급',
    forkball_grade        VARCHAR(2) NULL COMMENT '포크 등급',
    cutter_grade          VARCHAR(2) NULL COMMENT '커터 등급',
    sinker_grade          VARCHAR(2) NULL COMMENT '싱커 등급',
    splitter_grade        VARCHAR(2) NULL COMMENT '스플리터 등급',

    CONSTRAINT fk_fun_player_card_pitcher_pitch_grades_card
        FOREIGN KEY (card_id)
            REFERENCES fun_player_card (id)
            ON DELETE CASCADE
);

CREATE TABLE fun_player_card_positions
(
    id            BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '카드 포지션 고유 식별자',
    card_id       BIGINT      NOT NULL COMMENT '카드 ID (fun_player_card.id)',
    position_code VARCHAR(10) NOT NULL COMMENT '포지션 코드 (예: C, 1B, 2B, 3B, SS, LF, CF, RF, DH, SP, RP, CP)',
    display_order TINYINT     NOT NULL DEFAULT 1 COMMENT '표시 순서',

    UNIQUE KEY uk_fun_player_card_positions (card_id, position_code),
    INDEX idx_fun_player_card_positions_card_id (card_id),
    INDEX idx_fun_player_card_positions_position_code (position_code),

    CONSTRAINT fk_fun_player_card_positions_card
        FOREIGN KEY (card_id) REFERENCES fun_player_card (id)
            ON DELETE CASCADE
);
