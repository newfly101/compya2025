# 마일리지 저격 선수 리스트 — store 공용화 설계

> 대상 화면: `test-docs/레전드 재료 앱 디자인/design_handoff_mileage_target_list/README.md`
> 결론 먼저: **새 API 불필요.** 필요한 데이터(재료 카드 119건)를 담는 store 가 **오늘 이미 만들어졌다** (`mileage/store/public/*`, 커밋 `b0daa00`). 새 화면은 이 store 를 selector 로 읽기만 하면 된다.

---

## 1. 기존 store 지도

| 도메인 | slice | 보유 데이터 | 부르는 API | loaded 플래그 |
|---|---|---|---|---|
| `mileage` | `sniperTargets` | 재료 카드 119건: `cardId, teamCode, seasonYear, positionCode, playerName, legendName` | `GET /mileage/sniper-targets` (`requestGetSniperTargets`) | O (`items/loaded/loading/error`) |
| `legendStat` | `stats` | 레전드 74건 원본(`stats[]`) | `GET /legend-stats` | O |
| `legendStat` | `teams` | teamCode → 구단 한글 표시명 | `GET /teams` | O |
| `legendStat` | `pitchTypes` | pitchCode → 구종 표시명 | `GET /legend-stats/pitch-types` | O |
| `legendStat` | `materials` | 레전드 1건당 재료 상세(`byId[legendId] = detail`), **행을 펼친 레전드만** | `GET /legends/{id}` (`requestGetLegendMaterials`) | X (byId 존재 여부로 판별, `condition` 가드) |
| `players` | `players`(단일) | **선수 카드 11,668건 전량**, 카드마다 `L`(재료 플래그)·`LN`(저격 레전드명) 포함 | `GET /player-cards` | O, thunk `condition` 가드 |
| `historyLegend` | `rounds` | 히스토리 라운드·로스터 (레전드 메타는 `legendStat`을 재사용 — 이미 공용화된 선례) | `GET /history-legend/rounds`(추정) | O |
| `mileage`(계산) | 없음 | 저격 경로 계산은 `mileage/config/mileage.js` 순수 함수만 — **store 미사용** 확인됨 | - | - |

- `mileage.sniperTargets` 는 **오늘 이미 커밋된 기능**(`b0daa00 [feat] FE — 레전드 재료에 마일리지 저격 표시`)이다. 현재는 `legendStats/mobile/hooks/useMileageBadge.js` 딱 한 곳만 소비한다(레전드 평점표에 "마" 배지 표시용, `Map<cardId, {legendName, teamCode, seasonYear}>`로 가공).
- `players.players` 도 겹치는 후보다 — 11,668건 전량에 `L`(재료 여부)·`LN`(레전드명) 필드가 이미 있다. 다만 payload 가 훨씬 크고(전량), `players` 백과사전 화면을 아직 안 본 사용자는 이 무거운 fetch 를 새로 유발한다.

## 2. 데이터 중복 판정

필요 필드: `id, name, team, year, pos, legend` (재료 카드 119종)

| 필드 | `mileage.sniperTargets` | `players.players` (L===1 필터) | `legendStat.materials` |
|---|---|---|---|
| id | `cardId` (그대로 사용 가능) | 없음 (FE 합성 키 `tm-y-pos-n`) | `m.playerCardId` (레전드별로 흩어져 재조립 필요) |
| name | `playerName` | `n` | `m.playerName` |
| team | `teamCode`(코드, 표시명 변환 필요) | `tm`(이미 표시명 변환됨) | `m.teamCode`(변환 필요) |
| year | `seasonYear` | `y`(문자열) | `m.seasonYear` |
| pos | `positionCode` | `pos` | 없음(재료 응답에 포지션 없음) |
| legend | `legendName` | `LN` | 소속 legendId 로 역산 가능(비효율) |

**판정: `mileage.sniperTargets` 가 6개 필드 전부를 1:1로 이미 보유.** 74회 API 호출(`legendStat.materials`, 레전드별)로 조립하는 것보다 압도적으로 우월하고, `players.players`(11,668건 전량)보다 payload 가 가볍고 목적 적합도가 높다. **완전 중복 — 새 API·새 store 불필요.**

## 3. 공용화 방식 비교

