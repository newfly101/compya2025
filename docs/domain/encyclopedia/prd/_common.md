# [폐기] encyclopedia 도메인 공통 정책 (`_common.md`)

> ⚠️ **이 파일은 폐기되었습니다.** 2026-05-31 R2 진입 시 사용자 결정 Q4 로 도메인 키 `encyclopedia` → `wiki` 재명명.
> **신 경로**: [`docs/domain/wiki/prd/_common.md`](../../wiki/prd/_common.md)
> **물리 삭제 예정**: R4 (사용자 승인 후 메인 어시스턴트 트랙)
>
> ---
>
> 구현 history: 2026-05-31 R1 신규 작성 (planner-division Opus, prefix=ENC) — R2 에서 폐기

## 0. 도메인 정의

| 항목 | 값 | 출처 / 사유 |
|---|---|---|
| 도메인 키 | `encyclopedia` | `web/src/domains/home/config/QUICK_MENUS.js:6` 에 `to: "/encyclopedia"` 사전 박힘 — 사용자 명명 "추천 백과사전" 과 1:1 매핑 |
| 한글 표기 | 추천 백과사전 | 사용자 원문 / Figma entry 페이지 라벨 일치 |
| 운영 상태 | 신규 — 코드 부재. home QuickMenu 만 `comingSoon: true` | `QuickSection.jsx:10` 주석 — `dictionary` 폐기 후 신 도메인으로 분리 |
| 권한 모델 | B2C 단일 — public (비로그인 OK) | CLAUDE.md / `feedback B2C 단일 권한 모델` 메모리 |
| 책임 (FE) | 카탈로그 viewer + 추천 조합 viewer + 기본 게임 정보 페이지 (정보 소비 전용 — write X) | 사용자 요구사항 |
| 책임 (BE) | 기존 `domain/skill/*` 재사용 + 신규 endpoint 0~소량 | 자산 재활용 (재발명 금지) |
| 책임 (DB) | 기존 `player_skills`, `skill_score_config`, `skill_pitcher_grade_stat` 재사용. 신규 테이블 ❓ R1 끝 결정 마커 | 🔴 DB 신규 = HITL |

## 1. legacy 와의 관계 (절단선 확정)

