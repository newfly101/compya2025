# scripts/ 정리 계획

> 2026-09-13 실행 완료 — .py 9개 전량 삭제 (보관 방침 철회, 데이터 생성은 별도 프로젝트로 분리).
> 이어서 배포 스크립트 2개도 GitHub Actions 로 옮기고 삭제 — **scripts/ 폴더 자체가 없어졌다.**

## 판정표

| 파일 | 하는 일 (1줄) | 입력 | 산출물 커밋됨? | 참조처 | 판정 |
|---|---|---|---|---|---|
| compare_excel_db_player_cards.py | 엑셀↔카드 시드 전수 대조(구단·연도·이름 열쇠) | test-docs 엑셀(비커밋, 로컬엔 존재) + 커밋된 INSERT 시드 | 해당없음(리포트만 출력) | docs/domain/_roadmap/prd/player-card-excel-db-fullscan.md | DELETE (별도 프로젝트 분리) |
| compare_excel_db_player_names.py | 엑셀↔카드 시드 이름 대조(구단·연도·포지션 열쇠) | test-docs 엑셀(비커밋, 로컬엔 존재) + 커밋된 INSERT 시드 | 해당없음(리포트만 출력) | docs/domain/_roadmap/prd/player-name-stat-sheet-crosscheck.md | DELETE (별도 프로젝트 분리) |
| convert_skill_seed.py | 구형 스킬 시드(숫자 id)→data_player_skill 계열(UUID) 변환 | 구형 시드 SQL(레포에 없음, CLI 인자로 받음) | sql/V3_insert/data_player_skill/data_player_skill_INSERT.sql | 해당 SQL 파일 헤더 주석 | DELETE (별도 프로젝트 분리) |
| crosscheck_final_sheet.py | 노말 스탯 엑셀↔운영DB 덤프 이름·포지션 대조(개발 중 1회 점검) | 세션별 임시 scratchpad 절대경로(prod2.tsv, 재사용 불가 구조) | 없음(stdout 출력만) | 없음 | DELETE |
| deploy-be.sh | 백엔드 빌드→원격 백업→jar 전송→서비스 재시작 | 없음(빌드 산출물) | 해당없음 | 운영 배포 시 수동 실행 | 이관 (.github/workflows/deploy-be.yml) |
| deploy-fe.sh | FE 빌드→S3 동기화→CloudFront 무효화 | 없음(빌드 산출물) | 해당없음 | 운영 배포 시 수동 실행 | 이관 (.github/workflows/deploy-fe.yml) |
| gen_card_stat_sql.py | 노말 카드 스탯+구종등급 적재 SQL 생성 | test-docs 엑셀 + 세션별 임시 scratchpad(prod2.tsv) | sql/V3_insert/data_player_card/data_player_card_stat_INSERT.sql | 해당 SQL 파일 헤더 주석 | DELETE (별도 프로젝트 분리) |
| gen_material_position_update.py | 재료 시드 포지션 UPDATE SQL 생성 | test-docs 엑셀 + 커밋된 legend INSERT 시드 | sql/V2_insert/updateMaterialPosition.sql | 해당 SQL 파일 헤더 주석 | DELETE (별도 프로젝트 분리) |
| gen_player_card_seed.py | data_player_card 1단계(NORMAL) 시드 생성 | test-docs 엑셀(포지션 조사 최종본) | sql/V3_insert/data_player_card/data_player_card_INSERT.sql | 해당 SQL 파일 헤더 주석 | DELETE (별도 프로젝트 분리) |
| gen_player_position_sheet.py | players.json→포지션 입력용 엑셀 시트 생성 | web/src/data/players/players.json — **커밋 a56507d 로 영구 삭제됨(서버 데이터 전환)** | 없음(엑셀만 생성, SQL 아님) | 없음 | DELETE |
| gen_sub_position_sql.py | 타자 겸업 부포지션 채우기 SQL 생성 | test-docs 엑셀 | sql/V2_insert/addSubPositionFromStatSheet.sql | 해당 SQL 파일 헤더 주석 | DELETE (별도 프로젝트 분리) |

## 실행 계획

### 배포 스크립트 — GitHub Actions 로 이관 후 삭제
- deploy-be.sh → `.github/workflows/deploy-be.yml` (AWS SSM 경유, 준비사항은 `be-deploy-setup.md`)
- deploy-fe.sh → `.github/workflows/deploy-fe.yml` (프리렌더 검증은 `web/scripts/verify-prerender.mjs` 로 단일화)

⚠️ 워크플로우 트리거가 `master` 인데 master 는 2026-04-03 상태로 405 커밋 뒤처져 있다.
**master 머지 전까지는 자동·수동 배포 모두 동작하지 않는다** — 머지 후 Actions 탭에서 한 번 실행해 확인할 것.

### DELETE (전량)
데이터 1회 적재/대조용 스크립트 9개는 전부 삭제한다. 애초 산출물이 이미 `sql/` 에 커밋되어 있어 스크립트 자체는 재실행 대상이 아니었고, 데이터 생성 작업은 별도 프로젝트로 분리하기로 확정했다 — 이 저장소에는 `.py` 를 더 두지 않는다.

- 최초 계획은 7개(compare_excel_db_player_cards.py, compare_excel_db_player_names.py, convert_skill_seed.py, gen_card_stat_sql.py, gen_material_position_update.py, gen_player_card_seed.py, gen_sub_position_sql.py)를 `scripts/oneoff/` 로 보관 이동하는 것이었으나, 방침이 철회되어 **삭제로 변경**했다.
- crosscheck_final_sheet.py, gen_player_position_sheet.py 는 처음부터 DELETE 판정(사유는 판정표 참고).
- git 히스토리에는 남아 있으므로 필요 시 이전 커밋에서 복구 가능.

### 사용자 확인 필요 (UNKNOWN)
없음 — 위 9개 전부 DELETE 로 근거를 확보함.

다만 판단에 참고할 미결 사항 1건:
- `docs/domain/_roadmap/prd/player-card-excel-db-fullscan.md` 문서 자체가 "운영에서 다시 볼 것을 반드시 돌려 확인한다"는 미완료 후속 작업을 명시하고 있다. 대조 스크립트가 삭제되어 이 재검증은 별도 프로젝트 쪽에서 다시 준비해야 한다는 점을 사용자가 인지할 것.

## 부수 정리
- `scripts/__pycache__/` — 이미 `.gitignore:61` 에 `__pycache__/` 로 포함되어 있어 저장소에는 안 잡힘. 로컬 디렉터리만 존재. 추가 조치 불필요(원하면 로컬에서 `rm -rf scripts/__pycache__` 로 정리 가능, git 추적과 무관).
- `test-docs/` 는 `.gitignore:66` 에 포함되어 있어 위 스크립트들의 입력 엑셀은 이 저장소를 새로 clone 하면 존재하지 않는다. 데이터 생성을 별도 프로젝트로 분리하는 방침과도 맞다.
- `.gitignore` 의 `### Python (kbocrol 등) ###` 블록(`__pycache__/`, `*.py[cod]`, `*$py.class`)은 유지한다 — 실수로 `.py` 산출물이 다시 들어오는 것을 막는 안전장치.
