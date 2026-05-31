# [폐기] encyclopedia (추천 백과사전) 통합 기획

> ⚠️ **이 파일은 폐기되었습니다.** 2026-05-31 R2 진입 시 사용자 결정 Q4 로 도메인 키 `encyclopedia` → `wiki` 재명명.
> **신 경로**: [`docs/domain/wiki/prd/wiki.md`](../../wiki/prd/wiki.md)
> **물리 삭제 예정**: R4 (사용자 승인 후 메인 어시스턴트 트랙)
>
> ---
>
> 구현 history: 2026-05-31 R1 신규 작성 — IA + 요구사항 + 정책 결정 (planner-division Opus, prefix=ENC). R2 에서 폐기.
> 공통 정책: [`_common.md`](./_common.md)
> R2/R3 작성 예정 § (placeholder 만): § 4 기능 명세 / § 5 API / § 6 예외 / § 7 QA / § 8 사용자 확인 잔여

---

## § 1. IA (정보 구조)

### 1.1 도메인 정체성 (요약)

| 항목 | 값 |
|---|---|
| 한글명 | 추천 백과사전 |
| 키 | `encyclopedia` |
| 사용자 가치 | "내 선수의 스킬 3개 조합이 좋은지" + "어떤 스킬을 끼워야 스탯이 오르는지" 의 정보 소비 단일 채널 |
| 운영 상태 | 신규 (home QuickMenu entry 만 코드 존재, `comingSoon: true`) |

### 1.2 활성 카테고리 / 화면 트리

```
/encyclopedia                                  ← 카테고리 entry (그리드 9칸, 보류 3건 disabled)
├── /encyclopedia/skill/pitcher                ← ENC-1 투수 스킬 list
│   └── (선택) /encyclopedia/skill/pitcher/:skillCode  ← ENC-1-2 스킬 상세 (모달 OR 페이지 — R2 결정)
├── /encyclopedia/skill/hitter                 ← ENC-2 타자 스킬 list
│   └── (선택) /encyclopedia/skill/hitter/:skillCode   ← ENC-2-2 스킬 상세
├── /encyclopedia/recommend/pitcher            ← ENC-3 투수 추천 조합
├── /encyclopedia/recommend/hitter             ← ENC-4 타자 추천 조합
├── /encyclopedia/game-info/pitcher            ← ENC-5 기본 게임 정보 (투수: 마구·구종·스탯 영향)
└── /encyclopedia/game-info/hitter             ← ENC-6 기본 게임 정보 (타자: 스윙·타격)
```

### 1.3 보류 카테고리 (IA 자리만)

| ID 후보 | 카테고리 | 보류 사유 | 향후 작업 진입 조건 |
|---|---|---|---|
| ENC-7 | 코치 | dictionary legacy 폐기 후 모바일 미작업. BE `/api/skills/coach` 살아있음 + FE 미연결 | dictionary Owner 결정 #4 (`legacy/dictionary.md § A.8`) 확정 후 |
| ENC-8 | 구단 선수 | DB 부재 + 게임사 데이터 부재 | 게임사 API 가용성 / 시드 데이터 확보 후 |
| ENC-9 | 에픽 | 정보 출처 미정 | 사용자 정의 → 시드/admin 신규 사이클 |

### 1.4 진입 동선

| 진입 | 출처 | 동선 |
|---|---|---|
| home QuickMenu | `web/src/domains/home/config/QUICK_MENUS.js:6` | `comingSoon: true` 해제 → `/encyclopedia` 직진입 |
| Drawer 메뉴 | `web/src/app/wrapper/mobile/parts/Drawer.jsx` (R2 확인) | 🟨 가정 — 항목 신설 |
| 외부 deep-link | URL 직접 진입 | public — 비로그인 OK |

---

## § 2. 요구사항

### 2.1 사용자 시나리오 (기획자 1순위)

| # | 시나리오 | 핵심 화면 |
|---|---|---|
| US-1 | 신규 사용자: "내 카드에 슈퍼스타 1개만 있는데 뭐 더 끼울지 모르겠다" → 추천 조합 진입 → 슈퍼스타 포함 추천 N개 확인 | ENC-3 |
| US-2 | 게임 중 발견한 모르는 스킬명 검색 → 스킬 list 에서 검색 OR 스크롤 → 효과 텍스트 확인 | ENC-1 / ENC-2 |
| US-3 | "내 스탯이 안 오르는데 어떤 스킬이 영향 주는지 모르겠다" → 기본 게임 정보 진입 → 스탯-스킬 매핑 확인 | ENC-5 / ENC-6 |
| US-4 | "라이징 패스트볼이 뭔지" → 스킬 상세 진입 (모달/페이지) → 효과·시너지 확인 | ENC-1-2 |
| US-5 | "내 카드 3 스킬 조합이 좋은 조합인지 검증" → 추천 조합 list 에서 동일 조합 검색 → tier 확인 | ENC-3 |

