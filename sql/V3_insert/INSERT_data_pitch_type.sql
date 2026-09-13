-- data_pitch_type 마스터 시드 (구종 코드 10종)
--
-- 2026-09-13 sql/ 재편 시 DDL 파일(sql/V3/CREATE_02_data_player_legend.sql)
-- 에서 분리했다. 원래 그 파일에 CREATE TABLE 과 함께 있던 고정 마스터 데이터다.
--
-- sort_no = 게임 UI 배치 순서.

USE compyafun;

INSERT INTO data_pitch_type (pitch_code, pitch_name, stat_group, sort_no)
VALUES ('FOUR_SEAM', '포심', 'FASTBALL', 1),
       ('TWO_SEAM', '투심', 'FASTBALL', 2),
       ('CHANGEUP', '체인지업', 'BREAKING', 3),
       ('CIRCLE_CHANGEUP', '서클체인지업', 'BREAKING', 4),
       ('SLIDER', '슬라이더', 'BREAKING', 5),
       ('CURVE', '커브', 'BREAKING', 6),
       ('FORKBALL', '포크', 'BREAKING', 7),
       ('CUTTER', '커터', 'FASTBALL', 8),
       ('SINKER', '싱커', 'FASTBALL', 9),
       ('SPLITTER', '스플리터', 'FASTBALL', 10);
