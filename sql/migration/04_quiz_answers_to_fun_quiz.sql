-- ============================================================
-- 04. 퀴즈 정답 이관 : quiz_answers  ->  fun_quiz
-- 대상 : 최대 5건 (2026-08-20 운영 DB 실측). 아래 두 버전 중 하나를 고른다.
-- 대상 DB : compyafun (MariaDB 10.5)
-- ============================================================
--
-- [ 백업 : 실행 전 반드시 ]
--   mysqldump -u{user} -p compyafun quiz_answers fun_quiz > backup_quiz_20260820.sql
--
-- [ 실행 방법 ]
--   mysql -u{user} -p compyafun < 04_quiz_answers_to_fun_quiz.sql
--   * --force 옵션을 붙이지 말 것. 오류가 나면 즉시 중단되어 COMMIT 에 도달하지 않는다.
--
-- ============================================================
-- 중요 : 두 테이블의 구조가 다르다
-- ============================================================
--   운영 fun_quiz 컬럼 : id, round, image_url, created_at, updated_at
--   구 quiz_answers 에만 있는 컬럼 : title, is_visible
--
--   즉 v2 에는 "숨김" 이라는 개념 자체가 없다. 숨김 상태로 옮기면
--   그 회차가 그대로 사용자에게 노출된다.
--
--   실측 데이터 (5건)
--     id 1 / round 887 / 숨김
--     id 2 / round 888 / 숨김
--     id 3 / round 889 / 숨김
--     id 4 / round 890 / 노출
--     id 5 / round 893 / 노출
--
--   사용자 결정 (2026-08-21) — 5건 전부 옮긴다.
--     [2-A] 5건 전부 옮긴다          <-- 기본. 이 버전이 활성 상태다
--     [2-B] 노출 중인 2건만 옮긴다   <-- 전체 주석 처리. 필요하면 주석을 푼다
--   둘 중 하나만 실행한다.
--   숨김이던 887 / 888 / 889 도 배포 후 홈에 노출된다는 점을 알고 내린 결정이다.
--   나중에 특정 회차를 가려야 하면 fun_quiz 에서 그 행을 지우면 된다.
--
--   ! 확인 필요 : 리포지터리의 sql/V2/fun/CREATE_TABLE_FUN.sql 에는 fun_quiz 에
--     is_visible 컬럼이 있는 것으로 적혀 있으나, 운영 DB 실측에는 없다.
--     아래 INSERT 는 컬럼을 명시해서 넣으므로 어느 쪽이든 동작한다.
--     (컬럼이 있다면 기본값 true 로 채워진다)
--
-- [ 전제 (실측) ]
--   - fun_quiz 는 현재 0행이라 id 1~5 를 그대로 승계해도 충돌이 없다
--   - round 겹침 0건. round 에 UNIQUE 제약(uq_round)이 있다
--
-- [ 멱등성 방식 ]
--   INSERT ... SELECT ... WHERE NOT EXISTS (round 기준).
--   round 가 퀴즈 회차의 실질 식별자이고 UNIQUE 제약도 걸려 있다.
--   두 번 돌려도 두 번째는 0행이 들어간다.
--
-- ============================================================

SET NAMES utf8mb4;

-- ============================================================
-- [1] 실행 전 확인
-- ============================================================

-- 1-1. 현재 건수  (기대값 : quiz_answers 5 / fun_quiz 0)
SELECT
    (SELECT COUNT(*) FROM quiz_answers) AS `quiz_answers_현재`,
    (SELECT COUNT(*) FROM fun_quiz)     AS `fun_quiz_현재`;

-- 1-2. 원본 전체 목록 확인  (어떤 회차가 숨김인지 눈으로 본다)
SELECT id, round, title, is_visible, image_url, created_at
FROM quiz_answers
ORDER BY id;

-- 1-3. 이관 대상 건수  (기대값 : 노출분 2 / 전체 5)
SELECT
    SUM(CASE WHEN q.is_visible = 1 THEN 1 ELSE 0 END) AS `이관대상_노출분`,
    COUNT(*)                                          AS `이관대상_전체`
FROM quiz_answers q
WHERE NOT EXISTS (SELECT 1 FROM fun_quiz f WHERE f.round = q.round);

-- 1-4. id 충돌 확인  (기대값 : 0)
SELECT COUNT(*) AS `id_충돌`
FROM quiz_answers q
WHERE NOT EXISTS (SELECT 1 FROM fun_quiz f WHERE f.round = q.round)
  AND EXISTS     (SELECT 1 FROM fun_quiz x WHERE x.id = q.id);


-- ============================================================
-- [2-A] 기본 : 5건 전부 옮긴다  ★ 이 버전이 활성 상태 ★
--       사용자 결정 (2026-08-21) — 숨김이던 887 / 888 / 889 회차도 함께 옮긴다.
--       v2 에는 숨김 기능이 없으므로, 옮긴 회차는 배포 후 홈에 모두 노출된다.
--       나중에 특정 회차를 가려야 하면 해당 행을 지우는 방식이 된다.
-- ============================================================

