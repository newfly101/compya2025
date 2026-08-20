-- =====================================================================
-- kbo / wiki / skill / coach 15개 테이블 삭제 스크립트
-- 작성일: 2026-08-20
-- 대상 스키마: compyafun
--
-- ⚠️ 실행 전 반드시 전체 백업 필수 (mysqldump 등). 이 스크립트는
--    작성만 하고 아직 실행하지 않았다. 실제 실행은 백업 확인 후
--    운영자가 별도로 진행한다.
--
-- 삭제 사유: kbo(승부예측), wiki(백과사전 게임정보), skill/coach(코치 스킬)
-- 도메인 완전 폐기 결정. coach 기능 서버 코드는 domain/skill 안에 있어
-- skill 도메인 삭제 시 함께 제거됐고, 이 스크립트에서 테이블도 함께 정리한다.
-- 행 수는 2026-08-20 기준 운영 DB 실측치
-- (docs/global-guide/develop/specs/db/prod-actual-state.md 참고).
--
-- 순서 원칙: 외래키로 다른 테이블을 참조하는 자식 테이블부터 삭제하고,
-- 참조당하는 부모 테이블은 마지막에 삭제한다.
-- =====================================================================

USE compyafun;

-- ---------------------------------------------------------------------
-- 1. KBO 계열 (6개) — 승부예측, 사용하는 서버 코드 없음(고아 테이블)
-- ---------------------------------------------------------------------

-- kbo_batter_logs (530행) — 경기별 타자 기록. kbo_games, kbo_players 를 FK 로 참조 → 먼저 삭제
DROP TABLE IF EXISTS kbo_batter_logs;

-- kbo_games (735행) — 경기 일정/결과. kbo_seasons, kbo_teams 를 FK 로 참조
DROP TABLE IF EXISTS kbo_games;

-- kbo_players (167행) — 선수 마스터. kbo_teams 를 FK 로 참조
DROP TABLE IF EXISTS kbo_players;

-- kbo_teams (10행) — 팀 마스터. 위 3개 테이블의 FK 부모
DROP TABLE IF EXISTS kbo_teams;

-- kbo_seasons (1행) — 시즌 마스터. kbo_games 의 FK 부모
DROP TABLE IF EXISTS kbo_seasons;

-- kbo_team_code_mappings (10행) — 외부(네이버) 팀 코드 매핑.
-- legacy teams(id) 를 FK 로 참조하지만 다른 kbo_* 테이블과는 무관 → 순서 상관없이 삭제 가능
DROP TABLE IF EXISTS kbo_team_code_mappings;


-- ---------------------------------------------------------------------
-- 2. WIKI 계열 (3개) — 백과사전 게임정보(마구/등급/스탯영향), 전부 0행
-- ---------------------------------------------------------------------

-- wiki_pitch_grade (0행) — 마구 등급. wiki_pitch 를 FK 로 참조 → 먼저 삭제
DROP TABLE IF EXISTS wiki_pitch_grade;

-- wiki_stat_influence (0행) — 스탯 영향. 다른 wiki 테이블과 FK 없음
DROP TABLE IF EXISTS wiki_stat_influence;

-- wiki_pitch (0행) — 마구 마스터. wiki_pitch_grade 의 FK 부모
DROP TABLE IF EXISTS wiki_pitch;


-- ---------------------------------------------------------------------
-- 3. SKILL 계열 (3개) — player_skills 는 92행 실데이터지만,
--    wiki 삭제와 함께 정리 대상으로 확정됨 (스킬 백과사전 화면 소멸 결정 포함)
-- ---------------------------------------------------------------------

-- skill_pitcher_grade_stat (120행) — 스킬×등급별 스탯. player_skills 를 FK 로 참조 → 먼저 삭제
DROP TABLE IF EXISTS skill_pitcher_grade_stat;

-- skill_score_config (97행) — 스킬 점수표. player_skills 를 FK 로 참조 → 먼저 삭제
DROP TABLE IF EXISTS skill_score_config;

-- player_skills (92행) — 스킬 마스터. 위 2개 테이블의 FK 부모
DROP TABLE IF EXISTS player_skills;


-- ---------------------------------------------------------------------
-- 4. COACH 계열 (3개) — 코치 스킬(마스터 버프/조건). skill 도메인 서버
--    코드에 함께 있었기 때문에 skill 삭제 시 서버 코드도 함께 제거됨
-- ---------------------------------------------------------------------

-- coach_skill_buff (24행) — 코치 스킬 버프. FK 제약 없음, 먼저 삭제
DROP TABLE IF EXISTS coach_skill_buff;

-- coach_skill_condition (23행) — 코치 스킬 조건. FK 제약 없음, 먼저 삭제
DROP TABLE IF EXISTS coach_skill_condition;

-- coach (6행) — 코치 마스터. 위 2개 테이블과 개념상 부모, 마지막에 삭제
DROP TABLE IF EXISTS coach;
