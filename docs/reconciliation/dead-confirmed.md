# dead-confirmed.md — 3쪽 dead 후보 high-confidence cross-check

> 입력: `docs/specs/{be,fe,db}/dead-suspects.md`
> 본 문서는 FE 단독 dead 후보를 BE/DB 측 endpoint 와 cross-check 해서 **세 쪽 모두 dead 인 항목** 을 high-confidence dead 로 확정.

---

## 1. FE 단독 확정 dead — BE/DB cross-check

### 1-A. `domains/mobile/` 전체 (MobileHomePage 포함)

- FE 신호: `web/src/domains/mobile/` import 0건 확정 (fe/dead-suspects.md:14)
- `MobileHomePage.jsx` placeholder 코드 ("어????????????")
- BE/DB 영향: **없음**. FE 도메인 폴더이므로 BE endpoint 매핑과 무관
- **결론: dead 확정 (FE 단독)**
- 영향 범위: 폴더 전체 삭제 가능. `domains/home/components/HomeScreen.jsx` 가 실제 진입점 — 충돌 없음
- **권장 액션**: 즉시 삭제. Owner 결정상 "공용 승격 / 흡수 / 폐기" 중 폐기 선택

### 1-B. `app/wrapper/parts/{Header,Footer}.jsx` + 관련 hooks/scss

- FE 신호: import 0건 (fe/dead-suspects.md:15-19)
- 활성 layout 은 `wrapper/mobile/parts/{TopBar,Drawer}.jsx`
- BE/DB 영향: 없음
- **결론: dead 확정 (FE 단독)**
- 영향 범위:
  - `Header.jsx`, `Footer.jsx`, `Header.module.scss`, `Footer.module.scss`
  - 종속 hooks: `useHeaderAuth.js`, `useHeaderNav.js`, `useHeaderUI.js` — Header.jsx 만 사용 → dead chain
- **권장 액션**: 즉시 삭제 가능. PC 헤더가 아예 없는 모바일 단일 레이아웃이므로 복원 시나리오도 없음

### 1-C. `domains/admin/store/{api,endpoints,thunks}.js` (전체 주석)

- FE 신호: 파일 전체 주석 처리 (fe/dead-suspects.md:61, fe/api-calls.md:75)
- 현재 운영은 `domains/events/store/admin/*` 가 대체
- BE 측 cross-check: 이 파일들이 의도한 endpoint (구 events admin) 는 BE 측 `AdminEventController` (`/api/admin/events*`) 로 이미 이전됨. **BE 영향 없음**
- DB 영향: 없음
- **결론: dead 확정 (FE 단독, 코드도 주석 처리)**
- **권장 액션**: 즉시 삭제 가능

### 1-D. `data/{CafeNotice,FunNotice,HistoryMode}.js`

- FE 신호: import 0건 (fe/dead-suspects.md:22-24)
- `data/HistoryMode.js` 와 `data/historyMode/` 폴더는 무관 (대소문자 차이, 후자가 실제 사용)
- BE/DB 영향: 없음 (정적 mock 데이터)
- **결론: dead 확정**
- **권장 액션**: 즉시 삭제

### 1-E. `core/filters/{CoreVisible,CoreStatus}*.jsx`

- FE 신호: 외부 import 0건 (fe/dead-suspects.md:25-26)
- `core/filters/index.js` re-export 만 존재 — 사용처 없음
- BE/DB 영향: 없음 (필터 UI 컴포넌트)
- **결론: dead 확정**
- **권장 액션**: 즉시 삭제. 단 `useFilterPipline` (CoreSearchFilter 와 함께) 의 일부 chain 인지 확인 필요 — 아래 spot-check 가치

---

## 2. FE 라우트 주석 처리 (legacy PC) — Owner 보존 정책

> Owner 확정: 라우트 주석 = 운영 미사용이지만 **삭제 금지** (기능 참고용).
> 단 BE/DB 측에서도 dead 후보로 잡힌다면 BE/DB 는 정리 가능성이 열림.

### 2-A. `domains/dictionary/` 전체

- FE: 라우트 주석 (fe/dead-suspects.md:40)
- BE: `SkillController#playerTypeSkills` (`/api/skills/{target}`) — endpoints.md:227. **wired 정상**
- DB: `player_skills` mapper (PlayerSkills.xml) — 운영 중
- **결론**: BE/DB 단은 살아있음 (다른 화면 호출 없음에도 코드 운영). FE legacy 코드는 Owner 정책상 보존
- **권장 액션**: 정리 라운드에서 dictionary 도메인 살릴지 폐기인지 결정. BE skill controller 는 그대로 두되, 미사용 흐름 모니터링