START TRANSACTION;

INSERT INTO fun_quiz
    (id, round, image_url, created_at, updated_at)
SELECT
    q.id,
    q.round,
    q.image_url,
    q.created_at,
    q.updated_at
FROM quiz_answers q
WHERE NOT EXISTS (SELECT 1 FROM fun_quiz f WHERE f.round = q.round);
-- 기대 : 5 rows affected  (round 887, 888, 889, 890, 893)

COMMIT;


-- ============================================================
-- [2-B] 대안 : 노출 중인 회차만 옮긴다  ☆ 비활성 (주석 처리) ☆
--       숨김이던 887 / 888 / 889 를 빼고 890 / 893 만 옮기고 싶을 때 쓴다.
--       그 경우 fun_quiz 의 id 1~3 자리는 비어 있게 된다 (문제 없음).
--       쓰려면 [2-A] 블록 전체를 주석 처리하고 아래 주석을 푼다.
-- ============================================================
--
-- START TRANSACTION;
--
-- INSERT INTO fun_quiz
--     (id, round, image_url, created_at, updated_at)
-- SELECT
--     q.id,
--     q.round,
--     q.image_url,
--     q.created_at,
--     q.updated_at
-- FROM quiz_answers q
-- WHERE q.is_visible = 1
--   AND NOT EXISTS (SELECT 1 FROM fun_quiz f WHERE f.round = q.round);
-- -- 기대 : 2 rows affected  (round 890, 893)
--
-- COMMIT;


-- ============================================================
-- [3] AUTO_INCREMENT 보정
--     ALTER 는 자동 커밋되므로 반드시 COMMIT 뒤에 둔다.
--     기대값 : 6 (어느 버전이든 최대 id 가 5 이므로 6)
-- ============================================================
SELECT COALESCE(MAX(id), 0) + 1 INTO @next_ai FROM fun_quiz;
SET @sql := CONCAT('ALTER TABLE fun_quiz AUTO_INCREMENT = ', @next_ai);
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SELECT @next_ai AS `설정된_AUTO_INCREMENT`;


-- ============================================================
-- [4] 실행 후 검증
-- ============================================================

-- 4-1. 총 건수  (기대값 : [2-A] 2 / [2-B] 5)
SELECT COUNT(*) AS `fun_quiz_결과` FROM fun_quiz;

-- 4-2. 들어간 목록 확인
--      [2-A] 기대 : id 4(round 890), id 5(round 893)
--      [2-B] 기대 : id 1~5 (round 887, 888, 889, 890, 893)
SELECT id, round, image_url, created_at FROM fun_quiz ORDER BY id;

-- 4-3. round 중복  (기대값 : 0행. uq_round 제약이 있어 원래 0이어야 한다)
SELECT round, COUNT(*) AS cnt
FROM fun_quiz
GROUP BY round
HAVING cnt > 1;

-- 4-4. 값이 어긋난 회차  (기대값 : 0행)
SELECT q.round
FROM quiz_answers q
JOIN fun_quiz f ON f.round = q.round
WHERE NOT (q.image_url <=> f.image_url)
   OR NOT (q.created_at <=> f.created_at);

-- 4-5. 안 넘어간 회차 확인
--      [2-A] 기대 : 3행 (887 / 888 / 889 — 의도적으로 제외한 숨김 회차)
--      [2-B] 기대 : 0행
SELECT q.id, q.round, q.title, q.is_visible
FROM quiz_answers q
WHERE NOT EXISTS (SELECT 1 FROM fun_quiz f WHERE f.round = q.round);

-- 4-6. 참고 : 구 title 은 v2 에 대응 컬럼이 없어 버려진다.
--      화면 표시 문구가 필요하면 프론트에서 round 값으로 만들어 쓴다.
SELECT id, round, title FROM quiz_answers ORDER BY id;


-- ============================================================
-- [5] 롤백 방법
-- ============================================================
--
-- 방법 1 (가장 확실) : 백업 덤프 복원
--   mysql -u{user} -p compyafun < backup_quiz_20260820.sql
--
-- 방법 2 : 이관분만 지우기 (fun_quiz 는 이관 전 0행이었다)
--   -- [2-A] 로 넣었을 때
--   -- DELETE FROM fun_quiz WHERE round IN (890, 893);
--   -- [2-B] 로 넣었을 때
--   -- DELETE FROM fun_quiz WHERE round IN (887, 888, 889, 890, 893);
--
-- 방법 3 : 이관 후 신규 회차 등록이 없었다면 전체 비우기
--   -- DELETE FROM fun_quiz;
--   ! 이관 전 fun_quiz 가 0행이었다는 실측에 기댄 방법이다.
-- ============================================================
