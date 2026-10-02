---
feature: legendStats
version: 1.1.0
status: active
created: 2026-09-02
updated: 2026-10-03
---

# legendStats

## 1. 무엇을 하는 기능인가

레전드 카드 74명의 태생 스탯·커뮤니티 평점을 한 표로 보여주고, 행을 펼치면 그 레전드를 만드는 데 필요한 재료(선수 6장 + 코치 2세트)를 보여주는 조회 전용 평점표다.

## 2. 화면과 진입 경로

| 화면 | 주소 | 어디서 들어오나 |
|---|---|---|
| 재료 검색 (SC-15-01, 옛 이름 "레전드 재료 평점표") | `/legend-stats` | 같은 화면군의 공용 탭(REQ-LS-09), 홈 퀵메뉴 "레전드 재료", 서랍 "레전드 재료 › 재료 검색", `/about` 소개 화면, `/guides` 안내 링크 |

## 3. 규칙

| ID | 항목 | 규칙 | 근거 |
|---|---|---|---|
| REQ-LS-01 | 조회 | 비로그인 사용자가 레전드 74명의 태생 스탯·커뮤니티 평점을 표로 볼 수 있다. 진입 즉시 스탯·구종마스터·팀 한글명 3개 요청을 독립적으로 보낸다 — 하나가 실패해도 나머지로 코드값 그대로 화면이 살아 있다 | `GET /api/legend-stats`, `useLegendStats.js:13-38` |
| REQ-LS-02 | 재료 조회 | 행을 펼치면 그 순간 처음으로 재료 8건(선수 6 + 코치 2)을 단건 조회로 받는다. 재요청은 thunk가 막는다 | `GET /api/legends/{id}`, `useLegendStats.js:45-50` |
| REQ-LS-03 | 필터·정렬 | **검색을 품은 공용 필터 바**(검색창이 필터 영역 안에 있고 칩 묶음은 항상 펼침 — 접기 기능 없음, `legendCollections` REQ-LCOL-25)에서 검색(이름)·구단 칩·타입(전체/타자/투수) 칩·포지션 칩(타입이 "전체"면 칩 자체가 없음)으로 필터링하고, 컬럼 헤더 클릭으로 재정렬한다. 평점 미정은 정렬 방향과 무관하게 항상 맨 아래(tie-break: OVR 내림차순) | `LegendStatsScreen.jsx`, `config/legendStats.js` |
| REQ-LS-04 | 저격 배지 링크 | 재료 카드에 "히"(historyLegend에서 저격 가능)/"마"(mileage에서 저격 가능) 배지가 있으면 각 도메인으로 이동하는 링크가 붙는다 | `LegendStatsScreen.jsx:220-243` |
| REQ-LS-05 | 미사용 API 정리 (미구현) | `GET /api/legends`(목록), `GET /api/legends/{id}/materials`(재료 단독) 2개는 v1 화면 잔존 코드로 삭제가 확정됐으나 아직 코드에 남아 있다. `GET /api/legends/{id}`(단건, 재료 조회에 실사용 중)는 남긴다 — 컨트롤러 통째 삭제는 하지 않는다 | `FunPlayerLegendController.java`, 확정 2026-09-27 |
| REQ-LS-06 | OVR 계산 | OVR(태생 5스탯 평균)은 응답에 없다 — DB STORED 컬럼과 FE 계산식이 같아 값은 일치한다 | `config/legendStats.js:45-48` |
| REQ-LS-08 | 이름 | 상단바 제목은 세 레전드 재료 화면 모두 **"레전드 재료"** 이고(`routeMeta` title 동일), 이 화면의 이름은 탭 라벨 **"재료 검색"** 이다(서랍 "레전드 재료 › 재료 검색"). **본문 부제는 두지 않는다.** 주소·SEO 문구·가이드 제목의 "평점표" 는 유지한다 | `useDomainTopBar`, `LegendTabs.jsx`, `0010` |
| REQ-LS-09 | 공용 탭·가이드 | 상단바 바로 아래에 레전드 재료 화면 공통 탭 바 [재료 검색 \| 내 보유 현황 \| 스킬 기록](**탭 3개**)을 둔다. 각 탭은 고유 주소(`/legend-stats` · `/legend-collections` · `/legend-collection-skills`)이고 지금 화면 탭이 켜진다(`/legend-collections/manage`·`/legend-collection-skills/:id/edit` 에서도 해당 탭이 켜진다). 탭 바로 아래에 "이 페이지 활용 가이드" 아코디언을 같은 위치에 둔다(공용 `GuideAccordion`, 본문은 항상 DOM 에 있음). 비로그인도 이 화면을 그대로 보며, 다른 두 탭을 눌러도 이동은 되고 조작 시점에 로그인 안내 모달(`authentication` REQ-AUTH-13)이 뜬다 | `LegendTabs.jsx`, `0010` |
| REQ-LS-10 | 표 위 요약 줄 | 표 바로 위 한 줄에 **왼쪽은 집계("N명 · 평점 미정 n"), 오른쪽은 현재 정렬 기준 텍스트**(예 "OVR 높은순")를 양끝 정렬로 둔다. `legendCollections` REQ-LCOL-33 과 같은 패턴 | `LegendStatsScreen.jsx` `.meta` |

