# 가이드 콘텐츠 기획 — /guides

> AdSense 반려 사유 "가치가 별로 없는 콘텐츠"(게임사 원문 재게재뿐) 해소용. 게임사 공지·쿠폰·이벤트를
> 그대로 옮기는 게 아니라, 사이트 안 데이터를 우리가 직접 분석·정리한 자체 글 12편을 만든다.

---

## 1. 기본 방향

- **가이드는 독립 페이지가 원본이다.** 주소는 `/guides/{slug}` 하나씩 가지고, 검색엔진에 그대로 노출된다(사이트맵 등록, 빌드 시 미리 렌더링).
- **화면 안 도움말 버튼은 이 원본을 모달로 띄우기만 한다.** 콘텐츠를 두 군데 따로 쓰지 않는다 — 가이드 페이지든 모달이든 같은 글감 파일 하나를 그대로 읽어서 보여주는 구조로 만든다(§ 5에서 방식 확정).
- 대상 화면: 홈 / 쿠폰 / 이벤트 / 공지 / 퀴즈 / 히스토리 모드(레전드 재료) / 레전드 재료 평점표 / 마일리지 / 선수 백과사전 / 스킬 백과사전 / 확률 공시. 11개 화면 중 지금 살아있는 기능만 다룬다.
- 퀴즈는 현재 어드민 화면만 있고 이용자가 실제로 푸는 화면은 아직 없다. 이번 가이드는 글만 먼저 준비해두고, 화면 안 도움말 연결은 퀴즈 화면이 열릴 때 같이 한다 — 아래 목록에 포함은 시키되 이 제약을 표시해둔다.

---

## 2. 가이드 12편 목록

| # | 제목 | 주소(slug) | 시드 출처 | 분량 목표 |
|---|---|---|---|---|
| 1 | 처음 오셨다면 — 컴프야펀 5분 사용법 | `start` | 신규 작성(전체 화면 요약, 각 가이드로 링크) | 1,200자+ |
| 2 | 선수 백과사전 완전정복 | `player-encyclopedia` | `GuideView.jsx`, `TableHelpModal.jsx` | 1,600자+ |
| 3 | 레전드 재료 평점표 읽는 법 | `legend-stats-guide` | `LegendStatsScreen.jsx` 도움말 2종(평점/배지) | 1,400자+ |
| 4 | 마일리지로 카드 저격하는 법 | `mileage-sniping` | `TargetListTab.jsx` 도움말 카드 | 1,300자+ |
| 5 | 히스토리 모드 레전드 재료, 언제 어디서 얻나 | `history-legend-guide` | `HistoryLegendScreen.jsx` 하단 안내문 | 1,400자+ |
| 6 | 스킬 백과사전 등급표 보는 법 | `player-skills-guide` | `PlayerSkillScreen.jsx` 등급 필터·"등급 도움말" | 1,200자+ |
| 7 | 확률형 아이템 공시, 어디를 봐야 하나 | `probability-guide` | `OddsNote.jsx` 안내 블록 + 공시 페이지 구조 | 1,100자+ |
| 8 | 쿠폰 코드 등록부터 유효기간 체크까지 | `coupon-guide` | 신규 작성 | 1,200자+ |
| 9 | 이벤트 참여 전 확인할 것들 | `event-guide` | 신규 작성 | 1,100자+ |
| 10 | 공지사항, 놓치지 않고 챙겨보는 법 | `notice-guide` | 신규 작성 | 1,000자+ |
| 11 | 레전드 재료 수급 우선순위 짜는 법 | `legend-material-priority` | 3·4·5번 가이드 데이터 재조합(자체 분석) | 1,500자+ |
| 12 | 홈 화면 200% 활용법 | `home-guide` | 신규 작성(홈에 모인 정보 안내) | 1,000자+ |

