-- =====================================================================
-- 레전드 스탯 / 구종 데이터 적재
--
-- 출처   : test-docs/레전드 재료 앱 디자인/레전드_평점표_수치대입.xlsx
-- 매칭   : legend_id 하드코딩 없이 legend_name JOIN (74명 전원 일치 확인)
-- 선행   : data_player_legend.sql → _INSERT.sql → data_player_legend_stat.sql
-- =====================================================================

USE compyafun;

-- 평점 출처 판본. 갱신 시 이 값만 바꿔 재적재.
-- chk_dpls_rating_rev 제약이 있어 NULL 로 두면 평점 보유 행이 전부 거부된다
SET @rating_rev = '2026-06-17';

-- ─────────────────────────────────────────────────────────────────────
-- 1. 태생 스탯 74행
--   HITTER  stat1 정확 / stat2 파워 / stat3 선구 / stat4 주력 / stat5 수비
--   PITCHER stat1 제구 / stat2 구위 / stat3 체력 / stat4 직구 / stat5 변화
-- ovr 은 생성 컬럼이라 넣지 않는다. 평점 미수록 6인은 rating NULL.
-- ─────────────────────────────────────────────────────────────────────

-- (분리됨: INSERT_data_player_legend_stat.sql 에서 data_player_legend_stat 부분만 추출. 내용은 원본과 동일)

INSERT INTO data_player_legend_stat (legend_id, stat1, stat2, stat3, stat4, stat5, rating, rating_rev)
SELECT l.id, v.stat1, v.stat2, v.stat3, v.stat4, v.stat5, v.rating,
       IF(v.rating IS NULL, NULL, @rating_rev)
