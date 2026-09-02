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
INSERT INTO data_player_legend_pitch (id, legend_id, pitch_code, pitch_grade)
SELECT v.id, l.id, v.pitch_code, v.pitch_grade
FROM data_player_legend l
         JOIN (
    SELECT   '5530b3af-4d7e-4dd9-b6e0-74a16c5d06a6' AS id, '선동열' AS legend_name, 'FOUR_SEAM' AS pitch_code, CAST(NULL AS CHAR(1)) AS pitch_grade
    UNION ALL SELECT 'a8ca810f-d86c-4090-9b0b-d8576113327b', '선동열', 'CHANGEUP', NULL
    UNION ALL SELECT 'c7b37144-463b-4901-b43f-33bf8e4b5679', '선동열', 'SLIDER', NULL
    UNION ALL SELECT '30663392-51bf-4a8e-876c-f7c21075bd38', '선동열', 'FORKBALL', NULL
    UNION ALL SELECT 'a3ccafe3-6a49-42c8-b60a-08b89eed097e', '구대성', 'FOUR_SEAM', NULL
    UNION ALL SELECT '7007df40-6724-4264-9d48-9f25679090c2', '구대성', 'SINKER', NULL
    UNION ALL SELECT '8d6cc589-431d-4c04-9cce-1d5661530828', '구대성', 'CHANGEUP', NULL
    UNION ALL SELECT '8d9af6cb-6a27-4340-b2fa-0f9e5c8782e4', '구대성', 'SLIDER', NULL
    UNION ALL SELECT 'f01c779c-6f9d-450b-86db-472699635e4b', '구대성', 'CURVE', NULL
    UNION ALL SELECT 'af167e23-7bbb-4494-b44b-56ea71fdfc8b', '최동원', 'FOUR_SEAM', NULL
    UNION ALL SELECT 'b2d62af3-642d-4824-81bb-9a0085e2aa4d', '최동원', 'TWO_SEAM', NULL
    UNION ALL SELECT '7f586839-bbd0-436e-8ecc-7ae8f2f9df3b', '최동원', 'SPLITTER', NULL
    UNION ALL SELECT 'b10cbd77-d185-4809-a830-9236ec6c4836', '최동원', 'SLIDER', NULL
    UNION ALL SELECT 'a0f045d2-5226-4fe5-abd0-77cf8467848b', '최동원', 'CURVE', NULL
    UNION ALL SELECT 'b2207407-b7f5-43af-8ee9-89579d7876e5', '김시진', 'FOUR_SEAM', NULL
    UNION ALL SELECT 'deacfbc0-4ff1-4243-b42f-a577210863d3', '김시진', 'TWO_SEAM', NULL
    UNION ALL SELECT 'c99bf238-5f9f-40b2-b8a8-86883cbfc43f', '김시진', 'CHANGEUP', NULL
    UNION ALL SELECT 'd6ec4134-5913-4cb7-a637-e667ee0010a0', '김시진', 'SLIDER', NULL
    UNION ALL SELECT 'f5715d1f-fc12-4dd0-a27b-25b6ca483e90', '김시진', 'CURVE', NULL
    UNION ALL SELECT '550c1d0e-afac-4431-ba0c-502695c813ed', '박철순', 'FOUR_SEAM', NULL
    UNION ALL SELECT 'e051f5a1-0421-4f68-ae91-f6f7c7c7646e', '박철순', 'TWO_SEAM', NULL
    UNION ALL SELECT '41dc148d-ccab-4590-af1c-8ac9a0dcff2c', '박철순', 'CHANGEUP', NULL
    UNION ALL SELECT 'b8615d58-377b-4f93-bf31-14e3ca63373f', '박철순', 'SLIDER', NULL
    UNION ALL SELECT 'bcc5cb15-6fa4-49df-89f8-03e8e974d8d1', '박철순', 'CURVE', NULL
    UNION ALL SELECT '3851908b-678a-4117-8dfa-0e6f58e5407f', '정민태', 'FOUR_SEAM', NULL
    UNION ALL SELECT '32f7eb69-f3b5-454e-81e9-49ea23578409', '정민태', 'SINKER', NULL
    UNION ALL SELECT '8f79d4e3-66de-44ad-b2bc-6b952fcee7d3', '정민태', 'SLIDER', NULL
    UNION ALL SELECT '235b3dd5-0e1a-41cf-8fe6-459e6edbcb7c', '정민태', 'CURVE', NULL
    UNION ALL SELECT '501fdca7-99af-42da-8f0c-cf9e4a7a38c9', '정민태', 'FORKBALL', NULL
    UNION ALL SELECT '99b11dd5-50bd-4aee-b63a-04d4089953b9', '배영수', 'FOUR_SEAM', NULL
    UNION ALL SELECT 'cce4a12f-89f2-436d-8bfa-63ac83e5f6cb', '배영수', 'CHANGEUP', NULL
    UNION ALL SELECT 'a96ba3ff-f9d3-4738-ab79-a82f639f0402', '배영수', 'SLIDER', NULL
    UNION ALL SELECT '08ed092c-d26d-4a53-8b00-fe38abd9a971', '배영수', 'FORKBALL', NULL
    UNION ALL SELECT '888bdf2b-2762-40ac-8e49-9285f12d1192', '임기효', 'FOUR_SEAM', NULL
    UNION ALL SELECT 'a6345c62-a814-4591-b413-735d159481ff', '임기효', 'TWO_SEAM', NULL
    UNION ALL SELECT '44d78a0f-1b8c-43cb-8502-e0aa7e026f9f', '임기효', 'CHANGEUP', NULL
    UNION ALL SELECT 'df1d2fbc-1fe8-4422-9d9c-1f84a24f77c2', '임기효', 'SLIDER', NULL
    UNION ALL SELECT '4f444b8b-3eab-47f9-95e9-f1b0d38e1e3e', '임기효', 'CURVE', NULL
    UNION ALL SELECT '13435f4a-1132-46d3-8d26-b98f79dd9b44', '이상훈C', 'FOUR_SEAM', NULL
    UNION ALL SELECT '8953c43d-09ea-4854-8b2b-f4e00b96595d', '이상훈C', 'CHANGEUP', NULL
    UNION ALL SELECT '4fc76160-805a-4b8f-838c-a02dad608d1d', '이상훈C', 'SLIDER', NULL
    UNION ALL SELECT '93cf63bf-3ceb-4047-a524-bca3b6d6b5e8', '이상훈C', 'CURVE', NULL
    UNION ALL SELECT '7eb1d13c-2090-46e3-a5fd-9938534825e7', '이상훈C', 'FORKBALL', NULL
    UNION ALL SELECT '405e16ff-dbf0-429f-91dd-a00e7cbcd7c7', '류현진', 'FOUR_SEAM', NULL
    UNION ALL SELECT 'fdb42527-70b7-4a26-acfc-386cbaa16dd5', '류현진', 'CHANGEUP', NULL
    UNION ALL SELECT '62394c53-bedb-4dda-8ee9-214e34995d13', '류현진', 'CIRCLE_CHANGEUP', NULL
    UNION ALL SELECT '42760109-e75f-4949-a2e4-8015cefbda47', '류현진', 'SLIDER', NULL
    UNION ALL SELECT 'db42606d-58c5-46d4-8356-6c77515ddb18', '류현진', 'CURVE', NULL
    UNION ALL SELECT '8ec9bcd5-cb2b-4db7-b79f-dceb349245eb', '김용수', 'FOUR_SEAM', NULL
    UNION ALL SELECT '43c1bd9c-cb6c-4519-8716-b34b22306662', '김용수', 'SLIDER', NULL
    UNION ALL SELECT 'b7d7dbd4-cc27-41c5-b798-dfa7a21c128c', '김용수', 'CURVE', NULL
    UNION ALL SELECT '18ecd91a-0916-4095-9119-761e362b69f5', '김용수', 'FORKBALL', NULL
    UNION ALL SELECT '71c8dde2-339a-4c13-aeb6-b77667f50ac8', '이강철', 'FOUR_SEAM', NULL
    UNION ALL SELECT 'b42123ef-fe28-4450-87f6-7a15c6f80842', '이강철', 'SINKER', NULL
    UNION ALL SELECT '6d68b983-84c3-40d0-a7e6-3673127fe615', '이강철', 'CHANGEUP', NULL
    UNION ALL SELECT 'a980d066-113b-4baa-91ab-84489d911f54', '이강철', 'SLIDER', NULL
    UNION ALL SELECT 'eadb6f41-7d06-4ef4-b326-1f8ab3f823b9', '이강철', 'CURVE', NULL
    UNION ALL SELECT '7da2c303-f3e1-4dce-b489-731b629ffbfd', '조계현', 'FOUR_SEAM', NULL
    UNION ALL SELECT '530d602a-29dc-4491-91d2-a3cc422c605e', '조계현', 'SINKER', NULL
    UNION ALL SELECT '6d457451-47b0-48ed-bbc7-18f41a79d58a', '조계현', 'SLIDER', NULL
    UNION ALL SELECT '8106fdde-62e8-49b8-a3f8-1f8c0a3869bb', '조계현', 'CURVE', NULL
    UNION ALL SELECT '5c5f9ff5-88a8-4c62-bd52-151292f46a40', '조계현', 'FORKBALL', NULL
    UNION ALL SELECT 'e0699ede-a6de-4576-96bd-f376ae0cad89', '정민철', 'FOUR_SEAM', NULL
    UNION ALL SELECT '2207cc1f-15b2-4c78-b952-7c1fa6dd00b6', '정민철', 'SINKER', NULL
    UNION ALL SELECT '9dbf9996-fbff-4940-b445-783d7fd42bd9', '정민철', 'SLIDER', NULL
    UNION ALL SELECT '718c69bf-7614-4650-b467-9a9e77488db9', '정민철', 'CURVE', NULL
    UNION ALL SELECT '0e3754fc-af07-4fea-a73b-ec1f08c09cea', '정민철', 'FORKBALL', NULL
    UNION ALL SELECT '40548c6d-332e-41d3-9303-48a4bc8b1ba4', '송진우', 'FOUR_SEAM', NULL
    UNION ALL SELECT '7d9d0513-7445-4bd6-904a-31d415f6e1fc', '송진우', 'SINKER', NULL
    UNION ALL SELECT 'a4d65a29-e4c3-4e40-862e-658ada6092d2', '송진우', 'CHANGEUP', NULL
    UNION ALL SELECT 'cdf59a47-e6e8-4594-bfc7-4fcf91911968', '송진우', 'SLIDER', NULL
    UNION ALL SELECT '1031d1c5-dc88-4d43-b7cb-62f0cc5a0a9f', '송진우', 'FORKBALL', NULL
    UNION ALL SELECT '12233114-24bf-4702-b65f-f6428f5e884a', '윤석민', 'FOUR_SEAM', NULL
    UNION ALL SELECT 'c431a74d-b1ec-4404-b89e-8cb93c098f2e', '윤석민', 'SINKER', NULL
    UNION ALL SELECT 'ccaa90eb-d8d2-42d3-9b38-053dcdfb485b', '윤석민', 'CIRCLE_CHANGEUP', NULL
    UNION ALL SELECT '5eaf5ac1-08b6-4d68-96cf-278c655cc1a2', '윤석민', 'SLIDER', NULL
    UNION ALL SELECT '1bba9859-341b-412d-9c8e-5ecc95c70e46', '윤석민', 'CURVE', NULL
    UNION ALL SELECT '056b7183-81d1-445b-88ca-cc6e002928a9', '오승환', 'FOUR_SEAM', NULL
    UNION ALL SELECT '429f812a-e432-4a09-8a8c-18fa33d9ee2a', '오승환', 'CHANGEUP', NULL
    UNION ALL SELECT 'a4fe8c91-3d1a-4406-94d6-65a8d93fcb89', '오승환', 'SLIDER', NULL
    UNION ALL SELECT '0563e2aa-c034-4524-a514-5bcf4c3fcbce', '오승환', 'CURVE', NULL
    UNION ALL SELECT 'b6e06f08-d8fb-4753-9302-3f52c45e8dff', '오승환', 'FORKBALL', NULL
    UNION ALL SELECT 'b53df540-ae7d-4290-8e57-d97cc5fe3e32', '니퍼트', 'FOUR_SEAM', NULL
    UNION ALL SELECT '951b5c0a-54b4-45e9-bdb2-1c5ea15160b4', '니퍼트', 'CHANGEUP', NULL
    UNION ALL SELECT '52553eaf-5203-410e-adf4-ce8548778dab', '니퍼트', 'SLIDER', NULL
    UNION ALL SELECT 'b5399a87-b235-4b62-b7b5-51352bf9c257', '니퍼트', 'CURVE', NULL
    UNION ALL SELECT '1717cbe6-40df-4e43-b56c-bc2e6ddf2ed6', '니퍼트', 'FORKBALL', NULL
    UNION ALL SELECT '95be4692-3d4f-4181-906d-35455ee41dfc', '김광현', 'FOUR_SEAM', NULL
    UNION ALL SELECT '4562b36b-40b6-4141-9bd0-fd70eb25d7dd', '김광현', 'CUTTER', NULL
    UNION ALL SELECT 'f53fcee9-3ac9-4647-87f0-8aa4ff429adb', '김광현', 'SLIDER', NULL
    UNION ALL SELECT '4c1cec61-8d68-442f-aedd-1889fb93686c', '김광현', 'CURVE', NULL
    UNION ALL SELECT '967fcd25-c94f-4c33-a4b2-cb7197e2f767', '김광현', 'FORKBALL', NULL
    UNION ALL SELECT '49cda067-e256-4f41-9cdd-47eb34e96a0d', '양현종', 'FOUR_SEAM', NULL
    UNION ALL SELECT 'c029a2d9-5797-4e2b-9f02-6bc7789f661a', '양현종', 'CHANGEUP', NULL
    UNION ALL SELECT '68e409f7-93df-4362-ba21-05011660b8c4', '양현종', 'CIRCLE_CHANGEUP', NULL
    UNION ALL SELECT 'bea9e409-f19c-4b3c-b214-b50a0621d17f', '양현종', 'SLIDER', NULL
    UNION ALL SELECT '6001655a-e670-4ff6-913e-f6666133e77d', '양현종', 'CURVE', NULL
    UNION ALL SELECT 'd6cd4518-5292-4f3d-9858-c1d248884c17', '정명원', 'FOUR_SEAM', NULL
    UNION ALL SELECT '9305ac0c-2853-4af6-9222-98aab2dd0a07', '정명원', 'TWO_SEAM', NULL
    UNION ALL SELECT 'e9cacf0c-6502-4da0-83e4-af83bb520e8c', '정명원', 'SLIDER', NULL
    UNION ALL SELECT '8851aaf8-fb31-4748-a935-a77902359710', '정명원', 'CURVE', NULL
    UNION ALL SELECT '42fad3ed-8faa-4870-85bf-c37712a2ee1a', '정명원', 'FORKBALL', NULL
    UNION ALL SELECT '41a6de1b-dc93-4fba-bd83-c5f75cee38e4', '윤학길', 'FOUR_SEAM', NULL
    UNION ALL SELECT '59a8271a-e9c2-432b-9771-19f538cb2539', '윤학길', 'CHANGEUP', NULL
    UNION ALL SELECT '717a73ef-dc90-4ed6-aae5-66bbe5f398f6', '윤학길', 'SLIDER', NULL
    UNION ALL SELECT '1b068576-f729-4ee7-984e-5b3fb57598da', '윤학길', 'CURVE', NULL
    UNION ALL SELECT '4194c345-cd96-4598-959e-e09579caa59d', '윤학길', 'FORKBALL', NULL
    UNION ALL SELECT '6a304279-28e4-40db-806e-94e6cc2d45fa', '정우람', 'FOUR_SEAM', NULL
    UNION ALL SELECT '15c900ee-754f-45d6-8b2e-0ed1f5183483', '정우람', 'SINKER', NULL
    UNION ALL SELECT '1ba34f74-b541-46b5-9c00-cb5cebbfc051', '정우람', 'CHANGEUP', NULL
    UNION ALL SELECT '6490fc55-15b9-40df-8547-510e42eb3bd1', '정우람', 'SLIDER', NULL
    UNION ALL SELECT '4e25350f-51b5-4501-be0f-6bc8f5c94ac1', '정우람', 'CURVE', NULL
    UNION ALL SELECT '4b872c24-5a07-4a34-b00b-343e434ac174', '김원형', 'FOUR_SEAM', NULL
    UNION ALL SELECT '67259ff4-26c4-4ce8-8864-665111f8fdf6', '김원형', 'SINKER', NULL
    UNION ALL SELECT '748f88ff-bd0b-417a-83a4-ca91fd840a2c', '김원형', 'CIRCLE_CHANGEUP', NULL
    UNION ALL SELECT '8735c554-c0cc-4409-8726-8e0211c0bd0e', '김원형', 'CURVE', NULL
    UNION ALL SELECT '0b2f15e2-4fcc-4f1c-b58a-dad6c8b8eea1', '김원형', 'FORKBALL', NULL
    UNION ALL SELECT '34081071-0f2c-410a-91a9-2ecfa762854e', '손민한', 'FOUR_SEAM', 'B'
    UNION ALL SELECT '920a40c6-9f47-4d39-b747-b1ba1e23bf3e', '손민한', 'CHANGEUP', 'B'
    UNION ALL SELECT '464d1d08-7b6b-4d51-aa6c-8ce8aca46154', '손민한', 'CIRCLE_CHANGEUP', 'B'
    UNION ALL SELECT '74e52a2b-1b87-4ed2-9169-24ddb0790fa1', '손민한', 'SLIDER', 'B'
    UNION ALL SELECT '1a73a355-28c7-4194-9c97-ac7fe7ac66e8', '손민한', 'CURVE', 'B'
    UNION ALL SELECT '6c1960df-8d19-47a7-a018-a8beee220980', '한용덕', 'FOUR_SEAM', 'B'
    UNION ALL SELECT 'be479554-722f-411b-9717-80b7436db786', '한용덕', 'CHANGEUP', 'C'
    UNION ALL SELECT 'f8c19c11-be41-4a81-8647-dbf6615d7e40', '한용덕', 'SLIDER', 'B'
    UNION ALL SELECT 'fdc5e3c1-ebf1-4638-bc85-8e022421ef2d', '한용덕', 'CURVE', 'C'
    UNION ALL SELECT '94d60c6f-5c85-4eec-b872-b5189681f019', '한용덕', 'FORKBALL', 'B'
    UNION ALL SELECT '61f6758a-92d0-4314-8e40-352b49535102', '박찬호B', 'FOUR_SEAM', 'A'
    UNION ALL SELECT '101d31db-bd41-48e3-a9f6-62a17378c284', '박찬호B', 'CUTTER', 'C'
    UNION ALL SELECT '86c2aeb7-c4a3-4f05-ab44-fb9d50331bba', '박찬호B', 'CHANGEUP', 'B'
    UNION ALL SELECT 'd840d8a1-6430-4deb-9b9c-51de4631aff7', '박찬호B', 'SLIDER', 'B'
    UNION ALL SELECT '2a80b6d2-9221-4671-9b74-43883e520e41', '박찬호B', 'CURVE', 'B'
) v ON v.legend_name = l.legend_name;

-- ─────────────────────────────────────────────────────────────────────
-- 3. 적재 검증
-- ─────────────────────────────────────────────────────────────────────
-- 스탯 74행 / 평점 보유 행 수 확인
SELECT COUNT(*) AS stat_rows, COUNT(rating) AS rated_rows FROM data_player_legend_stat;

-- 구종 행 수 + 등급 채워진 행 수 확인
SELECT COUNT(*) AS pitch_rows, COUNT(pitch_grade) AS graded_rows FROM data_player_legend_pitch;

-- 스탯이 안 붙은 레전드가 있는지 (0행이어야 정상)
SELECT l.legend_name, l.player_role
FROM data_player_legend l
         LEFT JOIN data_player_legend_stat s ON s.legend_id = l.id
WHERE s.legend_id IS NULL;

-- 통합 시트 미리보기 — 태생 상위/하위 판별용
SELECT l.legend_name,
       l.player_role,
       l.legend_type,
       l.team_code,
       s.ovr,
       s.rating,
       RANK() OVER (PARTITION BY l.player_role ORDER BY s.ovr DESC) AS role_rank
FROM data_player_legend l
         JOIN data_player_legend_stat s ON s.legend_id = l.id
ORDER BY s.ovr DESC;
