# figma-plugin 토큰 감사 — admin 4종

> 대상: `figma-plugin/shared/tokens.ts`, `helpers.ts`, `code.ts`, `domains/admin-{coupon,event,notice,user}.ts`
> 기준: `DESIGN.md`, `docs/domain/admin/prd/admin-components.md`, Figma `✦ 컴프야펀 Design System v3.0`(`101:4951`) — 실측

## 한눈에 보기

| 감사 항목 | 판정 | 건수 요약 |
|---|---|---|
| ① 토큰 일치 (색·글자·간격) | 부분 | 글자(FS)·간격(SPACE) 9단계는 DESIGN.md와 완전 일치(실측). 색(COLOR)은 17개 중 raw 표기 4개 + DESIGN.md에 있는데 tokens.ts에 없는 색 7개 + 값 자체가 다른 색 2개 |
| ② 하드코딩 | 어긋남 | admin-*.ts 4개 파일에 raw 색상 리터럴 30건(실측), FS 토큰 안 거친 raw 폰트크기 4건, LAYOUT 토큰 0% 참조 |
| ③ 재사용 구조 | 어긋남 | `helpers.ts`는 frame/text 원시 함수만 제공(6개). 카드·검색창·칩·버튼·배지 5종을 4개 파일이 각자 다시 그림 — 재사용 함수 0개 |
| ④ 컴포넌트 승격 준비도 | 어긋남 | `figma.createComponent()` / `combineAsVariants()` 호출 0건(실측, 전체 저장소). 부품 6종 중 3종(VisibleToggle/ConfirmDialog/AdminFormPanel 완성형)은 아예 안 그려짐 |
| ⑤ DS v3.0 ↔ tokens.ts 갭 | 어긋남 | Figma DS는 `fs-28/hero`, `sp-16`, `lc/SCREEN_WIDTH`, `RADIUS.card` 같은 별도 이름 체계(실측, 텍스트 노드 이름으로 확인). tokens.ts와 이름이 하나도 안 겹침 — 값만 같고 체계는 따로 논다 |

## 토큰 대조

값이 어긋나거나 한쪽에만 있는 것만 적는다. 색상 hex는 DS v3.0 프레임 안 텍스트 노드에서 실측.

| 구분 | DESIGN.md | tokens.ts | Figma DS v3.0 | 판정 |
|---|---|---|---|---|
| alert-red | `#e84141` | `iconFail: #f87171` | `#e84141`(실측) | **값 다름** — 같은 "실패/위험" 의미에 tokens.ts만 다른 hex |
| caution-amber | `#e8d541` | 없음 | `#e8d541`(실측) | tokens.ts에 토큰 자체가 없음. admin-notice.ts·admin-user.ts가 `#ffd235`를 직접 하드코딩(또 다른 값) |
| iconSuccess | 없음(DESIGN.md 팔레트 밖) | `#4ade80` | — | tokens.ts 주석에 스스로 "raw green"이라 표기 — 출처 불명 |
| modalBtn | action-indigo `#6c5ce7` | `#6366f1`("raw indigo") | `#6c5ce7`(실측) | **값 다름** — 같은 의미(모달 확인 버튼)에 tokens.ts가 다른 indigo 사용 |
| modalText | 없음 | `#e5e7eb`("raw") | — | DESIGN.md 팔레트 밖 값, tokens.ts 주석도 raw로 자인 |
| text-code | `#d9d3e0` | 없음 | `#d9d3e0`(실측, DS 헤더 accent 텍스트) | tokens.ts에 토큰 없음 → admin-coupon.ts 133행이 `solid('#d9d3e0')`로 직접 하드코딩 |
| text-placeholder | `#7c6f8f` | 없음 | `#7c6f8f`(실측) | tokens.ts에 없음. `SearchField` placeholder는 대신 `ALPHA.textMuted`로 대체 사용 중(용도 다른 값 재활용) |
| violet-pale / violet-light / dugout-plum / surface-community | `#ede0ff` / `#c9a5f8` / `#3c1e50` / `#19284b` | 없음 | dugout-plum `#3c1e50`만 실측 확인 | 4색 다 tokens.ts 미정의 |
| border-strong (12%) | `rgba(255,255,255,0.12)` | 없음 (`ALPHA.border`는 6%뿐) | — | DESIGN.md는 "테두리 6%·12% 두 단계"라 하는데 tokens.ts는 6%만 존재. 초점 상태(포커스 시 테두리 강화)를 표현할 토큰이 없음 |
| RADIUS xs (2px) | `2px`("아주 작은 표시") | 없음 (`sm:4`부터 시작) | — | DESIGN.md 8단계 중 tokens.ts는 7단계만 옮김 |
| badge-status 7색 (신규/인기/종료/추천/한정/이벤트/보상) | `#16a34a` 외 6개 | 없음 | — | admin 화면엔 아직 안 쓰이지만, `admin-components.md`가 재사용 지정한 `StatusBadge.jsx`가 이 7색을 쓰므로 승격 시 필요 |
| FS(글자 9단계) | 9·10·11·12·13·15·17·22·28 | 동일 | `fs-9/badge`~`fs-28/hero`(실측, 이름만 다르고 값 동일) | 일치 |
| SPACE(간격 9단계) | 4·8·12·16·20·24·32·40·48 | 동일 | `sp-4`~`sp-48`(실측) | 일치 |