- 11번은 게임사 재게재가 아니라 **평점표·마일리지·히스토리 모드 세 데이터를 엮어 우리가 만든 우선순위 로직**이라 "가치 없는 콘텐츠" 지적에 가장 세게 반박할 수 있는 글. 우선순위 1위로 둔다.
- 시드가 있는 2~7번은 실제 화면 도움말 문구를 뼈대로 살을 붙이는 방식이라 제작 난이도가 낮다 — 다음 우선순위.
- 신규 작성(1·8·9·10·12)은 게임 데이터가 아니라 "사이트 사용법" 위주라 자체 글로 인정받기 쉽지만, 분량 채우려면 스크린샷/단계 설명을 아끼지 않아야 한다.

---

## 3. 편별 목차 · 참조 데이터

### 1. `start` — 처음 오셨다면
- h2: 컴프야펀이 뭐 하는 곳인가 / 로그인 없이 볼 수 있는 것 / 로그인하면 더 되는 것 / 화면별 한 줄 요약(11개 화면 링크)
- 참조: 없음(안내형). 각 화면 라우트로 내부 링크.

### 2. `player-encyclopedia` — 선수 백과사전 완전정복
- h2: 이름으로 찾기 / 카드형 · 리스트형 차이 / 필터로 좁히기 / L마크(레전드 재료) 뜻 / 최고 등급 보기 / 리스트형 표 약어 정리
- 참조: `GET /api/player-cards`, `GET /api/player-skills`(연결 언급), 화면 `PlayerEncyclopediaScreen.jsx`

### 3. `legend-stats-guide` — 레전드 재료 평점표 읽는 법
- h2: 평점은 게임 수치가 아니다(출처 표기) / OVR·스탯은 게임 그대로 / 재료카드 배지(마/히) 뜻 / 정렬·필터 쓰는 법
- 참조: `LegendStatsScreen.jsx`의 `RATING_SOURCE`, `BADGE_GUIDE` 데이터, `/legend-stats` 화면

### 4. `mileage-sniping` — 마일리지로 카드 저격하는 법
- h2: 저격이란 무엇인가 / 재료 검색 vs 레전드 검색 / 포지션 칩으로 좁히기 / 선수를 클릭하면 벌어지는 일(시뮬레이션 이동)
- 참조: `TargetListTab.jsx`, `/mileage` 화면, `mileageTargetList.js` 설정

### 5. `history-legend-guide` — 히스토리 모드 레전드 재료, 언제 어디서 얻나
- h2: 라운드 보기 vs 레전드 보기 / 주차·일차 필터 / 재료 → 레전드 매칭 표 읽는 법 / 여러 라운드에서 얻는 카드 주의점
- 참조: `HistoryLegendScreen.jsx`, `/history-mode/legend` 화면

### 6. `player-skills-guide` — 스킬 백과사전 등급표 보는 법
- h2: 등급(E~S+)이 뜻하는 것 / 타자·투수 카테고리 구분 / 표시 등급이 자동으로 바뀌는 이유 / 자주 헷갈리는 스킬 조합 예시
- 참조: `PlayerSkillScreen.jsx`, `skillsUtils.js`(GRADES, TIER_FILTERS), `/skills` 화면
- 비고: 화면의 "등급 도움말" 칩은 현재 클릭이 연결 안 된 상태 — 이번에 modal 연결까지 같이 하면 도움말 버튼이 실제로 동작하게 됨(구현 단계 과제로 별도 기록 필요).

### 7. `probability-guide` — 확률형 아이템 공시, 어디를 봐야 하나
- h2: 공시가 왜 있는가(법적 의무) / 목록에서 섹션 찾는 법 / 표에 없는 항목은 어디서 보나(외부 링크) / 공시 갱신 주기
- 참조: `OddsNote.jsx`, `OddsSectionScreen.jsx`, `/probability` 화면