FROM data_player_legend l
         JOIN (
    SELECT   '이종범' AS legend_name, 79 AS stat1, 70 AS stat2, 77 AS stat3, 86 AS stat4, 73 AS stat5, 99.5 AS rating   -- HITTER
    UNION ALL SELECT '이대호', 79, 79, 77, 59, 74, 93.5   -- HITTER
    UNION ALL SELECT '심정수', 73, 80, 80, 63, 77, 93.5   -- HITTER
    UNION ALL SELECT '백인천', 80, 76, 79, 65, 64, 92.1   -- HITTER
    UNION ALL SELECT '양준혁', 74, 73, 76, 73, 77, 89.5   -- HITTER
    UNION ALL SELECT '장종훈', 74, 74, 74, 71, 72, 88   -- HITTER
    UNION ALL SELECT '마해영', 77, 75, 75, 67, 72, 87.8   -- HITTER
    UNION ALL SELECT '이승엽', 71, 80, 75, 68, 72, 87.3   -- HITTER
    UNION ALL SELECT '최형우', 77, 74, 76, 59, 77, 85.5   -- HITTER
    UNION ALL SELECT '장효조', 76, 72, 77, 68, 68, 85   -- HITTER
    UNION ALL SELECT '김기태S', 74, 74, 77, 67, 68, 84.5   -- HITTER
    UNION ALL SELECT '이병규B', 74, 73, 71, 75, 77, 84.5   -- HITTER
    UNION ALL SELECT '구자욱', 74, 74, 72, 71, 76, 84.1   -- HITTER
    UNION ALL SELECT '장성호', 74, 71, 74, 67, 77, 82.5   -- HITTER
    UNION ALL SELECT '박정태', 73, 69, 75, 69, 76, 82.4   -- HITTER
    UNION ALL SELECT '박병호', 74, 78, 71, 64, 72, 82.3   -- HITTER
    UNION ALL SELECT '손아섭', 76, 69, 76, 66, 75, 82.3   -- HITTER
    UNION ALL SELECT '양의지', 72, 73, 73, 65, 77, 81.8   -- HITTER
    UNION ALL SELECT '김태균S', 76, 70, 77, 59, 75, 80.8   -- HITTER
    UNION ALL SELECT '김현수B', 74, 70, 76, 65, 75, 80.8   -- HITTER
    UNION ALL SELECT '이만수', 74, 74, 72, 64, 68, 80   -- HITTER
    UNION ALL SELECT '박민우', 76, 65, 74, 71, 72, 80   -- HITTER
    UNION ALL SELECT '정근우', 73, 65, 74, 76, 73, 79.8   -- HITTER
    UNION ALL SELECT '최정', 71, 78, 71, 64, 73, 79.6   -- HITTER
    UNION ALL SELECT '박재홍', 70, 73, 71, 72, 77, 79   -- HITTER
    UNION ALL SELECT '강민호', 71, 76, 70, 62, 74, 78.2   -- HITTER
    UNION ALL SELECT '이순철', 70, 68, 72, 77, 74, 76.5   -- HITTER
    UNION ALL SELECT '류중일', 71, 65, 72, 74, 77, 76.3   -- HITTER
    UNION ALL SELECT '나성범', 74, 71, 70, 66, 74, 76   -- HITTER
    UNION ALL SELECT '한대화', 73, 68, 76, 66, 67, 75.6   -- HITTER
    UNION ALL SELECT '박경완', 68, 74, 72, 65, 77, 75.5   -- HITTER
    UNION ALL SELECT '전준호B', 70, 62, 73, 84, 75, 75.3   -- HITTER
    UNION ALL SELECT '김동주B', 73, 73, 73, 59, 69, 74.8   -- HITTER
    UNION ALL SELECT '김재박', 71, 63, 72, 77, 73, 74.3   -- HITTER
    UNION ALL SELECT '김성한B', 73, 71, 73, 64, 66, 74.3   -- HITTER
    UNION ALL SELECT '박용택', 75, 69, 71, 66, 69, 74.3   -- HITTER
    UNION ALL SELECT '이호준B', 68, 73, 71, 68, 74, 74   -- HITTER
    UNION ALL SELECT '홍성흔', 72, 67, 70, 67, 77, 73.8   -- HITTER
    UNION ALL SELECT '이범호', 70, 72, 72, 62, 74, 73   -- HITTER
    UNION ALL SELECT '박진만', 69, 70, 70, 68, 73, 72.8   -- HITTER
    UNION ALL SELECT '박한이', 71, 65, 73, 68, 77, 72   -- HITTER
    UNION ALL SELECT '오지환', 67, 69, 69, 71, 76, 71.4   -- HITTER
    UNION ALL SELECT '우즈', 70, 75, 69, 59, 71, 70.5   -- HITTER
    UNION ALL SELECT '김재현S', 68, 68, 69, 69, 75, 67.8   -- HITTER
    UNION ALL SELECT '송지만', 68, 73, 67, 67, 77, NULL   -- HITTER
    UNION ALL SELECT '황재균', 73, 71, 71, 70, 70, NULL   -- HITTER
    UNION ALL SELECT '추신수', 74, 74, 79, 72, 75, NULL   -- HITTER
    UNION ALL SELECT '선동열', 77, 74, 74, 80, 74, 89   -- PITCHER
    UNION ALL SELECT '구대성', 78, 77, 56, 74, 75, 87.2   -- PITCHER
    UNION ALL SELECT '최동원', 74, 69, 71, 77, 76, 86.4   -- PITCHER
    UNION ALL SELECT '김시진', 71, 71, 71, 74, 77, 80.6   -- PITCHER
    UNION ALL SELECT '박철순', 73, 68, 73, 73, 76, 76.6   -- PITCHER
    UNION ALL SELECT '정민태', 73, 68, 75, 74, 75, 75.9   -- PITCHER
    UNION ALL SELECT '배영수', 71, 68, 71, 78, 73, 74.8   -- PITCHER
    UNION ALL SELECT '임기효', 76, 74, 53, 73, 71, 73.2   -- PITCHER
    UNION ALL SELECT '이상훈C', 74, 70, 77, 74, 75, 72.8   -- PITCHER
    UNION ALL SELECT '류현진', 75, 72, 77, 68, 71, 70.4   -- PITCHER
    UNION ALL SELECT '김용수', 72, 67, 56, 71, 74, 70   -- PITCHER
    UNION ALL SELECT '이강철', 71, 67, 74, 73, 74, 67   -- PITCHER
    UNION ALL SELECT '조계현', 72, 68, 78, 73, 71, 65.8   -- PITCHER
    UNION ALL SELECT '정민철', 75, 71, 78, 69, 72, 65.8   -- PITCHER
    UNION ALL SELECT '송진우', 72, 72, 76, 68, 72, 63.2   -- PITCHER
    UNION ALL SELECT '윤석민', 74, 72, 74, 69, 69, 63   -- PITCHER
    UNION ALL SELECT '오승환', 74, 74, 50, 80, 69, 62.2   -- PITCHER
    UNION ALL SELECT '니퍼트', 71, 68, 72, 72, 74, 61.4   -- PITCHER
    UNION ALL SELECT '김광현', 71, 71, 73, 71, 68, 56.6   -- PITCHER
    UNION ALL SELECT '양현종', 71, 70, 71, 71, 70, 56.2   -- PITCHER
    UNION ALL SELECT '정명원', 73, 68, 54, 65, 72, 53.4   -- PITCHER
    UNION ALL SELECT '윤학길', 72, 63, 74, 68, 73, 52   -- PITCHER
    UNION ALL SELECT '정우람', 72, 68, 55, 68, 71, 51.8   -- PITCHER
    UNION ALL SELECT '김원형', 73, 68, 73, 65, 69, 50.2   -- PITCHER
    UNION ALL SELECT '손민한', 73, 67, 72, 65, 74, NULL   -- PITCHER
    UNION ALL SELECT '한용덕', 74, 68, 74, 68, 70, NULL   -- PITCHER
    UNION ALL SELECT '박찬호B', 77, 76, 75, 69, 76, NULL   -- PITCHER
) v ON v.legend_name = l.legend_name;

-- ─────────────────────────────────────────────────────────────────────
-- 2. 투수 보유 구종 — 보유분만 행 생성 (엑셀 빈칸 = 미보유)
-- pitch_grade 는 등급이 적힌 신규 3인만 채운다 (24인 칸 숫자는 별개 분석값)
-- ─────────────────────────────────────────────────────────────────────