## 하드코딩 현황

| 파일 | raw 색상 리터럴 | raw 폰트크기(FS 미사용) | LAYOUT 토큰 참조 |
|---|---|---|---|
| admin-coupon.ts | 8건 (38·79·133·142·143·149·188·242행) | 1건(334행, FAB `+` size 22) | 0건 — `const W = 375` 직접 선언(59행) |
| admin-event.ts | 5건 (35·65·140·141·184행) | 2건(107·253행) | 0건 |
| admin-notice.ts | 7건 (35·65·121·127·141·142·186행) | 1건(255행) | 0건 |
| admin-user.ts | 10건 (35·64·128·159·160·180·182·183·270행 + `#ffd235`) | 0건 | 0건 |
| **합계** | **30건** | **4건** | **4개 파일 전부 0%** |

대표 사례
- `admin-coupon.ts:142-143` — 노출/비노출 chip 배경을 `solidA({ r: 0.18, g: 0.78, b: 0.5, a: 0.18 })` / `{ r: 1, g: 0.44, b: 0.44, a: 0.18 }`로 매 파일 재입력. 4개 파일 전부 동일 리터럴을 복붙(색 이름 없이 숫자로만 존재).
- `admin-user.ts:159` — 관리자 role chip 배경을 `{ r: 168/255, g: 106/255, b: 240/255, a: 0.2 }`로 계산. 이건 `COLOR.brand`(`#a86af0` = 168,106,240)를 굳이 0~1 실수로 재환산한 것 — `solidA`가 아니라 `Helpers.solid(COLOR.brand)` + opacity 처리로 됐어야 함.
- `admin-notice.ts:127`, `admin-user.ts:183` — 고정/일시정지 배지에 `#ffd235`를 두 파일이 각각 하드코딩. DESIGN.md의 caution-amber(`#e8d541`)와도 다른 제3의 노랑.
- 폭(W): 4개 파일 전부 `const W = 375`를 로컬 상수로 재선언. `Tokens.LAYOUT.mobileLg`(428px, DESIGN.md 단일 폭 규칙의 근거 값)를 참조하는 곳이 하나도 없다 — 화면 폭이 DESIGN.md가 정한 480px 상한/428px 프레임 값과 무관하게 파일마다 따로 정해짐.
- FAB `+` 아이콘 4곳 모두 `size: 22`를 직접 씀(값 자체는 `FS.fs22`와 같지만 토큰을 거치지 않음 — "의미 이름 규칙" 위반).

## 중복 그리기 함수

같은 UI를 여러 파일이 각자 다시 그리는 목록. 승격 우선순위 순.

| 순위 | 그리는 것 | 중복 파일 | 구조 일치도 | 비고 |
|---|---|---|---|---|
| 1 | 카드 컨테이너 쉘 (`bgCard` + radius 10 + border 6% + 안쪽 여백 상12/하12/좌12/우12) | coupon `.CouponCard` / event `.EventCard` / notice `.NoticeCard` | 매우 높음 — 크기 88/100/86만 다르고 나머지 동일 | `AdminList`의 카드 셸로 바로 승격 가능. 3개 함수를 1개 `makeCard()`로 합치면 끝 |
| 2 | 검색창 (`buildSearchBar`) | coupon·event·notice·user 4개 전부 | 매우 높음 — placeholder 문구만 다름 | `SearchField` 승격 1순위. 단 현재 높이 40px는 스펙(36px)과 다름 — 승격 시 값도 같이 고쳐야 함 |
| 3 | 필터 칩 줄 (`buildFilterRow`) | 4개 전부 | 높음 — 라벨 배열과 폭 계산식(`label.length * N + M`)만 파일마다 다름 | `FilterChipGroup` 승격 대상. 폭을 문자열 길이로 즉석 계산하는 방식 자체가 컴포넌트화 시 없어져야 함(고정 padding + hug로 대체) |
| 4 | 수정/삭제 버튼 쌍 | coupon·event·notice 3개(카드 안), user는 없음(행 자체가 클릭 대상) | 높음 — 색(`brandDark`/red-alpha) 로직 100% 동일 | `RowActions`(admin-components.md 표에서 "커스텀 위임" 권고) 승격 대상. 단 현재 높이 24px — DESIGN.md 최소 터치 44px 규칙 위반, 승격 시 크기부터 재설계 필요 |
| 5 | 상태 chip(노출/비노출/역할/유저상태) | 4개 전부, 각자 rgba 계산 | 중간 — 의미별로 색상 규칙이 파일마다 미묘히 다름(예: user는 SUSPENDED 3번째 상태 추가) | `StatusBadge.jsx` 재사용 대상이지만 지금 그려지는 색이 badge-status 7색 팔레트와 무관한 별도 rgba라 그대로 옮기면 안 됨 |
| 6 | TopBar (`"← {title}"` 52px 바) | 4개 전부, 주석에 "글로벌" 표기만 있고 실제로는 매번 새로 그림 | 높음 | admin-components.md 범위 밖(TopBar는 이미 코드상 전역 컴포넌트) — 그러나 figma-plugin에서는 여전히 도메인마다 인라인 재작성 중이라 Figma 쪽 컴포넌트화도 별도로 필요 |
| 7 | FAB `+` 등록 버튼 (56×56 pill) | coupon·event·notice 3개 | 높음 | `Button`으로 승격하되, 44/36 두 크기 스펙에 없는 56px라 크기 정책부터 정해야 함(아래 "판단이 필요한 것") |

