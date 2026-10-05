---
version: 1.0.2
version: 1.0.2
status: active
created: 2026-09-09
updated: 2026-10-02
---

# playerSkills

## 1. 무엇을 하는 기능인가

타자·투수 각 46개(총 92개) 선수 스킬을 등급(노말·히어로·플래티넘·레전드)과 강화 티어(E~S+)별 효과 수치와 함께 보여주는 조회 전용 백과사전이다. 등록·수정·삭제 기능은 없다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 스킬 백과사전 (SC-17-01) | `/skills` (상수 `ROUTE_PATHS.player_skills`) | 홈 퀵메뉴 "스킬 백과사전", 하단 드로어 메뉴, `/guides` 안내 링크 |

주소 문자열은 향후 바뀔 수 있어 화면 코드는 항상 `ROUTE_PATHS` 상수로만 참조한다.

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-PSK-01 | 조회 | 비로그인 사용자가 타자·투수 스킬 92건을 등급·강화티어별 수치와 함께 조회할 수 있다. 진입 시 기본 탭(타자)만 요청하고, 투수 탭으로 바꾸면 그때 처음 요청한다 | `GET /api/player-skills/{hitters\|pitchers}`, `usePlayerSkills.js:19-29` |
| REQ-PSK-02 | 필터·강화 티어 선택 | 검색(이름)·등급 칩(전체/노말/히어로/플래티넘/레전드)·타자/투수 세그먼트로 필터링하고, 강화 티어 칩(E~S+)으로 "지금 보여줄 수치 등급"을 고른다. 목록에 그 등급 값이 하나도 없으면 값 있는 최고 등급으로 자동 하향(자동 상향은 없음) | `PlayerSkillScreen.jsx:41-47` |
| REQ-PSK-03 | 목록 정렬 | 티어 내림차순(레전드→플래티넘→히어로→노말)→원본 순번(sort_order) 내림차순. 정렬 주인은 FE — BE 매퍼는 참고용 순서만 내려준다 | `skillsUtils.js:20-31`, `filterAndSortSkills()` |
| REQ-PSK-04 | 라벨(표 행 이름) | `labels`는 DB에 없다. FE가 `descriptionTemplate`에서 조사를 걷어내는 규칙으로 1차 계산하고, 92개 중 72개는 사람이 정한 값으로 하드코딩해 덮어쓴다 | `store/adapter.js:6-9,68-150` |
| REQ-PSK-05 | 원 문자 그룹 표기 | 표시 정규식은 ①②③ 3개까지만 인식한다(현재 시드 데이터 최대 그룹 크기가 3이라 증상 없음). 값 그룹 4개 이상 스킬을 추가할 계획이 없어(확정 2026-09-30) 정규식 확장은 하지 않는다 | `skillsUtils.js:81`, `adapter.js:16` |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 스킬 마스터 | `data_player_skill` · `GET /api/player-skills/{hitters\|pitchers}` | 92행 = 타자 46 + 투수 46. UNIQUE(role,skill_name), UNIQUE(role,sort_order) |
| 티어별 수치 | `data_player_skill_tier` | 540행. 등급별 최고 티어(노말·히어로→A, 플래티넘·레전드→S+)는 CHECK 제약으로 강제 |
| 설명문 치환 수치 | `data_player_skill_tier_value` | 877행. 스킬×티어당 `value_count`개 |
| 캐시 | `@Cacheable(value="playerSkill", key="hitter"\|"pitcher")` + ETag + `Cache-Control: max-age=1h` | TTL 0. 무효화는 admin 캐시 동기화 버튼(수동)뿐 — 서비스 클래스 주석은 이 경로를 반영해 정정됐다(2026-09-28) |

DDL ↔ DB 실측(2026-09-27) 결과 불일치 0건 — `data_player_skill` 92행, `data_player_skill_tier` 540행 모두 DDL 기대치와 정확히 일치한다.

## 5. 하지 않는 것

- 등록·수정·삭제 API가 없다 — 값이 바뀌는 유일한 방법은 직접 SQL(시드 재실행 또는 운영자 직접 수정)이다.
- 응답의 `estimated`·`rawValue`(`PlayerSkillTierResponse`), `id`·`maxTier`·`valueCount`(`PlayerSkillResponse`)는 화면이 참조하지 않는다 — "추정값" 표시 UI가 없다.
- 상세 API를 따로 두지 않는다 — 목록 전체가 가벼워(gzip 2.7KB) 나눌 이득이 없다는 확정 사양이다.

## 6. 확인 필요

❓ 미정 — `estimated`/`rawValue`를 FE가 쓰지 않는 것이 기획 의도(추정값 UI 아직 없음)인지, 구현 누락인지 확정되지 않았다. 제거·구현 계획 모두 없이 유지 중이다.

확정(2026-09-30) — 값 그룹 4개 이상인 스킬을 추가할 계획은 없다. REQ-PSK-05의 정규식 확장은 불필요하다.

❓ 미정 — DDL에 남은 검증 쿼리 4종(설명문 자리표시자 개수 등)을 시드 적재 후 실제로 실행해 92건 전부 통과했는지는 확인되지 않았다.