| 방식 | 변경 범위 | 다른 세션 충돌 위험 | 신선도(stale) | 난이도 |
|---|---|---|---|---|
| **(A) 선택자 공유** — 새 화면이 `state.mileage.sniperTargets` 를 selector 로 읽고, `useMileageBadge`처럼 `!loaded`일 때만 자체 dispatch | 새 훅 1개 추가(`mileage` 도메인 내부, 신규 파일) + `thunks.js` 1줄(§5) | 없음 — `mileage/**`는 다른 세션 작업 영역 아님 | `sniperTargets`는 "거의 안 바뀌는 데이터"(주석) + ETag 304 — 문제 없음 | 낮음 |
| (B) 공용 slice 신설(`entities/players`) | `mileage`·`legendStat`·`players` 3개 도메인 리듀서 이관 필요 — 대규모 리팩터 | 높음 — `legendStat.materials`는 현재 미상관 세션이 만든 최신 기능, 구조 변경 시 충돌 가능 | 동일 | 높음, 과설계 (필요 데이터가 이미 단일 slice에 다 있어 이관 실익 없음) |
| (C) thunk `condition` 가드만 추가 | `thunks.js` 1줄 | 없음 | 동일 | 낮음 — (A)의 보완책이지 대체안 아님 |
| (D) RTK Query 도입 | 전역 미들웨어·기존 30여개 도메인 store 패턴 전면 교체 | 매우 높음 | RTK Query 자체 캐시라 유리하나 무관 | 매우 높음, 이번 요구엔 과함 |

## 4. 권고안과 근거

**권고: (A) 선택자 공유 + (C) thunk `condition` 보강을 함께 적용.**
1. 필요한 데이터가 `mileage.sniperTargets` 에 이미 100% 존재하므로 새 slice/새 API 자체가 불필요하다.
2. `createAsyncThunk`의 `condition` 옵션은 이 프로젝트에 **이미 쓰이고 있다** (`legendStat/materials`, `players`) — 표준 관행을 그대로 따르는 것이 최소 변경이다.
3. 기존 도메인(`legendStat`, `players`) 코드는 전혀 건드리지 않는다 — 변경은 `mileage` 도메인 내부(자기 자신)로 완결된다.

## 5. 적용 설계

### 신규 파일
- `web/src/domains/mileage/mobile/hooks/useSniperTargetList.js` (신규)
  - `useSelector((s) => s.mileage.sniperTargets)` 로 `items/loaded/loading/error` 를 그대로 읽는다.
  - `useEffect(() => { if (!loaded) dispatch(requestGetSniperTargets()); }, [loaded])` — `useMileageBadge.js`와 **완전히 동일한 가드 패턴**(중복 코드지만, 두 훅의 반환 형태가 달라 —Map vs 화면모델 배열— 분리 유지 권장. 원한다면 훗날 `useMileageSniperTargets(selectorFn)` 공용 훅으로 합칠 수 있음, 이번 범위는 아님).
  - `items` → 화면 모델 매핑(순수 함수는 `mileage/config/mileage.js` 또는 신규 `mileage/config/sniperTargetList.js`에 둘 것):
    - `id: cardId`, `name: playerName`, `team: TEAM_NAME_BY_CODE[teamCode] ?? teamCode`, `year: seasonYear`, `pos: positionCode`, `legend: legendName ?? null`
  - `TEAM_NAME_BY_CODE`: `mileage/config/mileage.js`의 `TEAMS_RAW`에서 파생(= `players/store/adapter.js`가 이미 하는 것과 동일한 방식). **새 상수 export 를 mileage.js에 추가하거나, 이 훅/설정 파일 로컬에서 `Object.fromEntries(TEAMS_RAW.map(...))`로 즉석 구성** — 어느 쪽이든 기존 `TEAMS_RAW` 배열 자체는 손대지 않는다.

### 기존 파일 수정 — 1개 파일, 1줄
- `web/src/domains/mileage/store/public/thunks.js` (현재 16줄) — `createAsyncThunk` 세 번째 인자로 `condition` 추가:
  ```
  { condition: (_, { getState }) => !getState().mileage.sniperTargets.loaded }
  ```
  (players 의 `!loaded && !loading` 패턴까지 가면 더 안전하나, 기존 `legendStat/materials`는 `!loaded`만 검사하는 단순형이라 이 프로젝트엔 두 관행이 공존한다. 어느 쪽이든 무방.)
  - 이 변경만으로 `useMileageBadge`와 신규 `useSniperTargetList`가 같은 틱에 동시 마운트돼도 요청이 1번만 나간다(현재는 훅의 `if (!loaded)`만 있어 이론상 레이스 가능 — 실제 화면 전환 방식상 발생 가능성은 낮지만 무료로 안전해진다).
  - **주의**: `mileage` 도메인은 이번 작업 제외 영역(`web/src/app/router/**`, `playerSkills/**`, `java/**`, `sql/**`, `scripts/**`)에 안 걸린다. 다른 세션과 충돌 없음.