## 컴포넌트 승격 작업 목록

| 부품 | 현재 코드 위치 | 승격 시 바꿀 것 | 난이도 |
|---|---|---|---|
| `Button` | FAB(3파일 inline, 56px) / 수정·삭제(3파일 inline, 24px) / 저장버튼(admin-coupon만, 44px) — 셋 다 서로 다른 크기·모양으로 흩어짐 | ① `helpers.ts`에 `makeFrame` 옆에 `makeComponent`(같은 옵션으로 `figma.createComponent()` 호출) 추가 → ② variant(primary/secondary/danger) × size(md/sm) `combineAsVariants()`로 묶기 → ③ 24px짜리 수정/삭제 버튼은 44px 최소 규칙 위반이므로 크기부터 재설계 → ④ 56px FAB는 Button 스펙에 없는 값이라 별도 처리 여부 결정 필요 | 중간 — variant 조합 자체는 단순하지만 기존 3곳의 서로 다른 크기값부터 정리해야 함 |
| `Field` | admin-coupon.ts `buildBottomSheet` 안에서만 존재(text 타입만, 3개 필드 하드코딩). event/notice/user엔 폼이 아예 없음 | text 하나만 그리던 것을 5타입(`text/number/date/select/checkbox`) 분기로 확장, `error`/`required`/`disabled` 상태 추가 후 컴포넌트화 | 높음 — 지금 코드에 select/checkbox 형태가 전혀 없어 처음부터 새로 그려야 함 |
| `SearchField` | 4파일 `buildSearchBar` 각각 | 4개 함수를 1개로 합치고 높이 40→36px 정정, `figma.createComponent()`로 전환 | 낮음 — 구조가 이미 거의 동일 |
| `FilterChipGroup` | 4파일 `buildFilterRow` 각각 | 문자열 길이 기반 폭 계산 제거(hug 방식으로), 높이 28→36px 정정, 선택/기본 2-variant `combineAsVariants()` | 낮음~중간 |
| `AdminFormPanel` | admin-coupon.ts `buildBottomSheet`가 "여는 방식"(바텀시트)과 "내용"(필드 3개+저장버튼)을 한 함수 안에 섞어놓음 | 여는 방식(모서리 12px, 여백, 배경)만 남기고 내용은 `children`으로 분리 — 지금 구조로는 바로 재사용 불가 | 중간 |
| `ConfirmDialog` | 없음(0건) | 완전 신규 작성 | 높음 — 참고할 기존 코드가 전혀 없음 |

## 판단이 필요한 것

- **모달·아이콘 계열 raw 색(iconSuccess `#4ade80`, iconFail `#f87171`, modalBtn `#6366f1`, modalText `#e5e7eb`) 처리** — DESIGN.md 팔레트에 없는 4개 값. DESIGN.md의 alert-red(`#e84141`)·action-indigo(`#6c5ce7`)로 통합할지, "raw 예외" 카테고리로 tokens.ts에 남길지 결정 필요. 통합 권고(같은 의미에 값이 두 개 있는 상태가 가장 위험).
- **caution-amber 도입 여부** — DESIGN.md `#e8d541` vs 현재 하드코딩된 `#ffd235`(notice/user 2곳). 정식 토큰으로 추가하고 두 하드코딩을 교체하는 걸 권고.
- **화면 폭 기준값(W)** — 지금 전 파일이 iPhone 표준폭 375px를 직접 선언 중이나 DESIGN.md·tokens.ts는 428px(`LAYOUT.mobileLg`)/480px(콘텐츠 상한)를 기준으로 삼는다. figma-plugin 렌더 폭을 어느 쪽에 맞출지부터 정해야 이후 컴포넌트 폭이 흔들리지 않음. LAYOUT.mobileLg(428) 권고.
- **FAB 56px 크기 정책** — Button 스펙(44/36)에 없는 값. FAB 전용 3번째 크기를 신설할지, 44px로 통일할지 결정 필요.
- **노출 스위치(VisibleToggle) 미구현** — admin-components.md는 실제 토글 스위치를 요구하지만 지금 figma-plugin은 4파일 전부 "노출/비노출" 텍스트 chip만 그리고 있어 토글 UI 자체가 존재하지 않는다. 다음 컴포넌트 작업에서 처음부터 새로 그려야 함(재사용할 기존 그림 없음).
