# [폐기] encyclopedia 결정 로그 (`_decision_log.md`)

> ⚠️ **이 파일은 폐기되었습니다.** 2026-05-31 R2 진입 시 사용자 결정 Q4 로 도메인 키 `encyclopedia` → `wiki` 재명명.
> **신 경로**: [`docs/domain/wiki/prd/_decision_log.md`](../../wiki/prd/_decision_log.md) — R1 로그도 신 파일에 그대로 이관됨.
> **물리 삭제 예정**: R4 (사용자 승인 후 메인 어시스턴트 트랙)
>
> ---
>
> append-only. planner-division Opus 가 라운드 간 누적. 사용자 결정 / agent 가정 / 핸드오프 메모 단일 진실 소스.

---

## R1 (2026-05-31) — IA + 요구사항 + 정책

### 로드된 컨텍스트 (JIT)

- `docs/domain/legacy/dictionary.md` — legacy PC dictionary 와의 절단선
- `docs/domain/home/prd/ia.md` — IA 작성 스타일 reference
- `src/main/java/com/dawne/com2usbaseball/domain/skill/**` — 풀세트 (controller/service/repository/dto/mapper)
- `src/main/resources/mapper/skill/*.xml` — 3 파일
- `sql/CREATE_TABLE.sql` — player_skills / skill_score_config / skill_pitcher_grade_stat / coach / coach_skill_* 테이블 정의
- `sql/insertData/INSERT_SKILL_SCORE_CONFIG.sql` — score-config 시드
- `web/src/data/skill/*` — 7 mock 파일 (PITCHER_RECOMMEND, HITTER_RECOMMEND, HITTER_POINTS, pitcherComboPresets, pitcherPositionScore, pitcherSkillMeta, HITTER_SKILLS)
- `web/src/domains/home/config/QUICK_MENUS.js` — `/encyclopedia` `comingSoon: true` 사전 박힘 확인
- `src/main/java/com/dawne/com2usbaseball/common/enums/site/Target.java` — HITTER/PITCHER

### 핵심 결정 (R1 자체 — agent 가정)

| # | 결정 | 사유 |
|---|---|---|
| D1 | 도메인 키 = `encyclopedia` | home QuickMenu 사전 박힘 + 사용자 가정 일치 |
| D2 | prefix = `ENC` | 기존 prd 디렉토리 grep 결과 신 prefix 없음 (충돌 0) |
| D3 | legacy `dictionary` 와 별도 도메인 — 코드 재사용 X | dictionary 폐기 (PC 디자인 기준) + Owner 결정 #4 미정 |
| D4 | BE 자산 100% 재사용 — `domain/skill/*` 신규 endpoint 최소화 | 재발명 금지 |
| D5 | 활성 6 카테고리 + 보류 3 카테고리 (코치/구단선수/에픽) | 사용자 요구 매핑 |
| D6 | route base = `/encyclopedia`, hierarchy 3뎁스 (`/encyclopedia/skill/pitcher`) | URL 가독성 + 카테고리 그루핑 |
| D7 | 자체 헤더 X — MobileLayout TopBar 통일 | `feedback_no_domain_header.md` 메모리 |
| D8 | store 등록 X — react-query 우선 (가정) | dictionary 번들 영향 회피 |
| D9 | 추천 조합 1차 = FE mock 정적 import | 데이터량 적음 + admin 사이클 보류 |
| D10 | 컴포넌트 분리 = 반복/변형/외부재사용 충족 시만 | `feedback_component_decomposition.md` 메모리 |

### 🔴 사용자 결정 필요 (R1 종료 시점)

| # | 항목 | 가정값 | 영향 |
|---|---|---|---|
| Q1 | "기본 게임 정보 (마구·구종 등급·스탯 영향)" 자료 출처 = (A) FE 정적 markdown / (B) FE 정적 JSON / (C) 신규 DB 테이블 + admin | (B) FE 정적 JSON | (C) 선택 시 R2 에 DB schema + endpoint 추가, admin 사이클 분리 |
| Q2 | public 노출 OK — 추천 조합 / 게임 정보 비로그인 노출 | OK | NG 시 SecurityConfig 신규 분기 필요 |
| Q3 | prefix `ENC` 채택 confirm | confirm | 변경 시 R2 작성 전 재명명 |
| Q4 | 도메인 키 `encyclopedia` 채택 confirm (다른 후보 — `compendium` / `guide` / `wiki`) | confirm | 변경 시 home QuickMenu / 라우트 추적 변경 |

### ❓ R2 진입 시 결정 (가정값 진행 가능)

| # | 항목 | R1 가정값 |
|---|---|---|
| Q5 | 스킬 상세 = 모달 vs 페이지 | 모달 |
| Q6 | admin 사이클 분리 시점 | 본 라운드 외 |
| Q7 | 검색/필터 default | 스킬 = 이름+grade칩 / 추천 = position+tier |
| Q8 | TopBar variant | default (back) |

### 핸드오프 메모 (→ R2)

- R2 진입 시 반드시 로드: 본 파일 + `_common.md` § 0~6 + `encyclopedia.md` § 1~3
- R2 비로드: R1 작성 과정 사고 / 본 핸드오프 메모 위 § (이미 종합됨)
- R2 작성 § : `_common.md` § 7 화면 인덱스 / `encyclopedia.md` § 4 기능 명세 (ENC-1~6 + ENC-0) / § 5 API
- R2 진입 가드: Q1~Q4 답변 수령 후 진입 (사용자 "진행" 명시 시 가정값 확정 + 진행 OK)
- R2 신규 grep 필요:
  - `web/src/app/wrapper/mobile/parts/Drawer.jsx` — Drawer 메뉴 항목 신설 가능 여부
  - `web/src/app/router/routes/PublicRoutes.jsx` — encyclopedia 라우트 등록 현황
  - `web/src/global/ui/mobile/section/SectionBlock.jsx` — grade 그루핑에 적합한지
  - `src/main/java/com/dawne/com2usbaseball/common/enums/site/Grade.java` — 값 확인 (LEGEND/PLATINUM/HERO/NORMAL)

### 자가 점검 (R1)

- [x] 라운드 토큰 70k 이내 (실측 ~35k 수준)
- [x] 다른 산출물 본문 복제 X (링크만 — `_common.md` ↔ `encyclopedia.md`)
- [x] 표 80% 이상 (산문 최소화)
- [x] 결정 사유 한 줄 모두 명시
- [x] 🔴 마커 항목 가정값만 (확정 X — 사용자 결정 대기)
- [x] 본 파일 핸드오프 메모 append
- [x] 누적 토큰 150k 이내 (R1 단독 — OK)
