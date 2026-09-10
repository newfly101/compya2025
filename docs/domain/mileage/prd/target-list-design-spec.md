# 마일리지 저격 선수 리스트 — 구현 명세

> 대상: `test-docs/레전드 재료 앱 디자인/design_handoff_mileage_target_list/README.md` (탭 추가)
> 조사 범위: 핸드오프 3종(README/.dc.html/support.js) + 기존 구현(`domains/mileage/**`) + 전역/도메인 토큰 + `docs/domain/mileage/prd/*` 기존 문서 3종
> 코드 미수정 — 본 문서 1개만 산출

## 0. 가장 중요한 선행 사실 — API·store가 이미 있다

`docs/domain/mileage/prd/store-sharing-design.md`·`target-list-api-spec.md`(둘 다 오늘, 다른 세션 작성 — 미커밋 상태)와 실코드 확인 결과, 핸드오프가 요구하는 데이터는 **이미 구현·배포된 API로 100% 커버된다.** 새 백엔드 작업이 필요 없다. (`target-list-api-spec.md`가 BE 쪽을 더 깊이 실측했으므로 그쪽이 상위 근거 — 본 문서는 FE 설계에 필요한 결론만 요약)

| 핸드오프 요구 | 실제로 이미 있는 것 |
|---|---|
| `GET /api/mileage-targets` (예시 명세) | `GET /api/mileage/sniper-targets` — `MileageController` (커밋 `b0daa00`) |
| `MileageTarget[]` | `MileageSniperTargetResponse[]` — `{cardId, teamCode, seasonYear, positionCode, playerName, legendName}` |
| Redux store | `domains/mileage/store/{public/*, slices.js}` — `state.mileage.sniperTargets = {items, loaded, loading, error}` |
| 기존 소비처 | `legendStats/mobile/hooks/useMileageBadge.js` — 같은 store를 셀렉터로 읽음(레전드 표 "마" 배지) |

필드명 매핑만 하면 된다: `cardId→id`, `teamCode→team(표시명 변환)`, `seasonYear→year`, `positionCode→pos`, `playerName→name`, `legendName→legend`.

- `cardId`는 `data_player_card.id`(UUID) — 프로토타입 JSON의 `"p04213"` 형식과 다르지만 대조 키로는 문제없다(프로토타입 값은 무시, 필드 이름 매핑만 참고).
- `positionCode`는 444건 전량 채워짐 실측 확인됨(`sql/updateData/updateMaterialPosition.sql`) — 119건 전부 포지션 결측 없음.

⚠️ **데이터 정합 확인 필요(사용자 결정)** — `MileageMapper.xml`의 `findSniperTargets` 쿼리는 `data_player_legend_material m JOIN data_player_legend l ON l.id = m.legend_id`로 **INNER JOIN**한다. 즉 이 엔드포인트가 반환하는 119건은 전부 이미 레전드가 확정된 재료만 포함 — `legendName`이 **항상 non-null**이다(카드 1장-1레전드, 0건 중복 실측 확인됨 — `MileageSniperTargetEntity` 주석). 핸드오프의 "레전드 미정 {count}" 카운터(§1-3)는 이 데이터로는 **항상 0**이 된다. 실제로 "레전드가 아직 안 정해진 재료 카드"까지 보여줘야 한다면 BE 쿼리를 LEFT JOIN 기반으로 바꿔야 하는데, 이는 이번 범위(FE 설계) 밖이라 HITL 표시만 하고 넘어간다.

---

## 1. 화면 구조

`/mileage` 라우트 그대로 유지, **새 라우트 추가 없음** — 쿼리스트링 `?tab=list|calc`로 두 탭을 나눈다.

