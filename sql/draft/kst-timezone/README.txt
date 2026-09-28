KST 시간대 통일 — 남은 단계 (2026-09-28 기준)
완료: 3단계 (site_coupons·site_notices 4컬럼 TIMESTAMP→DATETIME) — v.2.0.0/applied/kst_timestamp_to_datetime.sql 로 이동
남은 것:
1. 03_set_global_kst.sql — 서버 전역 타임존 +09:00 (선택). 실행하면 서버 my.cnf [mysqld] default-time-zone='+09:00' 도 같이 넣어야 재시작 후 유지된다
2. 운영 서버의 application-prod.properties 에 spring.jackson.time-zone=Asia/Seoul, JDBC URL ?timezone=+09:00 (⚠️ Asia/Seoul 같은 이름은 시간대 테이블이 없는 MariaDB 에서 접속 자체가 실패한다 — 2026-09-29 로컬 재현) 추가 (gitignore 파일이라 저장소 밖 작업) 후 BE 재배포
3. systemd 기동 옵션 -Duser.timezone=Asia/Seoul (deploy-runbook § 3)
전부 끝나면 이 폴더를 지우고 ADR 0007 을 accepted 로 바꾼다.