### 건드리지 않는 것
- `web/src/domains/legendStat/**`, `web/src/domains/players/**` — 전혀 수정 없음.
- `web/src/app/store/utils/applyAsyncHandlers.js` — 이번 설계는 이 유틸을 그대로 쓴다(신규 slice가 없으므로 관여 자체가 없음). 최근 에러 처리 수정 내용(§ rejected 케이스에서 `action.payload`를 문자열/객체 양쪽 다 처리)은 이미 `sniperTargets` slice 에도 자동 적용돼 있어 별도 대응 불필요.

## 6. 기존 캐싱 관행 — 따른다

두 관행이 이미 공존:
1. **훅 레벨 effect 가드** — `useLegendStats`(stats/teams/pitchTypes), `useMileageBadge`(sniperTargets), `useHistoryLegend`(rounds): `if (!loaded) dispatch(...)`.
2. **thunk 레벨 `condition`** — `legendStat/materials`(레전드별 캐시), `players`(11,668건 무거운 fetch, `!loaded && !loading`).

신규 화면은 (1)을 훅에, (2)를 thunk에 **둘 다** 적용해 기존 두 관행을 그대로 계승한다. 새 패턴을 발명하지 않는다.

## 7. 구현 dispatch brief (그대로 사용 가능)

```
목적: 「마일리지 저격 선수 리스트」 탭이 쓸 데이터 훅 추가
산출물:
  - web/src/domains/mileage/mobile/hooks/useSniperTargetList.js (신규)
  - web/src/domains/mileage/config/mileage.js 또는 신규 config 파일에 화면 모델 매핑 함수(순수 함수)
Edit 가능: web/src/domains/mileage/** 전체
Edit 금지: web/src/domains/legendStat/**, web/src/domains/players/**, web/src/domains/playerSkills/**,
           web/src/app/router/**, src/main/java/**, sql/**
작업:
  1. thunks.js 의 requestGetSniperTargets 에 condition 추가(§5)
  2. useSniperTargetList 훅: state.mileage.sniperTargets 를 selector, !loaded 면 dispatch,
     items 를 { id, name, team, year, pos, legend } 화면 모델 배열로 매핑해 반환
     (team 매핑은 TEAMS_RAW 기반 code→한글명, players/store/adapter.js 의 TEAM_NAME_BY_CODE 구성 방식 참고
      — import 재사용은 순환 의존 되므로 mileage 도메인 로컬에 동일 로직 재구성)
  3. README(design_handoff_mileage_target_list) §"필터·검색·정렬"의 클라이언트 사이드 로직은
     화면 훅 또는 config 순수 함수에 구현 (본 설계 범위 밖 — 화면 구현 단계에서 처리)
검증: sniperTargets 가 legendStat 화면 방문 여부와 무관하게 정확히 1회만 fetch 되는지
      (Network 탭에서 /mileage/sniper-targets 호출 횟수 확인)
```

## 8. 위험 / 사용자 결정 필요

- `positionCode` 값 표기(`SP/RP/CP/C/1B/...`)가 README 의 `Pos` 유니온과 철자까지 정확히 일치하는지 DB 실측 확인 필요(코드 조사 범위에서는 BE record 타입만 확인, 실제 값 검증은 안 함).
- `legendName`이 null 인 케이스(레전드 미정 카드)가 실제 DB에 존재하는지— README의 "레전드 미정 {count}" 카운터 로직이 정상 동작하려면 필요. BE `MileageSniperTargetResponse.legendName`은 nullable 로 보이나 실측 안 함.
- `useMileageBadge`와 신규 훅이 완전히 같은 selector 를 두 번 구현하는 셈이라 **중복 코드**는 남는다 — 이번 범위에서 통합 리팩터는 안 했다(과설계 방지). 필요시 후속 작업으로 `useMileageBadge`를 `useSniperTargetList` 위에 얹는 리팩터 고려 가능.