```
MobileLayout (전역 TopBar "마일리지 저격 경로" — 그대로)
└─ MileageScreen.jsx
   ├─ 탭 바 (신규) — 「저격 시뮬레이션」 / 「저격 선수 리스트 N」
   ├─ tab==='list' → 새 리스트 화면 (검색행 → 포지션칩 → 카운터행 → 표 → 도움말 모달)
   └─ tab==='calc' → 기존 구현 그대로 (view:'main'|'table' 내부 분기 불변)
       └─ 최상단에 "리스트에서 선택" 배너(신규, id 쿼리 있을 때만)
```

- 탭 바·리스트 탭 본문·배너 = 신규. 시뮬레이션 탭 본체(설정/히어로/구단×연도 표) = 불변.
- 탭 바는 `MileageScreen.jsx` 최상단에 항상 렌더(구단×연도 표를 보고 있는 중에도 탭 바 자체는 유지할지, 표 화면(`view==='table'`)에서는 숨길지는 판단 필요 — 표 화면은 전체화면형 서브뷰라 **탭 바를 숨기는 쪽을 권장**. 표 화면에 X 버튼이 이미 있어 "탭 전환 중 표를 반쯤 가리는" 혼란을 피함).

### 1.1 쿼리스트링 네임스페이스 충돌 주의 (판단 필요 지점)

기존 `useMileage.js`의 `openTable()`/`closeTable()`은 `setSearchParams({team, year})` 형태로 **쿼리 전체를 치환**한다(병합이 아님). 핸드오프의 새 파라미터(`tab`, `id`, `pos`)와 기존 `team`/`year`가 동시에 필요한 상황(리스트에서 선택 후 구단×연도 표를 열어보는 경우)이 되면 기존 호출이 `tab`/`id`/`pos`를 날려버린다.

값 자체는 충돌하지 않는다 — 기존 `team`은 코드값(`SAM`,`DOO`...), 새 `team`은 표시명(`삼성`,`두산`...)이라 `parseGoalFromParams`가 새 값으로 오작동하진 않는다. 하지만 **여러 setSearchParams 호출이 서로를 지우는 문제는 남는다.**

**권고**: `useMileage.js`의 `openTable`/`closeTable`을 함수형 업데이트로 바꿔 기존 파라미터를 보존한다.
```js
setSearchParams(prev => {
  const next = new URLSearchParams(prev);
  next.set("team", TEAMS[goalT].c);
  next.set("year", String(YEARS[goalY]));
  return next;
});
```
이 정도 최소 수정은 "기존 구현 재구현 금지" 범위를 벗어나지 않는다(로직 변경 없이 병합 방식만 교정).

### 1.2 탭 기본값 (판단 필요 — 사용자 확인 권장)

프로토타입 상태 기본값은 `tab:'list'`이지만, 이는 신설 화면을 보여주기 위한 프로토타입 편의값으로 보인다. **권고: 기존 서비스 URL(`/mileage`, 쿼리 없음)의 하위호환을 위해 기본값은 `'calc'`로 한다** — 이미 배포된 "마일리지 저격 경로" 진입점 동작을 바꾸지 않기 위함. `tab` 파라미터가 명시적으로 `list`일 때만 리스트 탭을 기본 노출.

---

## 2. 토큰 매핑표

핸드오프 하드코딩 값 → 기존 토큰. 전역 우선, 없으면 도메인 로컬(`mileage.tokens.scss`) 신규 추가.

