-- =====================================================================
-- fun_teams 시드 — 원본: git 이력 sql/V2_insert/INSERT_DATA_TABLE.sql
--   (옛 `teams` 테이블 INSERT. `teams` 자체는 2026-09-27 실측으로 DB에서
--    DROP 돼 이번 재편 때 제외했으나, 데이터는 fun_teams 로 옮길 수 있어 복원함)
--
-- 컬럼 대응표 (옛 teams → 새 fun_teams, 03_fun.sql 정의 기준)
--   team_code      → team_code       그대로
--   team_name      → team_name       그대로
--   latest_team_id → latest_team_id  ⚠️ 실측 대조 필요 (아래 설명)
--   city           → city_name       이름만 변경 (원본 값 전부 NULL)
--   start_year     → start_year      그대로
--   end_year       → end_year        그대로
--   emblem_url     → emblem_url      그대로 (원본 값 전부 NULL)
--   (id 는 옛 INSERT 에도 없었음 — AUTO_INCREMENT 로 새로 채번)
--   (created_at/updated_at 은 옛 INSERT 에 없었음 — DEFAULT CURRENT_TIMESTAMP 사용)
--
-- ⚠️ 실측 대조 필요 — latest_team_id 값 1/3/5/7/8/16 은 옛 teams 테이블에서
--   "INSERT 문에 나열된 순서 = AUTO_INCREMENT id" 라는 가정으로 매겨진 위치값이다
--   (예: OB→1 은 DOO 가 이 파일에서 첫 번째로 INSERT 되어 id=1이 될 것을 전제).
--   이 파일을 fun_teams 에 그대로 실행해도 fun_teams 가 "비어 있고 AUTO_INCREMENT
--   가 1부터 시작"일 때만 같은 전제가 성립한다. fun_teams 에 이미 행이 있거나
--   AUTO_INCREMENT 오프셋이 다르면 latest_team_id 가 엉뚱한 팀을 가리키게 된다.
--   값을 추측해 바꾸지 않고 원본 그대로 옮겼다 — 실행 전 사람이 fun_teams 실제
--   id 값과 대조해 확정할 것.
--
-- 행수 대조: 옛 teams 20행 (sql-folder-map.md) = fun_teams 20행 (database-notes.md §3-3) — 일치.
-- =====================================================================

USE compyafun;

INSERT INTO fun_teams (team_code, team_name, latest_team_id, city_name, start_year, end_year, emblem_url)
VALUES ('DOO', '두산 베어스', NULL, NULL, 1999, 2025, NULL),
       ('SAM', '삼성 라이온즈', NULL, NULL, 1982, 2025, NULL),
       ('HAN', '한화 이글스', NULL, NULL, 1994, 2025, NULL),
       ('LOT', '롯데 자이언츠', NULL, NULL, 1982, 2025, NULL),
       ('KIA', 'KIA 타이거즈', NULL, NULL, 2001, 2025, NULL),
       ('KIW', '키움 히어로즈', NULL, NULL, 2008, 2025, NULL),
       ('SSG', 'SSG 랜더스', NULL, NULL, 2021, 2025, NULL),
       ('LG', 'LG 트윈스', NULL, NULL, 1990, 2025, NULL),
       ('NC', 'NC 다이노스', NULL, NULL, 2013, 2025, NULL),
       ('KT', 'KT wiz', NULL, NULL, 2015, 2025, NULL),
       ('OB', 'OB 베어스', 1, NULL, 1982, 1998, NULL),
       ('MBC', 'MBC 청룡', 8, NULL, 1982, 1989, NULL),
       ('BIN', '빙그레 이글스', 3, NULL, 1986, 1993, NULL),
       ('SUP', '삼미 슈퍼스타즈', 16, NULL, 1982, 1984, NULL),
       ('HAE', '해태 타이거즈', 5, NULL, 1982, 2000, NULL),
       ('HYU', '현대 유니콘스', NULL, NULL, 1996, 2007, NULL),
       ('SSA', '쌍방울 레이더스', NULL, NULL, 1991, 1999, NULL),
       ('CHU', '청보 핀토스', 16, NULL, 1985, 1987, NULL),
       ('PAC', '태평양 돌핀스', 16, NULL, 1988, 1995, NULL),
       ('SK', 'SK 와이번스', 7, NULL, 2000, 2020, NULL)
;
