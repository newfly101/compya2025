# wiki 도메인 공통 정책 (`_common.md`)

> 구현 history:
> - 2026-05-31 R1 신규 작성 (planner-division Opus, prefix=ENC) — 도메인 키 `encyclopedia` 가정
> - 2026-05-31 R2 진입 — 사용자 결정 Q1=C(DB+admin), Q2=OK(public), Q3=ENC confirm, Q4=`wiki` 채택. 구 경로 `docs/domain/encyclopedia/prd/` 폐기 마커 + 신 경로 `docs/domain/wiki/prd/` 이관
> - 2026-05-31 R3 진입 — 사용자 결정 Q5=admin CRUD 본 사이클 포함, Q6=시드 사용자 작성. 예외/QA/갱신정책 + `_tasks.md` 6 dispatch brief 작성. 화면 인덱스에 admin ENC-A0~A3 추가
>
> ⚠️ 도메인 키 변경 = **`encyclopedia` → `wiki`**. prefix `ENC` 는 보존 (사용자 confirm). FE 코드 (`QUICK_MENUS.js`, `MENU_GROUPS.js`) 의 `/encyclopedia` URL → `/wiki` 변경은 develop 트랙 작업 (R3 dispatch brief 에 포함).

## 0. 도메인 정의

| 항목 | 값 | 출처 / 사유 |
|---|---|---|
| 도메인 키 | `wiki` | 사용자 R1 종료 결정 Q4 |
| 한글 표기 | 추천 백과사전 (UX 라벨 유지) | 사용자 원문 / home QuickMenu 라벨 유지 |
| URL base | `/wiki` (코드 변경 예정 — 현재 `/encyclopedia`) | develop 트랙 변경 마커 |
| 운영 상태 | 신규 — 코드 부재. home QuickMenu / Drawer `/encyclopedia` entry 만 `comingSoon: true` | `QUICK_MENUS.js:6`, `MENU_GROUPS.js:15` |
| 권한 모델 | B2C 단일 — public (Q2 confirm) | CLAUDE.md / B2C 단일 권한 메모리 |
| 책임 (FE) | 카탈로그 viewer + 추천 조합 viewer + 기본 게임 정보 (DB 백킹) viewer | 사용자 요구사항 |
| 책임 (BE) | 기존 `domain/skill/*` 재사용 + **신규 `domain/wiki/*` 신설 (game-info)** | Q1=C 결정 (DB+admin) |
| 책임 (DB) | 기존 `player_skills`, `skill_score_config`, `skill_pitcher_grade_stat` 재사용 + **신규 `wiki_game_info_*` 테이블 (Q1=C)** | 🔴 DB 신규 확정 — 사용자 결정 완료 |

## 1. legacy 와의 관계 (절단선 확정)

