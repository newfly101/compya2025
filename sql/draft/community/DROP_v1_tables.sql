-- =====================================================================
-- ⛔ 실행 금지 (2026-08-20 확인)
--
-- 이 스크립트는 개발 초기에 작성된 전체 초기화용이며,
-- 지금 실행하면 운영 데이터가 사라지고 도중에 실패한다.
--
-- 1) 운영 중인 라이브 테이블이 들어 있다
--      users(305행) / user_roles(305행) — 운영 로그인이 지금도 쓰는 테이블
--      coupons(50행) / events(33행)     — 관리자 화면이 지금도 쓰는 테이블
--      posts(242행) / boards / tags     — 커뮤니티 데이터
--    운영 서버는 아직 v1(master) 코드로 떠 있어 이 테이블들에 계속 기록한다.
--
-- 2) 외래키 삭제 순서가 틀려 도중에 실패한다
--      player_skills 를 먼저 지우려 하지만 자식 테이블이 남아 있어 실패하고,
--      teams 는 player_card / player_legend 가 참조 중이라 지워지지 않는다.
--      앞부분만 지워진 채 중단되어 복구가 까다로운 상태가 된다.
--
-- 3) 이미 없는 테이블이 포함되어 있다
--      player_skills / skill_pitcher_grade_stat 은 2026-08-20 에 삭제됨.
--      IF EXISTS 가 없어 이 지점에서 오류가 난다.
--
-- 대신 참고할 것
--      테이블별 삭제 가능 여부와 순서:
--        docs/global-guide/develop/specs/db/table-classification.md
--      운영 DB 실측 현황:
--        docs/global-guide/develop/specs/db/prod-actual-state.md
--
-- legacy 테이블 정리는 v2 배포와 데이터 이관을 마친 뒤에 진행한다.
-- =====================================================================

USE compyafun;

DROP TABLE player_skills;
DROP TABLE teams;
DROP TABLE player_legend;
DROP TABLE player_legend_hitter_career;
DROP TABLE player_legend_pitcher_career;
DROP TABLE legend_pitcher_pitch_slot;
DROP TABLE skill_pitcher_grade_stat;

DROP TABLE user_roles;
DROP TABLE users;

DROP TABLE events;
DROP TABLE coupons;

DROP TABLE boards;
DROP TABLE posts;

DROP TABLE tags;
DROP TABLE posts_tags;


DROP TABLE notices;
