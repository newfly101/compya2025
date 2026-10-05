-- 레전드 보유 현황: 액자 획득일(사용자 입력) 컬럼. ⚠️ 미적용 — 사용자 승인 후 ops 트랙에서 실행 (test DB = prod DB)
-- 목적: 액자로 얻은 날짜(frame_acquired_at)와 보유중이 된 날짜(acquired_at)를 따로 기록
-- 되돌릴 수 있나: 예 — 아래 99 롤백 절 (액자 획득일만 사라짐, 기존 상태 행은 그대로)
-- 실행 전 조건: site_legend_states 와 acquired_at 컬럼 존재(legend_acquired_at_state_logs.sql 적용 후). 기존 행의 frame_acquired_at 은 NULL 로 둔다(백필 금지)
-- 실행 순서: ① 이 파일 → ② BE 배포. ⚠️ 배포가 먼저면 /api/legend-collections* 가 500 (없는 컬럼 조회)
-- 01_site.sql 의 정의와 동기화됨

ALTER TABLE site_legend_states
    ADD COLUMN frame_acquired_at DATE NULL COMMENT '액자 획득일 (사용자 입력)' AFTER acquired_at;

-- 99 롤백
-- ALTER TABLE site_legend_states DROP COLUMN frame_acquired_at;
