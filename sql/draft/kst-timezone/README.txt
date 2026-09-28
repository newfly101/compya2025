목적: ADR 0007 3단계 — site_coupons/site_notices 의 created_at/updated_at 을 TIMESTAMP 에서
DATETIME 으로 통일한다. 여기 있는 SQL 은 사용자가 직접 실행한다 (test DB = prod DB, agent 는 접속 안 함).

실행 순서
1. 00_check.sql 을 실행하고 결과(타임존 3종 + 36테이블 컬럼 목록 + 표본 5행)를 보관해둔다 — 변경 전 기준값
2. 01_set_session_kst.sql 과 02_alter_timestamp_to_datetime.sql 을 같은 세션(같은 클라이언트 접속)에서 이어서 실행한다
3. (선택, 서버 전체에 영향) 03_set_global_kst.sql 은 my.cnf 영구 설정을 같이 넣을 준비가 됐을 때만 실행한다
4. 04_verify.sql 을 실행해 00 과 대조한다
5. 문제가 있으면 99_rollback.sql 로 되돌린다 (01 로 세션을 먼저 +09:00 으로 맞춘 뒤 실행)

실행 결과를 03_verify(04_verify.sql) 출력과 함께 알려 주면 DDL·history 를 확정한다.
