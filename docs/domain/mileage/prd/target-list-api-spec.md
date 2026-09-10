# 마일리지 저격 선수 리스트 — API 실측

> 대상 화면: `test-docs/레전드 재료 앱 디자인/design_handoff_mileage_target_list/README.md`
> 결론: **신설 불필요. 기존 API `GET /api/mileage/sniper-targets` 그대로 재활용한다.**

---

## 1. 결론

`GET /api/mileage/sniper-targets` 가 오늘 커밋 2건으로 이미 구현·연결되어 있다.

- `58c2c60` `[feat] BE — 마일리지 저격 대상 조회 API`
- `b0daa00` `[feat] FE — 레전드 재료에 마일리지 저격 표시` (legendStats 화면이 이미 이 API 를 쓰는 중)

핸드오프가 요구하는 6필드(`id/name/team/year/pos/legend`)를 이 API 응답이 전부 제공한다.
새 컨트롤러·서비스·mapper·SQL 이 전혀 필요 없다 — FE 리스트 화면은 기존 `web/src/domains/mileage/store/**` 를 그대로 import 해서 쓰면 된다.

---

## 2. BE 구현 실측

| 항목 | 값 |
|---|---|
| 경로 | `GET /api/mileage/sniper-targets` |
| 컨트롤러 | `src/main/java/.../domain/fun/mileage/controller/MileageController.java` |
| 서비스 | `.../mileage/service/MileageServiceImpl.java` (`@Cacheable("mileageSniperTarget")`) |
| repository/mapper | `.../mileage/repository/MileageRepository.java` → `MileageMapper.java` |
| mapper XML | `src/main/resources/mapper/fun/mileage/MileageMapper.xml` (`findSniperTargets`) |
| 응답 DTO | `record MileageSniperTargetResponse(String cardId, String teamCode, Integer seasonYear, String positionCode, String playerName, String legendName)` |
| 인증 | `SecurityConfig.java:64` `.requestMatchers("/api/**").permitAll()` — 비로그인 접근 가능 |
| 캐시 | 3중 — `@Cacheable`(서버, 기동 후 1회 계산) / `WebRequest.checkNotModified` 로 약한 ETag(`W/"..."`, SHA-256 8바이트) 304 / `Cache-Control: max-age=3600, public` |

FE 연결 지점: `web/src/domains/mileage/store/public/{api,endpoints,thunks}.js`, `slices.js` (`state.mileage.sniperTargets`). `legendStats` 도메인의 `useMileageBadge.js` 가 이미 같은 store 를 구독해 재료 카드에 「마」 배지를 붙이는 중.

---

## 3. "119건" 판정 SQL — 확정 (더 이상 추정 아님)

`MileageMapper.xml`의 `findSniperTargets` 쿼리:

```sql
SELECT c.id, c.team_code, c.season_year, c.position_code, c.player_name, l.legend_name
FROM data_player_legend_material m
         JOIN data_player_card c ON c.id = m.player_card_id
         JOIN data_player_legend l ON l.id = m.legend_id
WHERE c.card_type = 'NORMAL'
  AND (SELECT COUNT(DISTINCT x.player_name)
       FROM data_player_card x
       WHERE x.team_code = c.team_code
         AND x.season_year = c.season_year
         AND x.position_code = c.position_code
         AND x.card_type = 'NORMAL') = 1
ORDER BY c.team_code, c.season_year, c.position_code
```

판정 기준: **구단×연도×포지션 조합에 전체 NORMAL 카드 중 선수가 단 1명뿐인 카드** 중, 레전드 재료(`data_player_legend_material.player_card_id`)로도 쓰이는 카드. `legend_type` 필터는 없다 — NORMAL/NEW/LIVING/NATIONAL 74명 전체 대상. "L마크"는 legend_type 값이 아니라 이 "확정 저격 가능" 카드 자체를 가리키는 화면 용어로 보인다.

- 원본 코멘트(`sql/migration/ADD_MATERIAL_CARD_ID.sql` 65~83행)에 동일 쿼리와 "119건" 수치가 이미 남아 있었다 — 실제 구현이 이 주석 그대로 코드화됐다.
- `MileageSniperTargetEntity` 주석: "legendName 은 이 카드가 재료로 쓰이는 레전드 이름이다(1카드-1레전드, 0건 중복 실측 확인)" — 카드 1장이 여러 레전드의 재료로 겹치는 경우가 없어 `INNER JOIN`으로도 항상 1행만 나온다.

---

## 4. 필드 충족 표

| 요구 필드 | 응답 필드 | 충족 | 비고 |
|---|---|---|---|
| `id` | `cardId` | O | `data_player_card.id` (UUID). 프로토타입 JSON의 `"p04213"` 형식과 다르지만 FE 대조 키로는 문제없음(§6) |
| `name` | `playerName` | O | 동명이인 접미사(B/S/C) 포함 그대로 |
| `team` | `teamCode` | △ | **구단 코드**(`SAM`)로 온다. 한글명(`삼성`) 변환은 FE 몫 — `web/src/domains/mileage/config/mileage.js`의 `TEAMS_RAW`(code↔name)로 이미 존재, 신규 매핑 불필요 |
| `year` | `seasonYear` | O | `Integer` |
| `pos` | `positionCode` | O | 444/444 전량 채워짐 확인(`sql/updateData/updateMaterialPosition.sql`) → 119건도 전량 NULL 없음 |
| `legend` | `legendName` | O | `INNER JOIN`이라 **항상 값 있음**, null 불가능 (핸드오프의 "레전드 미정" 카운터는 실제로 항상 0건이 됨) |

---

## 5. 부족분

없음. 6필드 전부 기존 응답으로 충족.

---

## 6. FE 연결 시 주의점

1. **팀 코드 → 한글 변환**: `MileageTarget.team`은 `teamCode` 그대로 온다. 화면은 `mileage.js`의 `TEAMS_RAW.find(t => t.code === teamCode)?.name`으로 변환(신규 상수 추가 불필요, DB `fun_teams` 테이블 없음 — `mileage.js` 주석대로 이 상수가 유일한 원본).
2. **`legend` null 처리 로직은 사실상 죽은 코드**: 핸드오프의 "레전드 미정 {null 건수}" 카운터·`legend ?? '—'` 표시는 그대로 둬도 무해하지만 실데이터로는 항상 0건.
3. **`id` 포맷 차이**: 프로토타입 JSON의 `p04213`은 폐기된 레거시 `players.json`(현재 `web/src/data/players/` 자체가 삭제됨) 스킴이다. 실 구현은 `cardId`(UUID)를 그대로 키로 쓰면 되고, 프로토타입 JSON은 필드 이름 매핑 참고용일 뿐 값 자체는 무시한다.
4. **정렬·검색·필터**는 응답 배열만으로 클라이언트에서 전부 처리 가능 — 추가 API 불필요 (README §"필터·검색·정렬" 전부 클라이언트 사이드로 명시돼 있고 6필드로 충분).
5. **새로 만들 것은 리스트 탭 화면(FE)뿐**이다 — 탭 바, 검색/필터/정렬 UI, 표, 도움말 모달, 시뮬레이션 탭과의 쿼리스트링 연동. store/API는 기존 `mileage` 도메인 것을 import.