## 4. 데이터

| 무엇 | 테이블 · API | 비고 |
|---|---|---|
| 레전드 마스터 | `data_player_legend` · `GET /api/legend-stats` | 74명. UNIQUE(legend_name). 포지션(`position_code`) NULL 0건, 그중 7명은 복합 포지션(슬래시 결합, 예 "RF/1B") — 결함 아님, DB 실측 확인(2026-09-27) |
| 태생 스탯·평점 | `data_player_legend_stat` | 74행(1:1). `rating`은 커뮤니티 출처값(산출식 불명), NULL 6명(DB 실측 확인) |
| 재료 8행 | `data_player_legend_material` · `GET /api/legends/{id}` | 레전드당 선수 6 + 코치 2 = 8행, 74명×8 = 592행 전량 적재 확인(DB 실측). 재료 유일성은 일반 인덱스일 뿐 UNIQUE 아님 |
| 구종 마스터 | `data_pitch_type` · `GET /api/legend-stats/pitch-types` | `players`와 공유하는 10종 마스터 |
| 원천 우선순위 | 평점표 엑셀(작성자 사본) vs DB 마스터 | **둘이 다르면 DB 가 최신.** 엑셀이 원천인 값은 태생 5스탯·커뮤니티 평점·구종 등급뿐이고, `legend_type`·`team_code`·`position_code`·재료·코치는 DB 마스터가 원천. `legend_type` 17명 불일치(엑셀 "신규" ↔ DB "일반")는 엑셀이 옛 분류라 결함 아님(2026-09-02) |
| 캐시 | `@Cacheable(value="legendStat"/"legendPitchType")` + ETag + `Cache-Control: max-age=1h` | 단건 조회(`/legends/{id}`)는 캐시 없음. TTL 0, 무효화는 admin 캐시 동기화 버튼(수동)뿐 — 서비스 클래스 주석은 이 경로를 반영해 정정됐다(2026-09-28) |

## 5. 하지 않는 것

- 등록·수정·삭제 API가 없다 — 값이 바뀌는 유일한 방법은 직접 SQL(시드 재실행 또는 운영자 직접 수정)이다.
- 타입이 "전체"면 포지션 칩을 보여주지 않는다 — 타자·투수 포지션 체계가 달라 섞으면 의미가 없다는 판단이다.
- 재료가 정상적으로 0건인 상태와 요청 실패를 더는 같은 문구로 뭉개지 않는다(2026-09-28 수정) — 로딩중/재료없음/불러오기실패 3단계로 구분한다.

## 6. 확인 필요

확정(2026-09-30) — `GET /api/legends`, `GET /api/legends/{id}/materials` 제거를 확정한다 — 미구현, 릴리스 뒤 별도 작업.

🟨 가정 — 레전드의 복합 포지션(슬래시 결합) 7건은 필터·집계 로직이 `includes()` 포함 검색으로 정상 처리한다고 확인됐으나, 화면 표시 문구(슬래시 그대로 노출)가 최종 사양인지는 별도 확인이 필요하다.