### 2.2 비기능 요구

| 항목 | 요구 |
|---|---|
| 응답속도 | 스킬 list 초기 진입 < 1초 (BE `@Cacheable` 적용 + 데이터량 < 100건) |
| 반응형 | mobile-first 단일 모드 (`responsive-mobile-first.md` 적용) |
| 접근성 | grade 색 외에 텍스트 라벨 병기 (색맹 대응) |
| SEO | 공개 검색 노출 — title/description 메타 설정 (R3 endpoint-spec) |
| 캐시 | BE Caffeine cache 그대로 활용. FE 는 react-query `staleTime: 10min` 🟨 가정 |

### 2.3 KPI / 성공 지표 (제안)

| 지표 | 측정 | 목표 (제안 — 사용자 확정 필요) |
|---|---|---|
| home → encyclopedia 진입율 | GA event | ≥ 10% |
| 추천 조합 페이지 평균 체류 시간 | GA | ≥ 30초 |
| 스킬 list 검색/필터 사용율 | (제안) | (R2 검색 기능 정의 후) |

---

## § 3. 정책 결정 (R1 핵심)

### 3.1 데이터 소스 정책

| 카테고리 | 1차 (R2 진입) | 향후 | 사유 |
|---|---|---|---|
| 스킬 list (PITCHER/HITTER) | BE `/api/skills/{target}` | 동일 | 시드/캐시 모두 살아있음 — 재발명 X |
| 추천 조합 | FE mock `web/src/data/skill/PITCHER_RECOMMEND.js` + `HITTER_RECOMMEND.js` 정적 import | BE 이관 (admin 등록 / 시드 SQL → 별도 사이클) | 데이터량 ~수백건, 변경 빈도 낮음. PoC 빠르게 |
| 시너지 / 상극 / 포지션 점수 | FE mock `pitcherSkillMeta.js` / `pitcherPositionScore.js` | (점진적 BE 이관) | 동일 |
| score-config (점수 룰) | BE `/api/skills/score-config` | 동일 | 이미 BE 보유 |
| 기본 게임 정보 (마구·구종·스탯) | 🔴 **결정 필요** — (A) FE 정적 markdown / (B) FE 정적 JSON / (C) 신규 DB 테이블 + admin | (B/C 시) | 데이터 변경 빈도 / admin 등록 요구 여부에 따라 |

### 3.2 권한 / 가시성

| 항목 | 정책 | 사유 |
|---|---|---|
| 진입 | public — 비로그인 OK | 정보성 콘텐츠. 회원 가두기 X |
| admin 등록/수정 | **R1 범위 외** — 추후 별도 사이클 | 사용자가 R2 끝 결정 마커 |
| API auth | permitAll (기존 `/api/skills/*` 동일) | SecurityConfig 변경 없음 |

> 🔴 권한 결정 — 비회원에게 추천 조합 / 기본 게임 정보 전체 노출이 OK 인지 사용자 확정 필요. 가정값 = OK.

### 3.3 store / 데이터 캐싱

| 결정 | 값 | 사유 |
|---|---|---|
| FE store 등록 | **하지 않음** (가정) | dictionary legacy 의 store 등록 → 번들 영향 (`legacy/dictionary.md § A.6`) 회피 |
| 1차 fetch 방식 | **react-query** (페이지 진입 시 useQuery, staleTime 10분) 🟨 가정 | 캐시 자연 활용 + lazy import 친화 |
| 정적 데이터 (mock) | 페이지 lazy chunk 안에 정적 import | tree-shake / lazy 자연 분리 |

### 3.4 디자인 / Figma 정책

| 결정 | 값 |
|---|---|
| Figma 출처 | entry=83-2259, 스킬list=83-2303 / 83-2500, 추천=86-3236 (참고만) |
| 토큰 출처 | 기존 FE 컨벤션 (`web/src/global/styles/**`) 우선 |
| 자체 헤더 금지 | MobileLayout TopBar 통일 (`feedback_no_domain_header.md` 메모리) |
| sub컴포넌트 분리 | 반복/변형/외부재사용 충족 시만 분리 — 단일 페이지 상태분기형은 inline (`feedback_component_decomposition.md` 메모리) |
| 디자인 작업 디스패치 | R3 brief 에 포함 — `designer-render` agent 가 Figma ↔ FE 매핑 산출 |