| legacy 자산 | 본 도메인 처리 |
|---|---|
| `docs/domain/legacy/dictionary.md` | 참고용 (Owner 결정 #4 — A/B/C 미정). 본 도메인은 dictionary 와 **별도 신규** — `/encyclopedia` 라우트 사용 |
| `web/src/domains/dictionary/**` (이미 통째 삭제됨, `prd-fe-map § 2026-05-09`) | 폐기 — 본 도메인 신규 작성에서 코드 재사용 X (디자인 PC 기준이라 제외) |
| `BE domain/skill/*` (살아있음) | 재사용 — `/api/skills/{target}`, `/api/skills/score-config`, `/api/skills/coach` |
| `web/src/data/skill/*` (legacy mock, 7 파일) | **선택적 재활용** — 추천 조합 / 시너지 / 포지션 점수 룰은 정보값이 풍부하므로 첫 PoC 에서 정적 import 검토 (R2 결정) |

## 2. 카테고리 트리 (IA 1뎁스)

| # | 카테고리 | 상태 | feature 단위 | 비고 |
|---|---|---|---|---|
| 1 | 투수 스킬 백과사전 | 실구현 (R2/R3) | `ENC-1` 계열 | `/api/skills/PITCHER` 활용 |
| 2 | 타자 스킬 백과사전 | 실구현 (R2/R3) | `ENC-2` 계열 | `/api/skills/HITTER` 활용 |
| 3 | 추천 조합 (투수) | 실구현 (R2/R3) | `ENC-3` 계열 | mock data + score-config 활용. 데이터 소스 결정 마커 |
| 4 | 추천 조합 (타자) | 실구현 (R2/R3) | `ENC-4` 계열 | 사용자 요구는 투수 우선이나 mock 데이터 (HITTER_RECOMMEND) 존재 → 함께 처리 |
| 5 | 기본 게임 정보 (투수) | 실구현 (R2/R3) | `ENC-5` 계열 | 마구 / 구종 등급 / 스탯 영향 — 자료 출처 결정 마커 |
| 6 | 기본 게임 정보 (타자) | 실구현 (R2/R3) | `ENC-6` 계열 | 스윙·타격 메커니즘 |
| 7 | 코치 | **보류** (IA 자리만) | — | `/api/skills/coach` BE 살아있음 → 향후 1순위 |
| 8 | 구단 선수 | **보류** (IA 자리만) | — | DB 부재. 게임사 API/시드 결정 필요 |
| 9 | 에픽 | **보류** (IA 자리만) | — | 정보 출처 미정 |

> 보류 3건은 `{feature}.md § 1.3 보류 카테고리` 에 IA 자리만 명시. feature-spec X.

## 3. 진입점 / 라우트 정책

| 항목 | 값 | 사유 |
|---|---|---|
| route base | `/encyclopedia` | home QuickMenu 사전 박힘 (변경 X) |
| route 등록 | `web/src/app/router/routes/PublicRoutes.jsx` (lazy import, comingSoon 해제) | `dictionary` 와 동일 패턴 (legacy/dictionary.md § A.2 참조) |
| TopBar variant | `default` (back 버튼 표시) 🟨 가정 — Figma entry 페이지 헤더 확인 후 확정 | mobile-frame.md 의 표준 패턴 |
| 진입 권한 | public (비로그인 OK) | B2C 단일 권한 모델 |
| 자체 도메인 헤더 | **만들지 않음** — 글로벌 MobileLayout TopBar 통일 | `feedback_no_domain_header.md` 메모리 |

## 4. URL 구조 (제안)

| 경로 | 화면 | 코멘트 |
|---|---|---|
| `/encyclopedia` | 카테고리 entry (9 카테고리 그리드 — 보류 3건은 disabled) | Figma `node-id=83-2259` 기준 |
| `/encyclopedia/skill/pitcher` | 투수 스킬 list | Figma `83-2303` |
| `/encyclopedia/skill/hitter` | 타자 스킬 list | Figma `83-2500` 추정 (R2 검증) |
| `/encyclopedia/skill/:target/:skillCode` | 스킬 상세 (선택사항) | ❓ 미정 — R2 결정 (모달 vs 상세 페이지) |
| `/encyclopedia/recommend/pitcher` | 추천 조합 (투수) | Figma `86-3236` |
| `/encyclopedia/recommend/hitter` | 추천 조합 (타자) | — |
| `/encyclopedia/game-info/pitcher` | 기본 게임 정보 (투수) — 마구·구종 등급·스탯 영향 | 사용자 신규 요구 — 출처 결정 마커 |
| `/encyclopedia/game-info/hitter` | 기본 게임 정보 (타자) | — |

> deep-link / SEO: B2C 정보성 콘텐츠 → 공개 검색 노출 OK. robots / sitemap 정책은 ops 트랙 위임.

## 5. 의존 매트릭스

### FE → 글로벌

| 의존 | 종류 | 사용처 |
|---|---|---|
| `MobileLayout` | layout wrapper | 라우터 wrapper (자동) |
| `useSetTopBar` | hook | 모든 화면에서 variant/title 설정 |
| `SectionBlock` / `SectionHeader` | UI | 카테고리/스킬 list 그루핑 |
| `LabelBadge` | UI | 스킬 grade 표시 (LEGEND / PLATINUM / HERO / NORMAL) |
| **신규 (제안)** `EncyclopediaSkillCard` | 도메인 컴포넌트 | 카드 형태 — 단일 페이지 변형 → sub컴포넌트 분리 룰 (`feedback_component_decomposition.md`) 만족 (반복 + 외부재사용 X 시 동일 페이지 안에 inline) |

### FE → BE

| 화면 | 호출 endpoint | 메서드 | 캐시 | 비고 |
|---|---|---|---|---|
| 투수/타자 스킬 list | `/api/skills/{PITCHER,HITTER}` | GET | BE `@Cacheable("playerSkillSetByTarget")` | grade 4분류 (LEGEND/PLATINUM/HERO/NORMAL) 그대로 사용 |
| 추천 조합 (투수/타자) | `/api/skills/score-config` + (선택) 신규 `/api/encyclopedia/recommend/{target}` | GET | BE `@Cacheable("skillScoreConfig")` | 데이터 소스 결정 마커 (R2 결정) |
| 기본 게임 정보 | 자료 출처 결정 마커 | — | — | 정적 markdown / DB / 시드 sql 중 결정 |
| 코치 (보류) | `/api/skills/coach` | GET | BE `@Cacheable("coachSkills")` | 향후 사용 |

### FE → store

- **store 신규 등록 — 보류**. legacy dictionary store 등록 → 번들 사이즈 영향 (`legacy/dictionary.md § A.6`). 본 도메인은 **react-query / SWR / 페이지 로컬 fetch** 우선 검토 — store 도입 결정은 R2.

## 6. 공통 표시 룰 (UX 토큰)

| 항목 | 값 | 출처 |
|---|---|---|
| 스킬 grade 표시 색 | LEGEND=레전드(보라), PLATINUM=플레티넘, HERO=히어로, NORMAL=노말 | `Grade.java` enum + 기존 legendPlayer 시드 패턴 |
| 정렬 default | grade 내림차순 → id 오름차순 | `PlayerSkills.xml selectSkillsByTarget`: `ORDER BY grade, id` (BE 가 결정) |
| 빈 결과 처리 | "표시할 스킬이 없습니다" placeholder | 화면 일관 룰 (home/coupons 동일 패턴) |
| skip / pagination | **불필요** — 스킬 총량 < 100 (시드 기반 추정) | runtime 측정 후 재검토 |

## 7. 화면 인덱스 (R3 종료 시 업데이트)

| ID | 화면 | feature 매핑 | 상세 위치 |
|---|---|---|---|
| (R3 작성) | (R3 작성) | (R3 작성) | (R3 작성) |

## 8. 미해결 / 가정 / 위험 집계 (R1 기준)

| 마커 | 항목 | 결정 위치 |
|---|---|---|
| 🔴 DB 신규 | "기본 게임 정보" 자료 출처가 신규 DB 테이블 필요한지 (예: `game_pitch_info`, `game_pitch_grade_stat` 등) | R1 종료 시 사용자 결정 |
| 🔴 권한 | public 가정 — 비회원에게도 추천 조합 전체 노출 OK 인지 | R1 종료 시 사용자 결정 |
| 🟨 가정 | feature prefix=`ENC` 채택 (충돌 0 — `docs/domain/` grep 결과 신 prefix 없음) | R1 종료 시 사용자 confirm |
| 🟨 가정 | TopBar variant=default, 자체 헤더 X | R2 시 Figma 검증 |
| 🟨 가정 | 추천 조합 데이터 소스 = mock data (`web/src/data/skill/*`) 정적 import → 점진적 BE 이관 | R2 결정 |
| ❓ 미정 | 스킬 상세 (모달 vs 페이지) | R2 결정 |
| ❓ 미정 | admin 등록/수정 화면 필요 여부 | R2 종료 시 사용자 결정 |
| ❓ 미정 | store 등록 vs react-query vs 페이지 로컬 fetch | R2 결정 |
