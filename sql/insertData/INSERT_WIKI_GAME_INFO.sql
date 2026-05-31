-- ============================================================
-- WIKI GAME INFO 시드 (1차 — placeholder)
-- 사용자가 실제 값을 채워 운영 DB 에 적용
-- wiki_pitch → wiki_pitch_grade 순서로 실행 (FK 의존)
-- ============================================================

-- 1) 마구 등록
-- INSERT INTO wiki_pitch (code, name, pitch_type, description, display_order) VALUES
--     ('FASTBALL_4SEAM', '포심패스트볼', 'FASTBALL', '<설명>', 1),
--     ('FASTBALL_2SEAM', '투심패스트볼', 'FASTBALL', '<설명>', 2),
--     ('CURVE',          '커브',         'BREAKING', '<설명>', 10),
--     ('SLIDER',         '슬라이더',     'BREAKING', '<설명>', 11),
--     ('CHANGEUP',       '체인지업',     'OFFSPEED',  '<설명>', 20);

-- 2) 마구 등급 (wiki_pitch 먼저 INSERT 후 실행)
-- INSERT INTO wiki_pitch_grade (pitch_code, grade, velocity_min, velocity_max, break_amount, description) VALUES
--     ('FASTBALL_4SEAM', 'S', 150, 160, 0, '<설명>'),
--     ('FASTBALL_4SEAM', 'A', 145, 150, 0, '<설명>'),
--     ('FASTBALL_4SEAM', 'B', 140, 145, 0, '<설명>');

-- 3) 스탯 영향 등록
-- INSERT INTO wiki_stat_influence (target, stat_code, influence_type, influence_target, weight, description, display_order) VALUES
--     ('PITCHER', 'CONTROL',  'GENERAL', '제구',           5, '<설명>', 1),
--     ('PITCHER', 'VELOCITY', 'PITCH',   'FASTBALL_4SEAM', 4, '<설명>', 2),
--     ('HITTER',  'POWER',    'GENERAL', '장타',           5, '<설명>', 1),
--     ('HITTER',  'CONTACT',  'GENERAL', '타율',           5, '<설명>', 2);