| 핸드오프 값 | 용도 | 매핑 | 상태 |
|---|---|---|---|
| `#0e0c14` | 페이지 배경 | `var(--color-bg-deepest)` (#0f0a14) | 매핑(근사, 기존 `.screen` 이미 이 토큰 사용) |
| `#161320` | 검색/토글 컨테이너 배경 | `var(--color-bg-deep)` (#140f1f) 또는 `var(--color-bg-overlay)`(#18141f) | 근사 — **참고**: 이 정확한 hex(#161320)는 `--color-admin-table-row-hover`/`--color-ls-row-hover`로 이미 존재하지만 **용도가 다르다**(저 둘은 "행 hover", 여기는 "정적 서피스"). 값 재사용보다 `--color-bg-deep` 매핑 권장 |
| `#2a2638` | 기본 보더 | `var(--color-border-strong)` | 근사(전역은 `rgba(255,255,255,.12)` 반투명이라 배경별 실제 렌더 색이 살짝 다름 — 기존 MileageScreen 전체가 이미 이렇게 매핑해 씀, 그대로 따름) |
| `#1c1927` | 행 구분선 | `var(--color-border)` | 근사 |
| `#e8e4f2` | 주 텍스트 | `var(--color-text-primary)` | 근사 |
| `#b9b0d6` / `#c8c3d6` | 보조 텍스트 | `var(--color-text-secondary)` | 근사 |
| `#8b849c` | 흐린 텍스트 | `var(--color-text-muted)` | 근사 |
| `#6b6580` | 더 흐림 | `var(--color-text-muted)` (구분 없이 통합) 또는 신규 로컬 토큰 | 근사 — 필요시만 로컬 추가 |
| `#3a3450` / `#4e4862` | 비활성 텍스트 | 신규 로컬 토큰 (`--color-mileage-list-disabled`) | **신규 검토** — 전역에 이 정도로 어두운 비활성 톤 없음. 최후수단으로 도입 시 `mileage.tokens.scss`에 추가 |
| `#7c6cf0` | 탭 밑줄·아이콘 액센트 | `var(--color-brand-dark)` (#6d4ad3, 기존 mileage.tokens.scss 주석에 "거의 동일" 명시됨) | 매핑 |
| `#a99bff` | 연도·링크·용어 강조 | `var(--color-mileage-accent-text)` (#c4b5fd, 이미 도메인 로컬 존재) | 근사 재사용 |
| `#c8bfff` | 선택 텍스트 | `var(--color-mileage-chip-on-text)` (#dcd3ff, 이미 존재) | 근사 재사용 |
| `#2a2450` | 선택 배경(칩/세그먼트 on) | `var(--color-mileage-accent-bg)` (rgba(139,92,246,.16), 이미 존재) | 근사 재사용 — 정확히는 legendStats가 쓰는 `var(--color-brand-alpha-15)` 패턴과도 동일 계열, mileage 도메인은 자기 로컬 토큰이 있으니 그걸 우선 |
| `#1b1633` | 행 선택/hover | 신규 로컬 토큰 (`--color-mileage-row-hover` 또는 `--color-mileage-row-selected`) | **신규 검토** — `--color-ls-row-hover`(#161320)·`--color-admin-table-row-hover`(#161320)와 다른 값(#1b1633)이라 그대로 재사용 불가. mileage 로컬로 신규 추가 권장(선례: legendStats/admin이 도메인마다 별도 `row-hover` 토큰을 갖는 방식과 동일 패턴) |
| `#100e17` (표 배경) | 표 컨테이너 배경 | `var(--color-bg-deepest)` | 근사(거의 동일) |
| `#131020` (표 헤더 배경) | 표 헤더 배경 | `var(--color-bg-deep)`(#140f1f) 또는 신규 로컬 | 근사 — 정확히는 legendStats/admin의 `--color-ls-head-bg`/`--color-admin-table-head-bg`(#15121c)가 더 가깝다. **표 헤더는 §5에서 legendStats 패턴을 따르기로 했으므로 `--color-ls-head-bg`와 동일 값을 mileage 로컬에 신규 추가**(`--color-mileage-list-head-bg: #15121c`) 하는 편이 통일성에 낫다 |
| `#3d3470` (표 헤더 하단 보더) | 표 헤더 보더 | 신규 로컬 또는 `var(--color-border-strong)` 근사 | 근사 허용(강조 정도 차이만 있음) |
| `#141120` (모달 배경) | 도움말 모달 배경 | `var(--color-bg-card)`(#1f1a29) — legendStats `.helpCard`가 쓰는 정확히 같은 토큰 | 매핑(legendStats 도움말 모달과 동일 톤으로 통일) |
| `#4a3f8f` / `#5a4fd8` (모달 강조 보더) | 도움말 배지·닫기 버튼 보더 | `var(--color-brand-dark)` 근사 | 근사 |
| 라운드 999px / 8px / 10~12px / 14px | radius | `$radius-full` / `$radius-lg` / `$radius-xl`·`$radius-2xl` / **14px 리터럴**(legendStats `.helpCard`가 이미 토큰 없이 14px 직접 사용 — 선례 그대로 따름) | 매핑 |

**요약**: 매핑됨(전역 재사용) 12건, 근사(허용 오차 내 대체) 8건, 신규 로컬 토큰 검토 3건(`disabled 텍스트`, `행 hover/선택`, `표 헤더 배경` — 단 표 헤더는 legendStats와 값을 맞추는 선택).

### 2.1 구단 도트 색

핸드오프 `TEAM_DOT`(17개 한글/영문 혼용 키)을 그대로 옮기지 않는다. 실제 API는 `teamCode`가 `mileage/config/mileage.js`의 `TEAMS_RAW.code`(DOO/SAM/HAN/LOT/KIA/KIW/SSG/LG/NC/KT/OB/MBC/BIN/SUP/HAE/HYU/SSA/CHU/PAC/SK)로 온다 — 표시명 변환은 `players/store/adapter.js`의 `TEAM_NAME_BY_CODE` 패턴(`Object.fromEntries(TEAMS_RAW.map(t=>[t.code,t.name])); TEAM_NAME_BY_CODE.KT="kt"`)을 그대로 따른다.

기존 `legendStats/config/legendStats.js`·`historyLegend/config/historyLegend.js`에 **완전히 동일한 내용의 `TEAM_COLOR`**(10개 현대 구단, 도메인마다 중복 정의하는 게 이 코드베이스 관행)가 이미 있다:
```js
{ 삼성:"#2a6fd6", 두산:"#4b63b8", LG:"#e0245e", KIA:"#ef3340", 롯데:"#3d7fd6",
  키움:"#b4324e", SSG:"#e0384f", NC:"#4f7fbf", 한화:"#f97316", kt:"#9aa0aa", KT:"#9aa0aa" }
```

**권고**: 이 10색을 그대로 재사용(통일성 최우선 — 핸드오프의 자체 색상 대신)하고, 핸드오프 데이터 범위(1982~2018년대 재료 카드)에 필요한 **구 구단 7종만 핸드오프 값으로 보충**한다 — `OB`(→두산과 동일 계열이나 구분 위해 핸드오프 값 유지 가능), `MBC`, `HAE`(해태), `BIN`(빙그레), `HYU`(현대), `SSA`(쌍방울), `PAC`(태평양), `CHU`(청보, 값 없으면 fallback), `SUP`(삼미, 값 없으면 fallback). 매칭 안 되는 코드는 핸드오프의 "기타" 기본값 `#6b6580`으로 폴백.

⚠️ **불일치 발견(판단 필요)**: `kt`/`KT` 색이 legendStats는 회색(`#9aa0aa`), 핸드오프는 검정(`#000`)이다. 다크 배경에 검정 도트는 거의 안 보인다(접근성 문제이기도 함) — **legendStats의 회색을 그대로 쓰는 걸 권장**(통일성 + 가독성 둘 다 이김).

이 병합 맵은 `mileage.js`(불가침)에 넣지 말고 **신규 파일**에 둔다(§4 참조).

---

## 3. 재사용 가능한 기존 컴포넌트

| 컴포넌트/패턴 | 경로 | 판정 |
|---|---|---|
| 검색 입력 + 칩 필터 + 세그먼트 + 정렬 가능 표 + 도움말 모달 **전체 구조** | `domains/legendStats/mobile/LegendStatsScreen.jsx` + `.module.scss` | **패턴 그대로 따름**(§5) — 가장 가까운 선례. 컴포넌트 자체를 import하진 않고(다른 도메인 `mobile/components` cross-import 금지, 컨벤션 §11) 동일 SCSS 패턴을 mileage 도메인에 새로 작성 |
| `Skeleton` | `global/ui/mobile/stateBox/Skeleton.jsx` | 재사용(그대로) — 표 행 스켈레톤에 활용, 단 핸드오프의 "헤더+12행" 요구에 맞게 `<tr>` 12개 안에 배치(§7) |
| `StateBox` | `global/ui/mobile/stateBox/StateBox.jsx` | **재사용 안 함** — 전체 블록 대체용이라 핸드오프의 "표 안 1줄" 요구(§7)와 안 맞음. 대신 `<tr><td colSpan>` 인라인으로 직접 구현(StateBox 텍스트/버튼 스타일만 참고) |
| `TEAM_COLOR`/`teamColor()` | `legendStats/config/legendStats.js`, `historyLegend/config/historyLegend.js` | 값 재사용(§2.1) — import는 안 함(cross-domain import 금지 컨벤션), 동일 값을 mileage 로컬에 재정의(기존 두 도메인이 이미 그렇게 하고 있는 관행) |
| `mileage.sniperTargets` store | `domains/mileage/store/**` | **그대로 재사용** — 신규 API/슬라이스 불필요(§0) |
| `AdminSegmented` | `global/ui/admin/fields/AdminSegmented.jsx` | 재사용 안 함 — `--color-admin-*` 전용 토큰 결합이라 스타일이 안 맞음. 옵션 배열+onChange 구조만 참고, 스타일은 legendStats `.segment` 패턴으로 새로 작성 |
| `CommunityAdminTabs` | `community/feature/components/admin/tabs/` | 재사용 안 함 — 옛 `feature/` 폴더 구조(컨벤션 §11 금지 대상) + community 도메인 동결 상태 + admin 톤. 탭 바는 mileage 도메인에 신규 작성 |

---

## 4. 새로 만들어야 하는 것

| 파일 | 내용 |
|---|---|
| `domains/mileage/config/mileageTargetList.js` (신규) | 순수 함수/상수 전용, `mileage.js`(불가침) 건드리지 않는 별도 파일. `POS_ORDER`, 병합 `TEAM_DOT_COLOR`(§2.1), `TEAM_NAME_BY_CODE`(players/adapter.js 패턴 재구성), 정렬 비교자 5종(§6), 검색/필터 순수 함수, `toTargetListModel(sniperTarget)` (API 응답 → 화면 모델 변환: `id/name/team/year/pos/legend`) |
| `domains/mileage/mobile/hooks/useMileageTargetList.js` (신규) | `useSelector(state => state.mileage.sniperTargets)` 읽기, `!loaded`면 dispatch, 검색어/모드/포지션 필터/정렬 state(useState) + useMemo 파생(§0 store-sharing-design.md §5 설계를 그대로 채택 — `useMileageBadge`와 동일 가드 패턴) |
| `domains/mileage/mobile/components/targetListTable/TargetListTable.jsx` + `.module.scss` (신규, 조건부) | 표만 별도 부품으로 뺄지 Screen에 인라인할지는 §3원칙(반복/변형/재사용) 기준 판단 — **재사용처가 없으므로 Screen에 인라인 권장**, 단 JSX가 200줄을 넘기면 가독성 위해 분리 검토 |
| `domains/mileage/mobile/MileageScreen.jsx` (기존 파일 **일부 수정**) | 최상단에 탭 바 추가, `tab==='list'`분기로 새 리스트 화면 렌더, `tab==='calc'`분기 상단에 배너 추가. 기존 시뮬레이션 JSX 블록 자체는 이동 없이 유지 |
| `domains/mileage/mobile/MileageScreen.module.scss` (기존 파일 **일부 수정**) | 탭 바/리스트 화면/모달 클래스 추가. 기존 클래스 삭제·이름변경 금지 |
| `domains/mileage/mobile/hooks/useMileage.js` (기존 파일 **일부 수정**) | ① `openTable`/`closeTable` 병합형으로 교정(§1.1) ② `tab`/`id`/`pos` 쿼리 읽어 배너 표시 여부·목표 셀렉트 초기값 세팅 로직 추가(README §"행 클릭→시뮬레이션 연동" 그대로) ③ 배너 닫기(×) 핸들러: `team/year/pos`를 미정으로 리셋 + 쿼리에서 `id/team/year/pos` 제거 |
| `domains/mileage/mobile/mileage.tokens.scss` (기존 파일 **일부 수정**) | §2 "신규 로컬 토큰 검토" 3종 추가만(기존 변수 삭제·수정 금지) |

---

## 5. 표 스타일 결정

**`legendStats/mobile/LegendStatsScreen.module.scss`의 `.table`/`.tableBox` 패턴을 따른다.** (`AdminTable`도, 마일리지 자체의 구단×연도 히트맵 표도 따르지 않는다.)

근거:
1. `AdminTable`은 `--color-admin-*` 토큰 체계와 관리자 페이지네이션/체크박스 기능에 결합돼 있어 공개 모바일 화면과 성격이 다르다(어드민 전용 UI 셸).
2. 마일리지 자체의 `MileageScreen.module.scss` 표(`.table`)는 **구단×연도 히트맵 매트릭스**(세로쓰기 헤더, `writing-mode:vertical-rl`, 열 30+개)로 구조적 목적이 완전히 다르다 — 재사용 대상 아님.
3. `legendStats`의 표는 **검색+칩필터+세그먼트+정렬가능 헤더+행 클릭+도움말 모달**까지 이번 리스트 탭 요구사항과 거의 1:1로 겹치는 유일한 선례다. `sortable`/`arrow` 클래스, `thead th` 정렬 클릭, `.row:hover`, `.empty` 처리까지 그대로 이식 가능.

차이점(핸드오프 고유 요구라 legendStats에서 변형 필요):
- legendStats는 가로 스크롤 표(고정폭 sticky 열)라 `position:sticky` 헤더/열이 있지만, 이번 표는 `max-width:520px` 안에 6열이 다 들어가므로(`30px 1.1fr 1.3fr 58px 56px 58px`) **가로 스크롤도 sticky도 불필요** — `overflow-x:auto` 없이 `table-layout` 그대로.
- 헤더 색은 legendStats의 `--color-ls-head-bg`(#15121c)와 동일 값을 mileage 로컬 토큰으로 새로 추가해 맞춘다(§2 표 참고).

---

## 6. 동작 명세 (`.dc.html` 실측, README와 100% 일치 확인됨)

원본 로직(`마일리지 저격 선수 리스트.dc.html` 157~235행)을 그대로 옮긴다:

```js
const POS_ORDER = ['C','1B','2B','3B','SS','LF','CF','RF','DH','SP','RP','CP'];

// 필터: 포지션 칩은 검색 모드와 무관하게 항상 적용
rows = data.filter(d => !pos || d.pos === pos);

// 검색: mode==='pos'(재료) → name+team+year 이어붙여 포함검사 / mode==='legend' → legend만
if (q) rows = rows.filter(d =>
  (mode === 'pos' ? d.name + d.team + d.year : (d.legend || '')).toLowerCase().includes(q));

// 정렬 비교자 5종 — 전부 2차 tie-break 존재
const cmp = {
  pos:    (a,b) => POS_ORDER.indexOf(a.pos) - POS_ORDER.indexOf(b.pos)
                   || a.name.localeCompare(b.name,'ko') || a.year - b.year,
  name:   (a,b) => a.name.localeCompare(b.name,'ko') || a.year - b.year,
  legend: (a,b) => (a.legend||'').localeCompare(b.legend||'','ko') || a.name.localeCompare(b.name,'ko'),
  team:   (a,b) => a.team.localeCompare(b.team,'ko') || a.year - b.year,
  year:   (a,b) => a.year - b.year || a.name.localeCompare(b.name,'ko'),
}[sortKey];
rows = [...rows].sort((a,b) => cmp(a,b) * dir);   // dir: 1 | -1

// 열 클릭: 같은 열 재클릭 시 dir 반전, 다른 열 클릭 시 그 열 + dir=1
setSort = k => () => setState(s => ({ sortKey: k, dir: s.sortKey === k ? -s.dir : 1 }));
// 카운터 행 정렬 라벨 클릭: 열은 그대로, dir만 반전
toggleSort = () => setState(s => ({ dir: -s.dir }));
```

- 기본 정렬: `sortKey:'pos', dir:1`.
- 검색 모드 토글(재료/레전드)은 `pos` 필터를 **리셋하지 않는다.**
- 포지션 칩은 **12개 항상 렌더**, 데이터 0건인 칩만 `cursor:not-allowed`로 비활성(클릭 무시) — `data.some(d => d.pos === p)`로 판정, **현재 필터링된 결과가 아니라 전체 `data` 기준**으로 판정한다(원본 `posChip`이 `data`를 참조, `rows`가 아님 — 필터 적용 중에도 칩 자체는 사라지지 않게 하려는 의도).
- 행 클릭: `history.replaceState`로 URL 갱신 후 `tab='calc'` 전환 + 목표 세팅. `?tab=calc&id={id}&team={team}&year={year}&pos={pos}` — **여기 `team`은 표시명 문자열**(예: "삼성"), 코드가 아님(§1.1 참고).
- 리스트 탭 복귀: `?tab=list`만 바뀌고 `id` 등은 유지 — 복귀 시 이전 선택 행이 하이라이트(`target.id === d.id`이면 배경 `#1b1633`, §2 신규 토큰).
- 최초 로드 쿼리 파싱: `tab`(§1.2에서 기본값 `calc`로 변경 권고) → `id` 있으면 데이터에서 `find`해 target 세팅 → `id` 없고 `team/year/pos`만 있으면 목표 셀렉트 초기값만 세팅(target 없음, 배너도 안 뜸 — README 정의: 배너는 "리스트에서 넘어왔을 때만" = `id`가 있을 때만).
- 카운터: `{shown}명 · 레전드 미정 {null count}` — `shown = rows.length`(필터링 후), null count는 **필터링 후 rows 기준**(README 문면상 "shown과 같은 값"이라 명시했으므로 `rows.filter(d => d.legend == null).length`로 구현. 단 §0 확인 필요 사항대로 현재 API로는 항상 0).

---

## 7. 상태 처리

| 상태 | 처리 |
|---|---|
| 로딩 | 표 헤더(`<thead>`)는 정상 렌더, `<tbody>`에 `<tr>` 12개 — 각 행 `<td colSpan={6}>`에 `Skeleton count={1} height={18}` (또는 열마다 폭 다른 바 여러 개, 구현 자유). 검색행/칩/카운터행은 로딩 중에도 그대로 노출(비활성 아님 — README에 로딩 중 인터랙션 잠금 언급 없음) |
| 에러 | `<tbody>`에 `<tr><td colSpan={6}>` 안에 "불러오지 못했습니다" 텍스트 + 재시도 버튼 1개(`StateBox`의 에러 텍스트/버튼 스타일 참고해 인라인 마크업으로 직접 작성) |
| 빈 결과(필터링 결과 0건) | `<tbody>`에 `<tr><td colSpan={6}>` 안에 "조건에 맞는 선수가 없습니다." (padding 40px 0, center) — `data.length === 0`(원본 데이터 자체가 없음)과는 다른 케이스이니 분리해서 처리(원본 0건은 사실상 API 실패 케이스와 동일하게 취급해도 무방, 발생 가능성 낮음) |

---

## 8. 구현 dispatch brief

```
목적: 「마일리지 저격 선수 리스트」 탭 신규 구현 + 「저격 시뮬레이션」 탭에 배너 연동
1차 참조: 본 문서(docs/domain/mileage/prd/target-list-design-spec.md) 전체
추가 참조: docs/domain/mileage/prd/store-sharing-design.md §5(훅 설계), README.md(원본 핸드오프)

신규 파일:
  - domains/mileage/config/mileageTargetList.js
      POS_ORDER, TEAM_DOT_COLOR(§2.1 병합맵), TEAM_NAME_BY_CODE(players/adapter.js 패턴),
      sortComparators(§6 5종), filterRows(pos, query, mode), toTargetListModel(raw)
  - domains/mileage/mobile/hooks/useMileageTargetList.js
      state.mileage.sniperTargets 셀렉터 + !loaded 시 dispatch(requestGetSniperTargets)
      (useMileageBadge.js와 동일 가드, import는 새로 함 — 기존 파일 수정 없음)
      query/mode/pos/sortKey/dir/helpOpen useState, useMemo로 filterRows+sort 파생
  - domains/mileage/mobile/components/targetListTable/TargetListTable.jsx (+.module.scss)
      §5 legendStats 패턴 이식. 필요 없으면 Screen에 인라인해도 무방(§4 판단 위임)

기존 파일 수정 (Edit 가능, 각 파일당 담당 agent 1개로 겹치지 않게):
  - domains/mileage/mobile/MileageScreen.jsx — 탭 바 + tab 분기 + 배너 추가(§1, §4)
  - domains/mileage/mobile/MileageScreen.module.scss — 탭 바/리스트/모달 클래스 추가만
  - domains/mileage/mobile/hooks/useMileage.js — openTable/closeTable 병합형 교정(§1.1),
    tab/id/pos 쿼리 파싱 + 배너 상태 + 초기 셀렉트 세팅(§6 "최초 로드 쿼리 파싱")
  - domains/mileage/mobile/mileage.tokens.scss — §2 신규 로컬 토큰 3종 추가만

절대 수정 금지:
  - domains/mileage/config/mileage.js (계산 로직 불가침)
  - domains/mileage/store/** (이미 완성됨, §0 — 필드 매핑은 훅/config에서 처리)
  - domains/legendStats/**, domains/historyLegend/**, domains/players/** (값만 참고, import/수정 금지)
  - web/src/app/router/**, domains/playerSkills/**, src/main/java/**, sql/**, scripts/**

검증 체크리스트:
  - [ ] `/mileage` 쿼리 없이 접속 시 기존 시뮬레이션 화면 그대로(§1.2 하위호환)
  - [ ] `/mileage?tab=list` 접속 시 표에 헤더+데이터 정상 렌더, 정렬 5종 동작
  - [ ] 포지션 칩 12개 항상 보임, 데이터 0건 칩만 비활성
  - [ ] 리스트 행 클릭 → `/mileage?tab=calc&id=...&team=...&year=...&pos=...` 이동, 배너 노출, 셀렉트 초기값 세팅
  - [ ] 배너 × 클릭 → 쿼리에서 id/team/year/pos 제거, 셀렉트 미정 리셋
  - [ ] 시뮬레이션 탭에서 "구단 × 연도 표 보기" 열어도 tab/id/pos 쿼리 안 날아감(§1.1 회귀 확인)
  - [ ] 로딩(Network throttle)·에러(API mock 500)·빈 검색결과 3상태 확인
  - [ ] 320px 폭에서 표 6열 가로 스크롤 없이 표시(design.md §3)

HITL/사용자 결정 필요:
  - §0: "레전드 미정" 카운터가 현재 BE 쿼리(INNER JOIN)로는 항상 0 — BE 쿼리 변경 여부 결정 필요(FE 범위 밖)
  - §1.2: tab 기본값 'calc'(권고) vs 'list'(프로토타입 원안) 확정 필요
  - §2.1: kt/KT 도트 색 legendStats 회색(#9aa0aa, 권고) vs 핸드오프 검정(#000) 확정 필요
```
