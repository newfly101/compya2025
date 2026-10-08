-- 시드 — 01_gamification_tables.sql 적용 후 1회. 설정 데이터만 넣고 유저 데이터는 건드리지 않는다.
INSERT INTO site_reward_rules (activity_type, xp, point, daily_limit, once_per_account) VALUES
 ('CHECKIN', 10, 100, 1, 0),
 ('SAVE', 2, 0, 5, 0),
 ('FIRST_SAVE', 20, 0, NULL, 1),
 ('STREAK7', 0, 100, NULL, 0);

INSERT INTO site_reward_levels (level, name, required_xp, levelup_bonus_point) VALUES
 (1, '연습생', 0, 0), (2, '신인', 50, 100), (3, '퓨처스', 150, 150), (4, '1군 콜업', 400, 250),
 (5, '주전', 800, 400), (6, '올스타', 1500, 600), (7, '골든글러브', 2500, 750),
 (8, 'MVP', 4000, 1000), (9, '레전드', 6000, 1250), (10, '명예의 전당', 9000, 1500);

-- 운영 DB 직접 수정 상태와 동일 (id 는 운영 값 그대로)
INSERT INTO site_titles (id, code, name, category, bonus_point, signup_from, signup_to, grant_end) VALUES
 (1, 'FOUNDER',      '얼리어답터', 'EARLY',    1000, '2026-01-28', '2026-06-01', NULL),
 (4, 'ATTENDANCE_7', '개근상',     'ACTIVITY',   30, NULL, NULL, NULL),
 (5, 'IRON_30',      '철인',       'ACTIVITY',  150, NULL, NULL, NULL),
 (9, 'BUG_HUNTER',   '버그 헌터',  'MANUAL',    100, NULL, NULL, NULL),
 (10, 'GM',          'GM',         'MANUAL', 1000000, NULL, NULL, NULL);