### 8. `coupon-guide` — 쿠폰 코드 등록부터 유효기간 체크까지
- h2: 쿠폰 코드는 어디서 입력하나(게임 내 경로 안내) / 진행 중 vs 종료 쿠폰 구분법 / 자주 하는 실수(대소문자·공백) / 새 쿠폰 알림 받는 법
- 참조: `/coupons` 화면, 쿠폰 도메인 데이터 구조

### 9. `event-guide` — 이벤트 참여 전 확인할 것들
- h2: 이벤트 기간·조건 확인하는 법 / 참여형 vs 자동지급형 구분 / 놓친 이벤트 다시 확인하기
- 참조: `/events` 화면

### 10. `notice-guide` — 공지사항, 놓치지 않고 챙겨보는 법
- h2: 공지 카테고리 구분(점검/업데이트/이벤트) / 중요 공지 놓치지 않는 법 / 지난 공지 검색하기
- 참조: `/notices`, `/notice/:slug` 화면

### 11. `legend-material-priority` — 레전드 재료 수급 우선순위 짜는 법
- h2: 평점 높은 레전드부터? 재료 구하기 쉬운 레전드부터? / 마일리지로 바로 되는 재료 vs 히스토리 모드 전용 재료 / 여러 라운드에서 나오는 재료는 나중에 / 예시로 3단계 우선순위 짜보기
- 참조: 3·4·5번 가이드가 참조하는 세 화면 데이터를 조합(신규 분석)

### 12. `home-guide` — 홈 화면 200% 활용법
- h2: 홈에 모이는 정보들(공지·이벤트·쿠폰 요약) / 빠른 이동 메뉴 활용 / 자주 보는 화면 즐겨찾기 팁
- 참조: `/` 화면, `home` 도메인 구성

---

## 4. 기존 화면 도움말 → 가이드 승격 매핑

| 화면 파일 | 기존 문구 위치 | 승격 대상 가이드 | 처리 방식 |
|---|---|---|---|
| `web/src/domains/players/mobile/components/guideView/GuideView.jsx` | 진입 시 전체화면 안내(검색·카드/리스트·필터·L마크·최고등급 5개 항목) | `player-encyclopedia` | 지금처럼 화면엔 요약만 남기고, 전체 설명은 가이드 페이지로 옮긴 뒤 화면 도움말 버튼이 그 가이드를 모달로 띄우게 바꾼다 |
| `web/src/domains/players/mobile/components/tableHelpModal/TableHelpModal.jsx` | 리스트형 표 열 약어 + 사용법 | `player-encyclopedia` (하위 섹션) | 모달 내용 자체를 가이드 콘텐츠 파일에서 가져오는 방식으로 교체 |
| `web/src/domains/legendStats/mobile/LegendStatsScreen.jsx` (helpOpen `'rating'`) | 평점 출처(원작자 표기) 안내 | `legend-stats-guide` | 그대로 승격, 원문 링크 유지 |
| 〃 (helpOpen `'badge'`) | 재료카드 배지(마/히) 설명 | `legend-stats-guide` (하위 섹션) | 배지 목록(`BADGE_GUIDE`) 그대로 승격 |
| `web/src/domains/mileage/mobile/components/targetListTab/TargetListTab.jsx` | "저격 선수 리스트" 도움말 카드 | `mileage-sniping` | 그대로 승격 |
| `web/src/domains/historyLegend/mobile/HistoryLegendScreen.jsx` | 하단 안내문 2줄(검색 팁, 진행 상황) | `history-legend-guide` | 화면엔 짧은 문구 유지, 상세 설명은 가이드로 이동 |
| `web/src/domains/playerSkills/mobile/PlayerSkillScreen.jsx` | "등급 도움말" 칩(현재 미동작) | `player-skills-guide` | 이번 기회에 클릭 → 모달 연결까지 구현 |
| `web/src/domains/odds/mobile/components/oddsNote/OddsNote.jsx` | note/link 블록 렌더 구조 | `probability-guide` | 콘텐츠보다 "화면 블록 재사용 패턴" 참고용 — 동일 렌더 방식을 가이드 모달에도 적용 |
| coupons / events / notices / home | 없음 | 8·9·10·12번 | 시드 없이 신규 작성 |