### 3.5 검색 / 필터 정책 (R2 상세)

| 항목 | R1 가정 | R2 확정 사항 |
|---|---|---|
| 스킬 list 검색 | 이름 (한글) substring 검색 — 클라 측 | 정렬 옵션 (grade/이름) |
| 스킬 list 필터 | grade 칩 (4종) | tier / preferredPosition (mock meta 가용 시) |
| 추천 조합 필터 | position (선발/중계/마무리/타자) + tier(S/A/B) | grade(졸업/준졸업/타협) 가용 — mock 확정 |

---

## § 4. 기능 명세 — **R2 작성 예정**

> R2 진입 시 작성. 각 기능 ID 당 Given/When/Then 시나리오 최소 1개 + Figma 매핑 + 컴포넌트 트리.

| 기능 ID | 화면 | 상태 |
|---|---|---|
| ENC-1 | 투수 스킬 list | R2 |
| ENC-1-2 | 투수 스킬 상세 (모달 OR 페이지) | R2 결정 |
| ENC-2 | 타자 스킬 list | R2 |
| ENC-2-2 | 타자 스킬 상세 | R2 결정 |
| ENC-3 | 투수 추천 조합 | R2 |
| ENC-4 | 타자 추천 조합 | R2 |
| ENC-5 | 기본 게임 정보 (투수) | R2 (자료 출처 결정 후) |
| ENC-6 | 기본 게임 정보 (타자) | R2 (자료 출처 결정 후) |
| ENC-0 | 카테고리 entry (그리드 9칸) | R2 |

---

## § 5. API / 외부 IF — **R2 작성 예정**

R2 진입 시:

- 기존 endpoint 확정 (`/api/skills/{target}`, `/api/skills/score-config`)
- 신규 endpoint 필요 여부 결정 (예: `/api/encyclopedia/recommend/{target}`, `/api/encyclopedia/game-info/{target}`)
- 요청/응답 스펙 / 캐시 / auth / error code

---

## § 6. 예외 케이스 — **R3 작성 예정**

각 기능 ID 당 최소 2개. (예: 빈 결과 / 네트워크 실패 / 캐시 staleness / 잘못된 skillCode 등)

---

## § 7. QA — **R3 작성 예정**

사용자 시나리오 기반 체크리스트 + 회귀 케이스.

---

## § 8. 사용자 확인 잔여 — R1 종료 시점 누적

| # | 마커 | 항목 | 가정값 | 결정 시점 |
|---|---|---|---|---|
| 1 | 🟨 | feature prefix=`ENC` | `ENC` 채택 | R1 종료 |
| 2 | 🔴 DB 신규 | 기본 게임 정보 (마구·구종 등급·스탯 영향) 자료 출처 = (A) FE 정적 markdown / (B) FE 정적 JSON / (C) 신규 DB 테이블 + admin | (B) FE 정적 JSON (변경 빈도 낮음 + admin 사이클 보류) | **R1 종료 — 사용자 결정 필요** |
| 3 | 🔴 권한 | public 노출 (비로그인 OK) — 추천 조합 / 게임 정보 모두 | OK | **R1 종료 — 사용자 결정 필요** |
| 4 | 🟨 | 추천 조합 데이터 소스 = FE mock 정적 import (1차) → BE 이관 (2차) | 1차 FE mock | R1 종료 confirm |
| 5 | 🟨 | TopBar variant=default (자체 헤더 X) | default | R2 Figma 검증 |
| 6 | ❓ | 스킬 상세 = 모달 OR 페이지 | 모달 우선 (depth 1 절약) | R2 결정 |
| 7 | ❓ | admin 등록/수정 화면 필요 여부 | 본 라운드 범위 외 | R2 종료 시 결정 |
| 8 | ❓ | store 등록 vs react-query vs 페이지 로컬 fetch | react-query (페이지 lazy chunk 안) | R2 결정 |
| 9 | ❓ | 검색/필터 범위 (스킬 list / 추천 조합) | 스킬 list = 이름 substring + grade 칩 / 추천 = position + tier | R2 확정 |
| 10 | 🟨 | KPI 목표값 (home→encyclopedia 진입율 10%, 추천 체류 30초) | 제안값 | R2/R3 사용자 확정 |
| 11 | 🟨 | 보류 카테고리 (코치/구단선수/에픽) entry 그리드 표시 = disabled chip | disabled chip | R2 디자인 확정 |