| legacy 자산 | 본 도메인 처리 |
|---|---|
| `docs/domain/legacy/dictionary.md` | 참고용 (Owner 결정 #4 미정). 본 도메인은 dictionary 와 **별도 신규** — `/wiki` 사용 (`/dictionary` 와 분리) |
| `web/src/domains/dictionary/**` (이미 통째 삭제) | 폐기 — 코드 재사용 X |
| `BE domain/skill/*` (살아있음) | 재사용 — `/api/skills/{target}`, `/api/skills/score-config`, `/api/skills/coach` |
| `web/src/data/skill/*` (legacy mock 7 파일) | 추천 조합 / 시너지 / 포지션 점수 PoC 정적 import (1차) → BE 이관은 추후 |
| `docs/domain/encyclopedia/prd/*` (R1 산출 3 파일) | **폐기** — 신 경로 `docs/domain/wiki/prd/` 로 이관. 구 파일은 redirect 마커만 보존 (메인 어시스턴트가 R4 에서 물리 삭제) |

## 2. 카테고리 트리 (IA 1뎁스)

| # | 카테고리 | 상태 | feature 단위 | 데이터 소스 (R2 확정) |
|---|---|---|---|---|
| 1 | 투수 스킬 백과사전 | 실구현 | `ENC-1` 계열 | BE `/api/skills/PITCHER` (기존) |
| 2 | 타자 스킬 백과사전 | 실구현 | `ENC-2` 계열 | BE `/api/skills/HITTER` (기존) |
| 3 | 추천 조합 (투수) | 실구현 | `ENC-3` 계열 | **1차 FE mock** (`PITCHER_RECOMMEND.js` + `pitcherSkillMeta.js` + `pitcherPositionScore.js` + `pitcherComboPresets.js`) |
| 4 | 추천 조합 (타자) | 실구현 | `ENC-4` 계열 | **1차 FE mock** (`HITTER_RECOMMEND.js` + `HITTER_POINTS.js`) |
| 5 | 기본 게임 정보 (투수) | 실구현 | `ENC-5` 계열 | **신규 BE `/api/wiki/game-info/PITCHER`** (신규 DB 테이블 — Q1=C) |
| 6 | 기본 게임 정보 (타자) | 실구현 | `ENC-6` 계열 | **신규 BE `/api/wiki/game-info/HITTER`** |
| 7 | 코치 (보류) | IA 자리만 | — | `/api/skills/coach` 살아있음 |
| 8 | 구단 선수 (보류) | IA 자리만 | — | DB 부재 |
| 9 | 에픽 (보류) | IA 자리만 | — | 정보 출처 미정 |

## 3. 진입점 / 라우트 정책

| 항목 | 값 | 사유 |
|---|---|---|
| route base | `/wiki` (목표) — 현재 코드 `/encyclopedia` | Q4 결정 — develop 트랙 변경 |
| route 등록 | `web/src/app/router/routes/PublicRoutes.jsx` lazy import 신규 등록 | dictionary 패턴 답습 |
| TopBar variant | `default` (back 버튼) | Figma entry 확인 후 R3 확정 |
| 진입 권한 | public (Q2 confirm — 비로그인 OK) | B2C |
| 자체 도메인 헤더 | **만들지 않음** — MobileLayout TopBar 통일 | `feedback_no_domain_header.md` |

## 4. URL 구조 (확정)

| 경로 | 화면 | feature | 컴포넌트 (제안) |
|---|---|---|---|
| `/wiki` | 카테고리 entry (9칸 그리드, 보류 3건 disabled) | ENC-0 | `WikiScreen` |
| `/wiki/skill/pitcher` | 투수 스킬 list | ENC-1 | `WikiSkillScreen` (target prop) |
| `/wiki/skill/hitter` | 타자 스킬 list | ENC-2 | `WikiSkillScreen` (target prop) |
| `/wiki/recommend/pitcher` | 추천 조합 (투수) | ENC-3 | `WikiRecommendScreen` (target prop) |
| `/wiki/recommend/hitter` | 추천 조합 (타자) | ENC-4 | `WikiRecommendScreen` (target prop) |
| `/wiki/game-info/pitcher` | 기본 게임 정보 (투수) | ENC-5 | `WikiGameInfoScreen` (target prop) |
| `/wiki/game-info/hitter` | 기본 게임 정보 (타자) | ENC-6 | `WikiGameInfoScreen` (target prop) |

> 스킬 상세 = **모달 우선** (R1 가정 Q5 채택). depth 1 절약 + back 동선 단순화. 별도 URL X.
> 5 screen 으로 압축 — 컴포넌트 분리 룰 (`feedback_component_decomposition.md`) 정합: target prop 분기로 충분, 별도 screen X.

## 5. 의존 매트릭스

### FE → 글로벌

| 의존 | 종류 | 사용처 |
|---|---|---|
| `MobileLayout` | layout wrapper | 라우터 wrapper (자동) |
| `useSetTopBar` | hook | 모든 화면 |
| `SectionBlock` / `SectionHeader` | UI | 스킬 grade 그루핑 / 추천 tier 그루핑 |
| `LabelBadge` | UI | grade 표시 |
| `RenewalNoticeModal` | UI | 보류 카테고리 클릭 시 (home/Drawer 패턴 답습) |
| **신규** `WikiSkillModal` | 도메인 컴포넌트 | 스킬 상세 모달 (페이지 inline 정의 — 외부재사용 X) |
| **신규** `WikiCategoryGrid` | 도메인 컴포넌트 | entry 그리드 (9칸) — 단일 페이지 변형 X → inline OK |

### FE → BE

| 화면 (feature) | endpoint | METHOD | 캐시 (BE) | 신규/기존 |
|---|---|---|---|---|
| ENC-1 / ENC-2 (스킬 list) | `/api/skills/{target}` | GET | `@Cacheable("playerSkillSetByTarget")` | 기존 |
| ENC-3 / ENC-4 (추천 조합) | (1차) BE 호출 없음 — FE mock 정적 import + `/api/skills/score-config` 보조 | GET | `@Cacheable("skillScoreConfig")` | 기존 (보조) |
| ENC-5 / ENC-6 (게임 정보) | `/api/wiki/game-info/{target}` | GET | **신규** `@Cacheable("wikiGameInfoByTarget")` 권장 | **신규** |
| ENC-7 (코치 — 보류) | `/api/skills/coach` | GET | `@Cacheable("coachSkills")` | 기존 (현재 FE 미연결) |
| admin pitches | `/api/admin/wiki/pitches` (POST/PUT/DELETE) | — | hasRole('ADMIN') | **본 사이클 포함** (R3 Q5) |
| admin pitch-grades | `/api/admin/wiki/pitch-grades` (POST/PUT/DELETE) | — | hasRole('ADMIN') | 동상 |
| admin stat-influences | `/api/admin/wiki/stat-influences` (POST/PUT/DELETE) | — | hasRole('ADMIN') | 동상 |
| admin viewer | `/api/admin/wiki/game-info/{target}` (GET) | — | hasRole('ADMIN') | is_active=false 도 포함 |

### FE 데이터 캐싱

| 결정 | 값 | 사유 |
|---|---|---|
| store 등록 | **X** (가정 유지) | dictionary 번들 영향 회피 |
| 1차 fetch | **react-query** (페이지 진입 시 useQuery, `staleTime: 10min`) | 캐시 자연 활용 |
| 정적 mock | 페이지 lazy chunk 안에 정적 import | tree-shake 친화 |

## 6. 공통 표시 룰 (UX 토큰)

| 항목 | 값 | 출처 |
|---|---|---|
| 스킬 grade 정렬 | LEGEND → EPIC → PLATINUM → HERO → NORMAL | `Grade.java` enum 순서 |
| ⚠️ EPIC 노출 | **BE `SkillSetResponse` 가 4 grade 만 노출 (legend/platinum/hero/normal)** — EPIC 누락. R3 dispatch brief 에 BE 보강 마커 | `SkillSetResponse.java:5-10` (Grade 5종 vs 4 필드) |
| grade 표시 색 | 토큰 시스템 (`web/src/global/styles/**`) — R3 designer 검증 | — |
| 정렬 default (BE) | `ORDER BY grade, id` | `PlayerSkills.xml:10` |
| 빈 결과 | "표시할 스킬이 없습니다" placeholder | 일관 패턴 |
| pagination | 불필요 (총량 < 100) | — |

## 7. 화면 인덱스 (R3 종료 시 업데이트)

| feature ID | 화면 컴포넌트 | URL | 상세 위치 |
|---|---|---|---|
| ENC-0 | `WikiScreen` (entry) | `/wiki` | `wiki.md § 4.0` |
| ENC-1 | `WikiSkillScreen` (PITCHER) | `/wiki/skill/pitcher` | `wiki.md § 4.1` |
| ENC-2 | `WikiSkillScreen` (HITTER) | `/wiki/skill/hitter` | `wiki.md § 4.2` |
| ENC-1-2 / ENC-2-2 | `WikiSkillModal` (스킬 상세) | (모달) | `wiki.md § 4.1.2` |
| ENC-3 | `WikiRecommendScreen` (PITCHER) | `/wiki/recommend/pitcher` | `wiki.md § 4.3` |
| ENC-4 | `WikiRecommendScreen` (HITTER) | `/wiki/recommend/hitter` | `wiki.md § 4.4` |
| ENC-5 | `WikiGameInfoScreen` (PITCHER) | `/wiki/game-info/pitcher` | `wiki.md § 4.5` |
| ENC-6 | `WikiGameInfoScreen` (HITTER) | `/wiki/game-info/hitter` | `wiki.md § 4.6` |
| ENC-A0 | `AdminWikiScreen` (admin entry) | `/admin/wiki` | `wiki.md § 5.2.3` |
| ENC-A1 | `AdminWikiPitchScreen` | `/admin/wiki/pitches` | `wiki.md § 5.2.3` |
| ENC-A2 | `AdminWikiPitchGradeScreen` | `/admin/wiki/pitch-grades` | `wiki.md § 5.2.3` |
| ENC-A3 | `AdminWikiStatInfluenceScreen` | `/admin/wiki/stat-influences` | `wiki.md § 5.2.3` |

## 8. 미해결 / 가정 / 위험 집계 (R3 종료 시점)

| 마커 | 항목 | 결정 위치 |
|---|---|---|
| ✅ | game-info admin CRUD = 본 사이클 포함 (R3 Q5) | R3 — confirm 완료 |
| ✅ | 1차 시드 SQL = 사용자 작성 (R3 Q6) | R3 — confirm 완료 |
| 🟨 가정 | BE `SkillSetResponse` EPIC 필드 보강 (legend/epic/platinum/hero/normal 5종) | R3 BE dispatch (T2) |
| 🟨 가정 | URL `/encyclopedia` → `/wiki` 일괄 교체 + `comingSoon` 해제 | R3 FE dispatch (T4) |
| 🟨 가정 | 스킬 상세 = 모달 (depth 1 절약, URL 변경 X) | R3 designer 검증 (T6) |
| 🟨 가정 | TopBar variant=default + 자체 헤더 X | R3 designer (T6) |
| 🟨 가정 | store 등록 X — react-query (staleTime: 스킬 10분 / game-info 30분) | R3 FE (T4) |
| 🟨 가정 | admin Drawer 진입점 = "관리자 페이지" 라벨 (user.role==='ADMIN' 일 때만) | R3 designer / FE (T5) |
| 🟨 가정 | `AdminRoute` 가드 — `useAuthentication().user?.role === 'ADMIN'` 검사 | R3 FE (T5) |
| 🔴 권한 | `useAuthentication.js` 의 `user.role` 필드 확보 — 미존재 시 BE/auth 보강 (별도 사이클 분리 가능) | T5 dispatch 발견 시 마커 + 사용자 결정 |
| 🟨 가정 | `SecurityConfig` `/api/admin/wiki/**` 가 기존 `/api/admin/**` 룰에 자동 포함 — 미포함 시 명시 추가 | R3 BE (T3) |
| ❓ 미정 | 검색/필터 UI 디테일 (input debounce 300ms / 칩 토글 인터랙션) | R3 designer (T6) |
| ❓ 미정 | KPI 목표값 (home→wiki 진입율 10%, 추천 체류 30초) | 사용자 검토 |
| ❓ 미정 | wiki_pitch DELETE 시 자식 grade CASCADE 정책 | R3 BE 결정 (T3 — soft cascade 채택) |
| ❓ 미정 | 낙관적 lock (version 컬럼) — admin 동시 수정 충돌 방지 | 후속 사이클 |
