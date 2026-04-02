-- =====================================================
-- KBO 리그 MariaDB 스키마
-- JSON 원본 필드 기준으로 설계
-- 연도 확장 가능 (2026 → 2027 → ...)
-- =====================================================

-- -----------------------------------------------------
-- 1. 시즌 마스터
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS kbo_seasons
(
    season_year SMALLINT NOT NULL COMMENT '시즌 연도 (2026, 2027 ...)',
    start_date  DATE     NOT NULL COMMENT '정규시즌 시작일',
    end_date    DATE     NOT NULL COMMENT '정규시즌 종료일',
    total_games SMALLINT DEFAULT 720 COMMENT '정규시즌 총 경기수',
    created_at  DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (season_year)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='KBO 시즌 마스터';

INSERT IGNORE INTO kbo_seasons (season_year, start_date, end_date, total_games)
VALUES (2026, '2026-03-28', '2026-09-06', 720);


-- -----------------------------------------------------
-- 2. 팀 마스터
--    team_code = 네이버 기준 (LG, HH, SK, OB ...)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS kbo_teams
(
    team_code  VARCHAR(4)  NOT NULL COMMENT '네이버 팀 코드 (LG, HH, SK ...)',
    team_name  VARCHAR(20) NOT NULL COMMENT '팀명 (LG, 한화, SSG ...)',
    emblem_url VARCHAR(255) COMMENT '팀 엠블럼 이미지 URL',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (team_code)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='KBO 팀 마스터';

INSERT IGNORE INTO kbo_teams (team_code, team_name, emblem_url)
VALUES ('LG', 'LG', 'https://sports-phinf.pstatic.net/team/kbo/default/LG.png'),
       ('HH', '한화', 'https://sports-phinf.pstatic.net/team/kbo/default/HH.png'),
       ('SK', 'SSG', 'https://sports-phinf.pstatic.net/team/kbo/default/SK.png'),
       ('SS', '삼성', 'https://sports-phinf.pstatic.net/team/kbo/default/SS.png'),
       ('NC', 'NC', 'https://sports-phinf.pstatic.net/team/kbo/default/NC.png'),
       ('KT', 'KT', 'https://sports-phinf.pstatic.net/team/kbo/default/KT.png'),
       ('LT', '롯데', 'https://sports-phinf.pstatic.net/team/kbo/default/LT.png'),
       ('HT', 'KIA', 'https://sports-phinf.pstatic.net/team/kbo/default/HT.png'),
       ('OB', '두산', 'https://sports-phinf.pstatic.net/team/kbo/default/OB.png'),
       ('WO', '키움', 'https://sports-phinf.pstatic.net/team/kbo/default/WO.png');


-- -----------------------------------------------------
-- 3. 경기 테이블 (핵심)
--    game_id = 네이버 고유 ID (PK)
--    예) "20260401HTLG02026"
--    BEFORE : 스코어 0, 투수명 빈값
--    RESULT : 스코어/투수 실데이터
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS kbo_games
(

    -- 식별
    game_id              VARCHAR(20) NOT NULL COMMENT '네이버 경기 ID (20260401HTLG02026)',
    season_year          SMALLINT    NOT NULL COMMENT '시즌 연도',

    -- 카테고리
    category_id          VARCHAR(10)          DEFAULT 'kbo' COMMENT 'kbo',
    category_name        VARCHAR(20)          DEFAULT 'KBO리그' COMMENT 'KBO리그',
    round_code           VARCHAR(20) COMMENT 'kbo_r (정규시즌)',

    -- 일정
    game_date            DATE        NOT NULL COMMENT '경기 날짜',
    game_datetime        DATETIME COMMENT '경기 시작 일시',
    time_tbd             TINYINT(1)           DEFAULT 0 COMMENT '시간 미정 여부',
    stadium              VARCHAR(20) COMMENT '구장명 (잠실, 대전 ...)',

    -- 홈팀
    home_team_code       VARCHAR(4)  NOT NULL COMMENT '홈팀 코드',
    home_team_name       VARCHAR(20) COMMENT '홈팀명',
    home_score           TINYINT              DEFAULT 0 COMMENT '홈팀 득점',
    home_starter         VARCHAR(20)          DEFAULT '' COMMENT '홈팀 선발투수',
    home_current_pitcher VARCHAR(20) COMMENT '홈팀 현재 투수',
    home_emblem_url      VARCHAR(255) COMMENT '홈팀 엠블럼 URL',

    -- 원정팀
    away_team_code       VARCHAR(4)  NOT NULL COMMENT '원정팀 코드',
    away_team_name       VARCHAR(20) COMMENT '원정팀명',
    away_score           TINYINT              DEFAULT 0 COMMENT '원정팀 득점',
    away_starter         VARCHAR(20)          DEFAULT '' COMMENT '원정팀 선발투수',
    away_current_pitcher VARCHAR(20) COMMENT '원정팀 현재 투수',
    away_emblem_url      VARCHAR(255) COMMENT '원정팀 엠블럼 URL',

    -- 결과
    winner               ENUM ('HOME','AWAY','DRAW')
                                              DEFAULT 'DRAW' COMMENT '승자',
    win_pitcher          VARCHAR(20)          DEFAULT '' COMMENT '승리투수',
    lose_pitcher         VARCHAR(20)          DEFAULT '' COMMENT '패전투수',

    -- 상태
    status_code          ENUM ('BEFORE','LIVE','RESULT','CANCEL')
                                     NOT NULL DEFAULT 'BEFORE' COMMENT '경기 상태',
    status_num           TINYINT              DEFAULT 0 COMMENT '상태 번호 (0:경기전, 4:종료)',
    status_info          VARCHAR(20) COMMENT '상태 텍스트 (9회초, 경기전 ...)',
    canceled             TINYINT(1)           DEFAULT 0 COMMENT '취소 여부',
    suspended            TINYINT(1)           DEFAULT 0 COMMENT '중단 여부',

    -- 기타
    broadcast            VARCHAR(50)          DEFAULT '' COMMENT '중계 채널',
    has_video            TINYINT(1)           DEFAULT 0 COMMENT '영상 유무',
    reversed_home_away   TINYINT(1)           DEFAULT 0 COMMENT '홈/원정 반전 여부',

    -- 메타
    created_at           DATETIME             DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME             DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- 제약
    PRIMARY KEY (game_id),

    CONSTRAINT fk_games_season
        FOREIGN KEY (season_year) REFERENCES kbo_seasons (season_year),

    CONSTRAINT fk_games_home_team
        FOREIGN KEY (home_team_code) REFERENCES kbo_teams (team_code),

    CONSTRAINT fk_games_away_team
        FOREIGN KEY (away_team_code) REFERENCES kbo_teams (team_code)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='KBO 경기 일정 및 결과';


-- -----------------------------------------------------
-- 인덱스
-- -----------------------------------------------------

-- 날짜별 경기 조회 (가장 빈번)
CREATE INDEX idx_games_date
    ON kbo_games (game_date);

-- 시즌별 전체 조회
CREATE INDEX idx_games_season
    ON kbo_games (season_year);

-- 상태별 조회
CREATE INDEX idx_games_status
    ON kbo_games (status_code);

-- 날짜 + 상태 복합 (오늘 결과, 내일 일정)
CREATE INDEX idx_games_date_status
    ON kbo_games (game_date, status_code);

-- 팀별 경기 조회
CREATE INDEX idx_games_home_team
    ON kbo_games (home_team_code);

CREATE INDEX idx_games_away_team
    ON kbo_games (away_team_code);


-- -------------------------------------------------------
-- 초기 일정 삽입 (BEFORE 상태)
-- -------------------------------------------------------
-- 초기 일정 삽입 (BEFORE 상태)
INSERT INTO kbo_games (game_id, season_year, game_date, game_datetime,
                       stadium, home_team_code, home_team_name,
                       away_team_code, away_team_name,
                       status_code, winner)
VALUES ('20260401HTLG02026', 2026, '2026-04-01', '2026-04-01T18:30:00',
        '잠실', 'LG', 'LG',
        'HT', 'KIA',
        'BEFORE', 'DRAW')
ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP;
-- 이미 있으면 그냥 패스

-- 경기 결과 업데이트
UPDATE kbo_games
SET home_score   = 7,
    away_score   = 2,
    winner       = 'HOME',
    win_pitcher  = '김진성',
    lose_pitcher = '양현종',
    status_code  = 'RESULT',
    status_info  = '9회초'
WHERE game_id = '20260401HTLG02026';



-- =====================================================
-- KBO 선수 마스터 + 경기별 타자 기록 스키마
-- =====================================================


-- -----------------------------------------------------
-- 1. 선수 마스터
--    playerCode = 네이버 기준 고유 코드
--    경기마다 중복 저장 방지용
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS kbo_players
(
    player_code   VARCHAR(10) NOT NULL COMMENT '네이버 선수 코드',
    player_name   VARCHAR(20) NOT NULL COMMENT '선수명',
    team_code     VARCHAR(4) COMMENT '소속팀 코드 (현재 기준)',
    position_name VARCHAR(20) COMMENT '포지션명 (투수, 포수, 외야수 ...)',

    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (player_code),

    CONSTRAINT fk_players_team
        FOREIGN KEY (team_code) REFERENCES kbo_teams (team_code)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='KBO 선수 마스터';


-- -----------------------------------------------------
-- 2. 경기별 타자 기록
--    game_id + player_code = 복합 PK
--    안타 예측 모델의 핵심 데이터
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS kbo_batter_logs
(

    -- 식별
    game_id            VARCHAR(20) NOT NULL COMMENT '경기 ID',
    player_code        VARCHAR(10) NOT NULL COMMENT '선수 코드',
    season_year        SMALLINT    NOT NULL COMMENT '시즌 연도',

    -- 선수 기본 (중복 저장 — 조인 없이 바로 쓰기 위해)
    player_name        VARCHAR(20) COMMENT '선수명',
    team_code          VARCHAR(4) COMMENT '소속팀 코드',
    team_name          VARCHAR(20) COMMENT '소속팀명',
    opposing_team_code VARCHAR(4) COMMENT '상대팀 코드',
    opposing_team_name VARCHAR(20) COMMENT '상대팀명',

    -- 경기 정보
    game_date          DATE COMMENT '경기 날짜',
    stadium            VARCHAR(20) COMMENT '구장',
    is_home            TINYINT(1)    DEFAULT 0 COMMENT '홈 경기 여부 (1=홈, 0=원정)',

    -- 타석 기록 (핵심)
    bat_order          TINYINT COMMENT '타순 (1~9)',
    position           VARCHAR(10) COMMENT '포지션 (우, 좌, 중, 포, 一 ...)',
    ab                 TINYINT       DEFAULT 0 COMMENT '타수',
    hit                TINYINT       DEFAULT 0 COMMENT '안타',
    hr                 TINYINT       DEFAULT 0 COMMENT '홈런',
    rbi                TINYINT       DEFAULT 0 COMMENT '타점',
    run                TINYINT       DEFAULT 0 COMMENT '득점',
    bb                 TINYINT       DEFAULT 0 COMMENT '볼넷',
    kk                 TINYINT       DEFAULT 0 COMMENT '삼진',
    sb                 TINYINT       DEFAULT 0 COMMENT '도루',
    hra                DECIMAL(5, 3) DEFAULT 0 COMMENT '타율 (당일 누적)',

    -- 대타 여부
    substitute_in      TINYINT(1)    DEFAULT 0 COMMENT '대타/대주자 여부',

    -- 메타
    created_at         DATETIME      DEFAULT CURRENT_TIMESTAMP,
    updated_at         DATETIME      DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (game_id, player_code),

    CONSTRAINT fk_batter_logs_game
        FOREIGN KEY (game_id) REFERENCES kbo_games (game_id),

    CONSTRAINT fk_batter_logs_player
        FOREIGN KEY (player_code) REFERENCES kbo_players (player_code)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='경기별 타자 기록';


-- -----------------------------------------------------
-- 인덱스
-- -----------------------------------------------------

-- 선수별 전체 기록 조회 (타율 추이, 최근 N경기)
CREATE INDEX idx_batter_logs_player
    ON kbo_batter_logs (player_code);

-- 날짜별 조회
CREATE INDEX idx_batter_logs_date
    ON kbo_batter_logs (game_date);

-- 시즌별 조회
CREATE INDEX idx_batter_logs_season
    ON kbo_batter_logs (season_year);

-- 팀별 조회
CREATE INDEX idx_batter_logs_team
    ON kbo_batter_logs (team_code);

-- 선수 + 날짜 복합 (특정 선수의 최근 기록)
CREATE INDEX idx_batter_logs_player_date
    ON kbo_batter_logs (player_code, game_date);

-- 안타 예측 핵심: 선수 + 상대팀 상대전적
CREATE INDEX idx_batter_logs_player_opposing
    ON kbo_batter_logs (player_code, opposing_team_code);
