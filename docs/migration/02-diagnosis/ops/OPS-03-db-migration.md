# OPS-03 DB 마이그레이션 도구 부재 · 테이블 세대 중복

> 상태: 열림
> 심각도: 🟡 정리
> 닫히는 단계: 1단계(공지 슬러그 컬럼부터 기록) — [`phase-1`](../../03-roadmap/phase-1-blockers.md)
> 관련: BE-06, `docs/global-guide/develop/specs/db/sql-folder-map.md`

## 현상
스키마 변경은 사람이 SQL 파일을 순서대로 실행해 반영한다. **어떤 파일이 운영 DB 에 적용됐는지 기록하는 곳이 없다.** 같은 개념의 테이블이 세대별로 남아 있다.

## 근거
| 항목 | 위치 | 내용 |
|---|---|---|
| 도구 | `build.gradle` | Flyway · Liquibase 없음 |
| 적용 규칙 | `sql/README.md` | 접두사로 구분: `CREATE_` · `INSERT_` 는 순서대로 안전, `UPDATE_` · `ALTER_` · `DROP_` · `MIGRATE_` 는 수동 |
| 새 DB 구성 | `sql/V3/README.md` | V2 `CREATE_03` · `CREATE_04` + V3 `CREATE_01~08` (V3 가 V2 의 `site_users` · `fun_teams` 에 의존) |
| 중복 정의 | `sql/V2/CREATE_04_TABLE_SITE.sql:103`, `sql/V2/MIGRATE_user_restructure.sql:157` | `site_user_oauth_accounts` 를 두 번 생성 |
| 세대 중복 | 운영 DB | 선수 카드 `player_card*` → `fun_player_card*` → `data_player_card*`(매퍼는 마지막만 사용), 팀 `teams` → `fun_teams`, 레전드 `player_legend*` → `data_player_legend*` |
| 커뮤니티 | `sql/community_README.md` | 실제 글 237건은 v1 `posts` 에만 있고 v2 `site_post` 는 0건. 이관 스크립트는 미실행 |
| 과거 사례 | 커밋 `90fe13a` 본문 | "운영 DB 에 email 컬럼 적용 여부 확인 후 배포할 것" — 순서를 사람이 기억해야 했다 |

## 영향
- 1단계의 공지 `slug` 컬럼처럼 **BE 코드와 스키마가 같이 바뀌는 변경**에서 배포 순서를 틀리면 운영 장애가 난다.
- 로컬 · 운영 스키마가 다른지 확인할 방법이 없다.

## 해결 방향
| 선택 | 판단 |
|---|---|
| **Flyway 도입 + 운영 DB baseline** | 권장. 현재 운영 스키마를 `V1__baseline` 으로 표시(`baselineOnMigrate`)하고, 공지 slug 가 첫 관리 대상 `V2__notice_slug.sql`. 기동 시 자동 적용은 끄고(`spring.flyway.enabled=false`) CI 에서 `flyway info` 로 차이만 보고 → 적용은 여전히 사람이 하되 **기록이 남는다** |
| 수동 유지 + 적용 기록표 | 최소안. `sql/APPLIED.md` 에 파일 · 적용일 · 적용자 기록 |

세대 중복 테이블 삭제는 이관과 섞지 않는다(ops 트랙, `sql-folder-map.md` §7 의 사용자 결정 대기 목록).

## 완료 기준
- [ ] 공지 slug 컬럼 변경이 도구(또는 기록표)에 적용일과 함께 남는다
- [ ] 새 DB 를 문서 순서대로 구성했을 때 BE 기동 · 매퍼 테스트 통과