### 2-B. `domains/simulate/` 전체

- FE: 라우트 주석 (fe/dead-suspects.md:39)
- BE: `PlayerCardController#getLegendPlayerByPosition` (`/api/player/{position}` LEGACY), `SkillController#skillScoreConfig` — 모두 wired
- DB: `player_legend*`, `player_card*`, `skill_score_config` 운영 중
- **결론**: BE/DB 살아있음. simulate 라우트 살리거나 V2 통폐합 시 함께 결정

### 2-C. `domains/kbo/` 전체

- FE: 라우트 주석 (fe/dead-suspects.md:41)
- BE: `KboGameController` 2개 endpoint wired
- DB: `kbo_games` mapper 1개 (3 SELECT). 운영 row 수 0 추정 (kbocrol 미가동)
- **결론**: BE wired but 운영 데이터 없음. FE legacy 보존, BE 도 동결 상태
- **권장 액션**: KBO 도메인 재진입 시 일괄 정리. 현재는 동결

### 2-D. `domains/community/feature/components/user/**` (PC 레거시)

- FE: 라우트 미등록 (fe/dead-suspects.md:32)
- 사용 thunk: `requestGetUserBoardLists`, `requestGetUserPostListsByBoardId`
- 이들이 호출하는 FE path: `/community/boards`, `/community/board/{id}/posts`
- BE 측 cross-check: BE 는 `/api/boards`, `/api/posts/boards/{boardId}` — **path 자체가 다름** (fe-be-mismatch.md #44-45)
- 즉 PC 레거시 thunk 가 운영 라우트에서 살아나도 **404 반환** → 사실상 추가로 깨진 dead
- **결론**: FE 라우트 미등록 + 호출 path 미스매치. 살리려면 path 도 맞춰야 함
- **권장 액션**: Owner 정책상 보존. 단 살릴 때 path 동기화 필수 — 메모 추가

---

## 3. BE 단독 dead 후보

### 3-A. V2 `fun_player_card` 모듈 (be/dead-suspects.md A, B)

- BE: 빈 컨트롤러 + 빈 DTO 3개 + 빈 record 응답
- DB: 5개 mapper namespace mismatch
- FE: 호출 0건 (spot-check 확인)
- **결론**: 운영 영향 없는 미완 스켈레톤. **현재는 dead 후보 아님 — V2 작업 진행 중인 자리**. 모바일 player_card 화면 신규 시 즉시 활성화 필요
- **권장 액션**: V2 작업 보류 중인 동안 그대로. 단 figma-spec-validator 가 player_card 화면 발견 시 차단

### 3-B. `AdminPlayerCardController` 주석 핸들러 6개 (be/dead-suspects.md C)

- BE: 컨트롤러 내 주석으로만 존재 (file:21-58)
- 의도된 path: `GET /api/admin/player`, `/grade/{grade}`, `PATCH /api/admin/player/{id}` 등
- FE: 호출 0건 (admin player form 은 `/admin/player/teams`, `POST /api/admin/player` 만 사용)
- **결론**: 미구현 dead. service `getPlayerInfo`, `updatePlayerCard` 가 `return null` 스텁
- **권장 액션**: V2 통폐합 시 의도된 핸들러 V2 쪽에서 신규 구현. V1 주석은 정리 가능

### 3-C. `PostService` 미노출 increase 메서드 (be/dead-suspects.md D)

- BE: `PostServiceImpl#increasePostLikeCount/Dislike/Comment/Report` (file:122-167) 컨트롤러 직접 노출 없음
- 추정: `PostReactionService` 등 다른 서비스 내부 호출
- FE: post-reactions endpoint 만 호출 (community admin 만 사용)
- **결론**: 내부 서비스 호출 path 추적 필요 — be-analyzer 영역
- **권장 액션**: 본 reconciliation 단에서 단정 불가. dead 후보 보류

### 3-D. `GET /api/dev/test-token` (be/dead-suspects.md E)

- BE: `permitAll` + ADMIN JWT 즉시 발급 하드코딩
- FE: 호출 0건
- **결론**: dead 가 아니라 **운영 노출 위험 (security)**. 코드 dead 분류 X — 즉시 가드 또는 prod 비활성화 필요
- **권장 액션**: SecurityConfig 에서 `/api/dev/**` denyAll 또는 prod profile 분기로 컨트롤러 비활성화

### 3-E. `.http` 파일과 라우트 불일치 (be/dead-suspects.md F)

- 옛 .http 파일이 stale path 호출 (`/api/events/list/external`)
- BE/FE 운영 영향 없음 (dev fixture)
- **결론**: dead 확정
- **권장 액션**: 정리 시 일괄 갱신

---

## 4. DB 단독 dead 후보

### 4-A. `skill_pitcher_grade_stat` (db/dead-suspects.md 1-D)

- DB: mapper 0건 + V2 짝 없음 + 시드만 (`skillGradeStat.sql`) 존재
- BE: 어디서도 SELECT 안 함 (mapper 자체 부재)
- FE: 영향 없음
- **결론**: orphan 가능성 높음. runtime row 수 검증 필요. dead 확정 보류
- **권장 액션**: runtime-analyzer 가 row 수 + 코드 grep 으로 최종 확정

### 4-B. `legend_pitcher_pitch_slot` (db/dead-suspects.md 1-C)

- DB: mapper 0건. V2 짝 (fun_*_pitch_grades) 도 namespace mismatch 로 호출 안 됨
- BE: 어느 service 도 read 안 함
- FE: 영향 없음
- **결론**: 시드 데이터만 채워진 read-only 마스터 테이블 가능성. runtime 검증 필요

### 4-C. legacy `users`, `events`, `boards`, `posts`, `tags`, `posts_tags`, `notices`, `quiz_answers` 등 8개 (db/dead-suspects.md 1-A)

- DB: V2 짝으로 이전 완료. mapper 0건
- BE: V2 mapper 만 사용
- FE: V2 endpoint 만 호출
- **결론**: 데이터 freeze 상태. 폐기 가능 (단 운영 row 보존 정책 결정 필요)
- **권장 액션**: 운영 데이터 백업 후 DROP 가능. 단 Owner 정책 (legacy 잔존) 따라 보존도 OK

### 4-D. `kbo_*` 5개 (mapper 0건)

- DB: mapper 0건. kbo_games 만 mapper 있음
- BE: kbocrol Python 크롤러 외부 정의 추정
- FE: 영향 없음 (라우트 주석)
- **결론**: 신규 보류 — Owner 진술 일치. dead 아님

---

## 5. 종합 — 즉시 정리 가능 (위험 0)

| 항목 | 위치 | 영향 |
|---|---|---|
| `domains/mobile/` 전체 | FE | 폴더 통째 삭제. 진입점 영향 0 |
| `app/wrapper/parts/{Header,Footer}.jsx` + hooks/scss | FE | 6 파일 삭제. dead chain |
| `domains/admin/store/{api,endpoints,thunks}.js` | FE | 3 파일 (전체 주석) 삭제 |
| `data/{CafeNotice,FunNotice,HistoryMode}.js` | FE | 3 파일 삭제 |
| `core/filters/{CoreVisible,CoreStatus}*.jsx` | FE | 2 jsx + scss 삭제 |
| `global/utils/{DateFormatt,parseDate,sortCoupons}.js` | FE | grep 0 추가 검증 후 삭제 (fe/dead-suspects.md E) |
| `global/layout/callBack/AuthCallBack.jsx` | FE | 활성 path 가 `domains/authentication/callback/` 임 — 중복 제거 |
| `AdminPlayerCardController` 주석 핸들러 6개 | BE | 주석 정리 |
| `.http` stale 파일 | BE | 일괄 갱신 또는 삭제 |

## 6. 정리 시 위험 — 신중

| 항목 | 위치 | 위험 |
|---|---|---|
| `domains/{dictionary,simulate,kbo}/**` | FE | Owner 정책: 보존 (기능 참고용) |
| `domains/community/feature/components/user/**` | FE | Owner 정책: PC 코드 참고 보존 |
| V2 `fun_player_card` 모듈 (BE+DB) | BE+DB | 미완 스켈레톤 — 작업 재개 자리 |
| `coupons` 테이블 | DB | dual-write 정책 결정 전 폐기 금지 |
| legacy V1 운영 데이터 (users/events/boards/posts 등) | DB | 운영 row 보존 정책 결정 후 DROP |