---

## 5. IA 및 SEO 초안

- 라우트: `/guides`(목록) + `/guides/:slug`(상세). 기존 `notices`/`notice/:slug` 라우팅·lazy·store 패턴 그대로 사용.
- 드로어 메뉴(`MENU_GROUPS.js`)에 "가이드" 항목 추가, `loginRequired` 없음(비로그인 열람 허용).
- `routeSeo.js` 추가안:
  - `/guides`: "컴프야펀이 직접 정리한 공략·활용 가이드 12편을 모아봅니다."
  - `/guides/:slug`: 편별 SEO description은 콘텐츠 파일의 `seo.description` 필드를 그대로 사용(가이드마다 다른 문구 필요).
- `sitemap.xml`: `/guides` 1건 + `/guides/{slug}` 12건, `changefreq: monthly`, `priority: 0.6` 권장(공지/쿠폰보다는 낮고 정책 페이지보다는 높게).
- `prerender.mjs` 대상에 `/guides`와 12개 상세 경로 모두 포함 — 가이드는 "본문이 있다"는 것 자체가 목적이라 프리렌더 누락 시 의미가 없다.

---

## 6. 콘텐츠 저장 방식 권고

**1순위 기준: 가이드 페이지와 화면 도움말 모달이 반드시 같은 글감을 재사용해야 한다.**

| 방식 | 장점 | 단점 |
|---|---|---|
| 정적 마크다운 파일 + 런타임 파서 | 글 쓰기가 편하다(마크다운 문법) | 파서 라이브러리 추가 필요, 모달 안에서 마크다운을 다시 자르거나 요약하려면 별도 가공이 필요해 재사용이 깔끔하지 않음 |
| 구조화된 JS 데이터 + 공용 렌더러 컴포넌트 | 지금 `GuideView.jsx`·`TableHelpModal.jsx`가 이미 쓰는 방식과 동일해 컨벤션이 일관됨, 페이지와 모달이 완전히 같은 컴포넌트로 렌더 가능, 별도 파서 없이 그냥 JS라 빌드 시 프리렌더에도 그대로 텍스트로 구워짐 | 마크다운보다 파일을 쓸 때 문법이 조금 더 번거로움(중첩 객체) |
| 서버 DB 적재(백엔드 API 신설) | 어드민에서 코드 배포 없이 수정 가능 | 이번 목적엔 과함 — CMS성 CRUD·인증 화면을 새로 만들어야 하고, 빌드 시점에 내용이 고정되지 않아 프리렌더 타이밍이 꼬일 위험이 큼 |

**권고: 구조화된 JS 데이터 + 공용 렌더러.**
- `web/src/domains/guides/content/{slug}.js` 파일마다 `{ title, slug, seo: { title, description }, sections: [{ heading, body }] }` 형태로 한 편씩 작성.
- 공용 컴포넌트 하나(`GuideContent.jsx`)가 이 데이터를 받아 그대로 렌더 — `/guides/:slug` 페이지는 전체 화면에 이 컴포넌트를 넣고, 각 도메인 화면의 도움말 버튼은 같은 컴포넌트를 모달 껍데기(`TableHelpModal.jsx`류 오버레이) 안에 넣어서 띄운다.
- 이렇게 하면 글감은 한 파일에만 있고, 페이지·모달은 "누가 감싸느냐"만 다르다 — 콘텐츠 중복 유지 문제가 생기지 않는다.

---

## 7. 남은 결정 사항

- 퀴즈 공개 화면이 아직 없어 `퀴즈` 가이드는 글만 먼저 쓰고 화면 연동은 보류 — 문제되지 않으면 이대로 진행.
- 편당 담당(직접 집필 vs 자동 초안 후 검수)은 미정 — 사용자 결정 필요.
