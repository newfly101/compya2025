# wiki (추천 백과사전) 통합 기획

> 구현 history:
> - 2026-05-31 R1 신규 — IA + 요구사항 + 정책 (`docs/domain/encyclopedia/` 경로)
> - 2026-05-31 R2 진입 — 도메인 키 `encyclopedia` → `wiki` 재명명, 기능 명세 + API 작성
> - 2026-05-31 R3 진입 — Q5=admin CRUD 포함 / Q6=시드 사용자 작성. § 6 예외 / § 7 QA / § 8 갱신 정책 작성 + admin endpoint 본 사이클로 흡수
>
> 공통 정책: [`_common.md`](./_common.md)
> 개발 task: [`_tasks.md`](./_tasks.md)
> 결정 이력: [`_decision_log.md`](./_decision_log.md)

---

## § 1. IA (정보 구조)

### 1.1 도메인 정체성 (요약)

| 항목 | 값 |
|---|---|
| 한글명 | 추천 백과사전 |
| 도메인 키 | `wiki` (R1 → R2 재명명) |
| 사용자 가치 | (1) 스킬 카탈로그 검색 + (2) 3 스킬 조합의 tier 검증/추천 + (3) 게임 메커니즘 (마구·구종 등급·스탯) 공식 정보 채널 |
| 운영 상태 | 신규 — 코드 부재 (home QuickMenu + Drawer entry `comingSoon`) |

### 1.2 활성 카테고리 / 화면 트리

```
/wiki                                    ← ENC-0 카테고리 entry (그리드 9칸)
├── /wiki/skill/pitcher                  ← ENC-1 투수 스킬 list
│   └── (modal) ENC-1-2                  ← 스킬 상세 모달
├── /wiki/skill/hitter                   ← ENC-2 타자 스킬 list
│   └── (modal) ENC-2-2                  ← 스킬 상세 모달
├── /wiki/recommend/pitcher              ← ENC-3 투수 추천 조합
├── /wiki/recommend/hitter               ← ENC-4 타자 추천 조합
├── /wiki/game-info/pitcher              ← ENC-5 기본 게임 정보 (마구·구종·스탯)
└── /wiki/game-info/hitter               ← ENC-6 기본 게임 정보 (스윙·타격)
```

### 1.3 보류 카테고리 (IA 자리만)

| ID 후보 | 카테고리 | 보류 사유 | 향후 작업 진입 조건 |
|---|---|---|---|
| ENC-7 | 코치 | dictionary legacy 폐기 후 모바일 미작업. BE `/api/skills/coach` 살아있음 | dictionary Owner 결정 #4 확정 후 |
| ENC-8 | 구단 선수 | DB 부재 + 게임사 데이터 부재 | 게임사 API / 시드 확보 후 |
| ENC-9 | 에픽 | 정보 출처 미정 | 사용자 정의 → admin 사이클 |

### 1.4 진입 동선

| 진입 | 출처 | 동선 |
|---|---|---|
| home QuickMenu | `QUICK_MENUS.js:6` | `/encyclopedia` → `/wiki` 변경 + `comingSoon: true` 해제 (develop 트랙) |
| Drawer 메뉴 | `MENU_GROUPS.js:15` | 동일 변경 |
| URL 직접 | public — 비로그인 OK | — |

---

## § 2. 요구사항 (R1 확정 — 변경 없음)

> R1 § 2 그대로 유지. 사용자 시나리오 US-1~US-5 / 비기능 요구 / KPI 동일. 본 § 는 reference link 만.

상세: R1 작성된 사용자 시나리오 그대로 — `_common.md § 0` 의 책임 정의와 정합 확인 완료.

---

## § 3. 정책 결정 (R1 → R2 확정 반영)

### 3.1 데이터 소스 정책 (R2 확정)

| 카테고리 | 1차 소스 | 향후 | 비고 |
|---|---|---|---|
| 스킬 list | BE `/api/skills/{target}` | 동일 | EPIC 필드 누락 — BE 보강 마커 |
| 추천 조합 (투수) | FE mock 정적 import (`PITCHER_RECOMMEND.js`, `pitcherSkillMeta.js`, `pitcherPositionScore.js`, `pitcherComboPresets.js`) + `/api/skills/score-config` (점수 룰 보조) | BE 이관 (별도 사이클) | 데이터량 ~수백건 |
| 추천 조합 (타자) | FE mock (`HITTER_RECOMMEND.js`, `HITTER_POINTS.js`) | BE 이관 | 동일 |
| 기본 게임 정보 | **신규 DB 테이블 + 신규 BE `/api/wiki/game-info/{target}`** (Q1=C 결정) | 동일 (admin 사이클 분리) | 4.5 § 신규 DB schema 안 참조 |

### 3.2 권한 / 가시성 (Q2 confirm)

| 항목 | 정책 |
|---|---|
| 진입 | public (비로그인 OK) |
| API auth | permitAll (기존 `/api/skills/*` 동일 + 신규 `/api/wiki/*` 동일) |
| admin endpoint | `@PreAuthorize("hasRole('ADMIN')")` (별도 사이클 — 본 라운드 외) |
| SecurityConfig 변경 | 없음 (permitAll 추가만 — develop 트랙 처리) |

### 3.3 store / 캐싱 / Figma / 컴포넌트 분리

R1 § 3.3 ~ 3.4 그대로 유지 (변경 없음).

### 3.4 검색 / 필터 정책 (R2 확정)

| 화면 | 검색 | 필터 | 정렬 |
|---|---|---|---|
| ENC-1 / ENC-2 (스킬 list) | 이름 (한글) substring — 클라이언트 측 | grade 칩 (5종, 다중 선택) — EPIC 보강 후 5종 | default = grade 내림차순 → id. 사용자 토글: 이름 가나다 |
| ENC-3 / ENC-4 (추천 조합) | (선택) 포함된 스킬명 substring | position (선발/중계/마무리/타자), tier (S/A/B) OR grade(졸업/준졸업/타협) | default = totalPoint 내림차순 |
| ENC-5 / ENC-6 (게임 정보) | 없음 (전체 정보 페이지) | 섹션 탭 (마구/구종/스탯 영향) | — |

---

## § 4. 기능 명세

### 4.0 ENC-0 — 카테고리 entry (`WikiScreen`, `/wiki`)

| 항목 | 값 |
|---|---|
| URL | `/wiki` |
| TopBar | variant=default, title="추천 백과사전" |
| 화면 구조 | 9칸 그리드 (3열 × 3행) — 활성 6 + 보류 3 |
| 활성 카드 | 클릭 → 해당 URL 이동 |
| 보류 카드 | disabled 상태 + 클릭 시 `RenewalNoticeModal` 표시 (home Quick 패턴 답습) |
| 데이터 | 정적 config (`web/src/domains/wiki/config/WIKI_CATEGORIES.js` 신규) |
| 외부 의존 | `RenewalNoticeModal` |

**G/W/T 시나리오 #1 — 활성 카드 클릭**
```
Given: 사용자가 home 에서 "추천 백과사전" QuickMenu 클릭
When:  /wiki 진입 → "투수 스킬" 카드 클릭
Then:  /wiki/skill/pitcher 로 navigate. TopBar back 버튼 표시.
```

**G/W/T 시나리오 #2 — 보류 카드 클릭**
```
Given: /wiki 진입 상태
When:  "코치" / "구단 선수" / "에픽" 중 하나 클릭
Then:  navigate 차단 + RenewalNoticeModal 표시 ("준비 중입니다")
```

**예외 (R3 작성):**
- 비로그인 상태 진입 — 정상 표시 (public)
- 모달 닫기 후 재클릭 — 동일 동작

---

### 4.1 ENC-1 — 투수 스킬 list (`WikiSkillScreen` target=PITCHER, `/wiki/skill/pitcher`)

| 항목 | 값 |
|---|---|
| URL | `/wiki/skill/pitcher` |
| TopBar | variant=default, title="투수 스킬 백과사전" |
| 데이터 | `GET /api/skills/PITCHER` |
| 응답 매핑 | `SkillSetResponse { legend[], (epic[] — 보강 필요), platinum[], hero[], normal[] }` |
| 화면 구조 | grade 별 SectionBlock × 5 (현재 4 — EPIC 보강 후 5). 각 섹션 안에 스킬 카드 list (반복) |
| 카드 정보 | `name`, `skillCode`, `description` (truncate 2 lines) |
| 검색 | 상단 input — 이름 substring filter (클라이언트) |
| 필터 | grade 칩 (다중 선택) — 미선택 = 전체 |
| 상호작용 | 카드 클릭 → `WikiSkillModal` 열림 (skillCode 전달) |
| 빈 결과 | "검색 결과가 없습니다" placeholder |
| 캐시 | react-query `["skills", "PITCHER"]`, staleTime 10분. BE `@Cacheable` 자연 활용 |

**G/W/T 시나리오 #1 — 정상 진입**
```
Given: BE 가 PITCHER 스킬 27건 응답 (LEGEND 7 + PLATINUM 13 + HERO 1 + NORMAL 6)
When:  사용자가 /wiki/skill/pitcher 진입
Then:  grade 4 섹션이 LEGEND → PLATINUM → HERO → NORMAL 순서로 표시. 각 섹션 내 id 오름차순.
```

**G/W/T 시나리오 #2 — 이름 검색**
```
Given: 스킬 list 표시 상태
When:  사용자가 검색창에 "투혼" 입력
Then:  이름이 "투혼" 포함된 스킬만 카드로 표시. grade 섹션 헤더는 결과 있는 것만 표시.
```

**G/W/T 시나리오 #3 — grade 필터**
```
Given: 검색어 없음
When:  LEGEND 칩 + PLATINUM 칩 선택
Then:  LEGEND + PLATINUM 만 표시. HERO/NORMAL 섹션 헤더 숨김.
```

---

### 4.1.2 ENC-1-2 / ENC-2-2 — 스킬 상세 모달 (`WikiSkillModal`)

| 항목 | 값 |
|---|---|
| 트리거 | 스킬 카드 클릭 (ENC-1 / ENC-2) |
| 데이터 | 클릭된 `SkillItemResponse` (list 응답에서 lookup — 추가 fetch X) |
| 표시 | `name` (제목) + `grade` (badge) + `skillCode` + `description` (full) + (선택) 시너지/상극 (mock meta 가용 시) |
| 닫기 | 외부 클릭 / X 버튼 / ESC |
| URL 변경 | **없음** — 모달이므로 deep-link 불가 (가정 채택 — depth 1 절약) |

**G/W/T 시나리오 #1**
```
Given: PITCHER list 표시 상태
When:  "베테랑 (L4)" 카드 클릭
Then:  모달 오픈. 제목="베테랑", grade badge="LEGEND", code="L4", description=DB description, 시너지: L1/L2/L3/L6/P6/P13 (mock meta)
```

---

### 4.2 ENC-2 — 타자 스킬 list (`WikiSkillScreen` target=HITTER, `/wiki/skill/hitter`)

ENC-1 과 동일 — `target=HITTER` 만 차이. G/W/T 시나리오는 ENC-1 #1 의 HITTER 버전 ("핵심타자/위압감/베테랑 등 표시") 으로 1개 작성. 컴포넌트 prop 분기 — 별도 screen X.

---

### 4.3 ENC-3 — 투수 추천 조합 (`WikiRecommendScreen` target=PITCHER, `/wiki/recommend/pitcher`)

| 항목 | 값 |
|---|---|
| URL | `/wiki/recommend/pitcher` |
| TopBar | variant=default, title="투수 추천 조합" |
| 데이터 (1차) | FE mock 정적 import: `PITCHER_RECOMMEND`, `pitcherSkillMeta`, `pitcherPositionScore`, `pitcherComboPresets` |
| 데이터 (보조) | `GET /api/skills/score-config` (점수 룰 — 추후 hover 설명 용도) |
| 화면 구조 | position (선발/중계/마무리) 탭 → 각 탭 안에 grade (졸업/준졸업/타협/변경) 섹션 → 조합 카드 list |
| 카드 정보 | 3 스킬 이름 (칩) + `totalPoint` + `grade` (졸업/준졸업/타협) + (옵션) 설명 (comboPresets 매칭 시 description) |
| 검색 | 포함 스킬명 substring (e.g. "슈퍼스타" 입력 → 슈퍼스타 포함 조합만) |
| 필터 | position 탭 (3종) — single select |
| 정렬 | totalPoint 내림차순 (default) |
| 상호작용 | 카드 클릭 → (선택) 점수 산출 breakdown 모달 (R3 결정) |

**G/W/T 시나리오 #1 — 진입**
```
Given: /wiki/recommend/pitcher 진입
When:  default 탭 "선발"
Then:  PITCHER_RECOMMEND 중 position="선발" 인 조합 N건이 totalPoint 내림차순 표시. 상단에 grade 섹션 ("졸업 (totalPoint ≥ 26)" / "준졸업 / 타협") 분리.
```

**G/W/T 시나리오 #2 — 검색**
```
Given: "선발" 탭 표시 상태
When:  검색창에 "슈퍼스타" 입력
Then:  3 스킬 중 "슈퍼스타" 포함된 조합만 표시.
```

**G/W/T 시나리오 #3 — 카드 클릭 (선택)**
```
Given: 조합 카드 표시
When:  "슈퍼스타+베테랑+팔색조 (totalPoint 30)" 클릭
Then:  점수 breakdown 모달 (각 스킬 base point + WITH_SKILL 보정 + 합계) 표시.
       데이터: HITTER_POINTS/PITCHER_RECOMMEND + score-config WITH_SKILL 규칙 적용.
```

---

### 4.4 ENC-4 — 타자 추천 조합 (`WikiRecommendScreen` target=HITTER, `/wiki/recommend/hitter`)

ENC-3 과 동일 — target=HITTER. 차이:
- mock 소스: `HITTER_RECOMMEND` + `HITTER_POINTS`
- position 탭 = 없음 (모두 "타자") → 탭 제거, grade 섹션만
- G/W/T 시나리오 1개 (HITTER 버전)

---

### 4.5 ENC-5 — 기본 게임 정보 (투수) (`WikiGameInfoScreen` target=PITCHER, `/wiki/game-info/pitcher`)

| 항목 | 값 |
|---|---|
| URL | `/wiki/game-info/pitcher` |
| TopBar | variant=default, title="투수 기본 정보" |
| 데이터 | **신규 BE `GET /api/wiki/game-info/PITCHER`** |
| 화면 구조 | 섹션 탭 — (1) 마구 list / (2) 구종 등급표 / (3) 스탯 영향 매핑 |
| 1차 시드 | 사용자가 작성 (admin 사이클 분리 시 admin UI 로 대체) |
| 캐시 | BE `@Cacheable("wikiGameInfoByTarget")`, FE react-query staleTime 30분 (변경 빈도 매우 낮음) |

**신규 DB 테이블 안 (R2 제안 — R3 BE dispatch 확정)**

```sql
-- 마구 (투수 고유 스킬샷, 구종별 명칭)
CREATE TABLE wiki_pitch (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    code          VARCHAR(30)                                NOT NULL UNIQUE,  -- e.g. FASTBALL_4SEAM
    name          VARCHAR(50)                                NOT NULL,         -- e.g. 포심패스트볼
    pitch_type    ENUM ('FASTBALL', 'BREAKING', 'OFFSPEED')  NOT NULL,
    description   TEXT,
    display_order INT      DEFAULT 0,
    is_active     BOOLEAN  DEFAULT TRUE,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 구종 등급별 능력치 (S/A/B/C/D/E 등급에 따른 control/velocity/...)
CREATE TABLE wiki_pitch_grade (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    pitch_code    VARCHAR(30)                                NOT NULL,
    grade         CHAR(1)                                    NOT NULL,         -- S, A, B, C, D, E
    velocity_min  INT,
    velocity_max  INT,
    break_amount  INT,
    description   VARCHAR(255),
    UNIQUE KEY uk_pitch_grade (pitch_code, grade),
    CONSTRAINT fk_wiki_pitch_grade_code FOREIGN KEY (pitch_code) REFERENCES wiki_pitch(code)
);

-- 스탯 ↔ 마구/스킬 영향 매핑
CREATE TABLE wiki_stat_influence (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    target           ENUM ('PITCHER', 'HITTER')              NOT NULL,
    stat_code        VARCHAR(30)                             NOT NULL,         -- e.g. CONTROL, VELOCITY, POWER, CONTACT
    influence_type   ENUM ('PITCH', 'SKILL', 'GENERAL')      NOT NULL,
    influence_target VARCHAR(50)                             NOT NULL,         -- pitch_code / skill_code / 자유 텍스트
    weight           INT       DEFAULT 1,                                      -- 1~5 정도 가중치
    description      TEXT,
    display_order    INT       DEFAULT 0,
    is_active        BOOLEAN   DEFAULT TRUE
);
```

> ⚠️ schema 확정 = R3 BE dispatch brief 핵심. 컬럼명 / 인덱스 / FK 는 BE developer 자체 결정 가능. R3 brief 에 명시.

**G/W/T 시나리오 #1**
```
Given: /wiki/game-info/pitcher 진입
When:  "구종 등급" 탭 클릭
Then:  wiki_pitch_grade 데이터를 pitch_code 별로 그루핑 → S/A/B/C/D/E 등급 테이블 표시
```

**G/W/T 시나리오 #2 (스탯 영향)**
```
Given: "스탯 영향" 탭
When:  탭 진입
Then:  stat_code 별 (제구/구위/체력/직구/변화 등) 그루핑. 각 stat 하위에 영향 주는 마구/스킬 list (weight 내림차순) 표시.
```

---

### 4.6 ENC-6 — 기본 게임 정보 (타자) (`WikiGameInfoScreen` target=HITTER, `/wiki/game-info/hitter`)

ENC-5 와 동일 패턴. 차이:
- target=HITTER
- "마구" 섹션 → "스윙/타격 메커니즘" 섹션으로 대체 (HITTER 에 마구 개념 없음)
- 시드 카테고리: 스윙 타입 (다운/어퍼/풀스윙 등) / 타격 메커니즘 / 스탯 영향
- 동일 DB 테이블 (`wiki_pitch` 는 HITTER 미사용, `wiki_stat_influence` 의 target=HITTER 로 활용)
- 신규 테이블 추가 가능성: `wiki_swing` (R3 BE 검토) — 본 R2 단계에서는 우선 `wiki_stat_influence` 단독으로 PoC

**G/W/T 시나리오 #1**
```
Given: /wiki/game-info/hitter 진입
When:  default 탭 ("스탯 영향")
Then:  wiki_stat_influence WHERE target='HITTER' 데이터를 stat_code 별 그루핑 표시.
```

---

## § 5. API / 외부 IF

### 5.1 기존 endpoint 재사용

| METHOD | PATH | 컨트롤러 | auth | 본 도메인 사용처 | 비고 |
|---|---|---|---|---|---|
| GET | `/api/skills/{target}` | `SkillController#playerTypeSkills` (`skill/controller/SkillController.java:21`) | permitAll | ENC-1 / ENC-2 | target ∈ {PITCHER, HITTER}. 캐시 `playerSkillSetByTarget` |
| GET | `/api/skills/score-config` | `SkillController#skillScoreConfig` (line 31) | permitAll | ENC-3 / ENC-4 (보조 — 점수 breakdown 모달) | 캐시 `skillScoreConfig` |
| GET | `/api/skills/coach` | `SkillController#coachSkills` (line 26) | permitAll | (보류 — ENC-7) | 캐시 `coachSkills` |

**기존 endpoint 보강 마커:**

| 항목 | 현재 | 보강 안 | 사유 |
|---|---|---|---|
| `SkillSetResponse` 필드 | `legend / platinum / hero / normal` 4종 | `legend / epic / platinum / hero / normal` 5종 | Grade enum 에 EPIC 존재하나 응답 누락 |
| `SkillSetResponse.java` 변경 | record 필드 추가 | 추가 | BE 컴파일 영향 → 호출처 (legacy simulate 도 함께) 검증 필요 |
| `PlayerSkillsServiceImpl` 변경 | grouped.getOrDefault(EPIC, ...) 추가 | 추가 | record 빌더 동기화 |

> R3 BE dispatch brief 에 EPIC 보강 + 회귀 검증 (legacy simulate 가 SkillSetResponse 사용 — `legacy/dictionary.md § A.3` 의 simulate 도메인 의존도) 포함.

### 5.2 신규 endpoint (R2 신규)

#### 5.2.1 GET `/api/wiki/game-info/{target}` (ENC-5 / ENC-6)

| 항목 | 값 |
|---|---|
| 컨트롤러 (제안) | `WikiGameInfoController` in `domain/wiki/controller/` (신규 패키지) |
| auth | permitAll |
| path 변수 | `target ∈ {PITCHER, HITTER}` (`Target` enum 재사용) |
| 응답 (제안 DTO) | `WikiGameInfoResponse { pitches[], pitchGrades[], statInfluences[] }` (target=PITCHER 한정. HITTER 는 pitches/pitchGrades 빈 배열 OR 별도 swing 추가) |
| 캐시 | `@Cacheable("wikiGameInfoByTarget", key="#target")` |
| 에러 | target 미존재 — 400. 데이터 없음 — 200 + 빈 배열 |

**응답 DTO 안 (제안 — R3 BE 자체 결정 가능)**

```java
public record WikiGameInfoResponse(
    List<WikiPitchResponse> pitches,                 // PITCHER 만, HITTER 는 []
    List<WikiPitchGradeResponse> pitchGrades,        // PITCHER 만, HITTER 는 []
    List<WikiStatInfluenceResponse> statInfluences   // PITCHER/HITTER 모두
) { }

public record WikiPitchResponse(
    String code, String name, String pitchType, String description, int displayOrder
) { }

public record WikiPitchGradeResponse(
    String pitchCode, String grade, Integer velocityMin, Integer velocityMax,
    Integer breakAmount, String description
) { }

public record WikiStatInfluenceResponse(
    String statCode, String influenceType, String influenceTarget,
    int weight, String description, int displayOrder
) { }
```

#### 5.2.2 admin endpoint (R3 — 본 사이클 포함 결정, Q5)

> R3 진입 시 Q5 = **admin CRUD 본 사이클 포함**. 별도 사이클 분리 마커 해제.
> 권한: `@PreAuthorize("hasRole('ADMIN')")` — `AdminPlayerCardController`, `AdminEventController` 패턴 답습.
> 🔴 보안: ADMIN role 신규 분기는 사용자 메모리 `project_auth_model.md` (B2C 단일 권한, user/admin 단순 2단계) 부합. 자체 결정 X — 사용자 명시.

| METHOD | PATH | 컨트롤러 | auth | 비고 |
|---|---|---|---|---|
| POST | `/api/admin/wiki/pitches` | `AdminWikiPitchController` | hasRole('ADMIN') | wiki_pitch 등록 |
| PUT | `/api/admin/wiki/pitches/{id}` | 동상 | 동상 | 수정 |
| DELETE | `/api/admin/wiki/pitches/{id}` | 동상 | 동상 | soft delete (is_active=false) |
| POST | `/api/admin/wiki/pitch-grades` | `AdminWikiPitchGradeController` | 동상 | wiki_pitch_grade 등록 |
| PUT | `/api/admin/wiki/pitch-grades/{id}` | 동상 | 동상 | 수정 |
| DELETE | `/api/admin/wiki/pitch-grades/{id}` | 동상 | 동상 | hard delete (FK 정합 보장 — pitch_code 살아있는지 검증 후) |
| POST | `/api/admin/wiki/stat-influences` | `AdminWikiStatInfluenceController` | 동상 | wiki_stat_influence 등록 |
| PUT | `/api/admin/wiki/stat-influences/{id}` | 동상 | 동상 | 수정 |
| DELETE | `/api/admin/wiki/stat-influences/{id}` | 동상 | 동상 | soft delete |
| GET | `/api/admin/wiki/game-info/{target}` | `AdminWikiGameInfoController` | hasRole('ADMIN') | admin viewer (is_active=false 도 포함). public endpoint 와 분리 — 캐시 X |

**Request DTO 안 (제안):**

```java
public record WikiPitchRequest(
    String code, String name, String pitchType,        // FASTBALL|BREAKING|OFFSPEED
    String description, Integer displayOrder, Boolean isActive
) { }

public record WikiPitchGradeRequest(
    String pitchCode, String grade,                    // S|A|B|C|D|E
    Integer velocityMin, Integer velocityMax, Integer breakAmount, String description
) { }

public record WikiStatInfluenceRequest(
    String target, String statCode, String influenceType,   // PITCH|SKILL|GENERAL
    String influenceTarget, Integer weight, String description,
    Integer displayOrder, Boolean isActive
) { }
```

**SecurityConfig 영향:**

| URL pattern | 적용 |
|---|---|
| `/api/wiki/game-info/**` | permitAll (R2 결정 유지) |
| `/api/admin/wiki/**` | hasRole('ADMIN') — 기존 admin pattern 매핑 룰 답습 (`/api/admin/**` 통합 룰 있을 시 별도 추가 불필요) |

> R3 BE dispatch brief 시 `SecurityConfig` 현재 admin 라우트 룰 확인 → `/api/admin/wiki/**` 가 기존 `/api/admin/**` 룰에 자동 포함되는지 검증. 미포함 시 명시 추가.

#### 5.2.3 admin FE 화면 (ENC-A 시리즈 — R3 신규)

| feature ID | 화면 | URL | 설명 |
|---|---|---|---|
| ENC-A0 | admin entry (위키 관리) | `/admin/wiki` | wiki 관련 admin 진입점 (3 entity 카드: 마구 / 등급 / 스탯 영향) |
| ENC-A1 | 마구 (wiki_pitch) 관리 | `/admin/wiki/pitches` | list + CRUD form (모달 또는 inline) |
| ENC-A2 | 등급 (wiki_pitch_grade) 관리 | `/admin/wiki/pitch-grades` | list + CRUD form |
| ENC-A3 | 스탯 영향 (wiki_stat_influence) 관리 | `/admin/wiki/stat-influences` | list + CRUD form |

> admin entry 동선: Drawer 프로필 하단 "관리자 페이지" 진입점 (user.role==ADMIN 일 때만 표시). 라우트 가드는 `web/src/app/router/guard/AdminRoute.jsx` (신규) — `useAuthentication` hook 의 `user.role` 검사.

### 5.3 신규 endpoint 등록 위치

| 항목 | 위치 |
|---|---|
| Java 패키지 | `src/main/java/com/dawne/com2usbaseball/domain/wiki/` (신규) |
| Mapper xml | `src/main/resources/mapper/wiki/` (신규) |
| Schema SQL | `sql/V2/site/CREATE_TABLE_SITE.sql` 또는 별도 `sql/V3/site/CREATE_WIKI_TABLES.sql` (BE 결정) |
| 시드 SQL | `sql/insertData/INSERT_WIKI_GAME_INFO.sql` (사용자 작성 + admin 사이클 시 마이그레이션) |
| FE route | `web/src/app/router/routes/PublicRoutes.jsx` — `WikiScreen` lazy import |
| FE routeMeta | `web/src/app/router/config/routeMeta.js` — `WIKI` 그룹 신규 |
| FE routePath | `web/src/app/router/config/routePath.js` — `wiki`, `wiki_skill_pattern` 등 신규 |

---

## § 6. 예외 케이스

각 기능 ID 당 최소 2개. 활성 기능 ID 위주 (보류 ENC-7/8/9 제외).

### 6.1 ENC-0 (카테고리 entry)

| # | 케이스 | 트리거 | 기대 동작 | 비고 |
|---|---|---|---|---|
| EX-0-1 | 보류 카드 클릭 | "코치"/"구단 선수"/"에픽" 클릭 | navigate 차단 + `RenewalNoticeModal` 표시 | home Quick 패턴 답습 |
| EX-0-2 | 직접 URL 진입 (활성 카드 우회) | `/wiki/skill/pitcher` 직접 입력 | 정상 진입 (public) | public 도메인 — 검증 X |
| EX-0-3 | URL 오타 (`/wiki/typo`) | 404 catch-all | 글로벌 NotFound 페이지 | 라우트 fallback 책임 |

### 6.2 ENC-1 / ENC-2 (스킬 list)

| # | 케이스 | 트리거 | 기대 동작 | 비고 |
|---|---|---|---|---|
| EX-1-1 | 빈 검색 결과 | 검색어 = 존재하지 않는 한글 (e.g. "ZZZZ") | "검색 결과가 없습니다" placeholder | grade 섹션 헤더도 숨김 |
| EX-1-2 | grade 필터로 전체 제외 | 모든 grade 칩 해제 → 토글 1개만 선택 후 다시 해제 | 전체 표시 (default = 미선택 = 전체) | 0개 선택 시 = 전체 (UX 일관) |
| EX-1-3 | 네트워크 실패 | `/api/skills/PITCHER` 500 응답 | react-query retry 3회 → 실패 시 "데이터를 불러올 수 없습니다" + 새로고침 버튼 | retry 룰: 1s/2s/4s 백오프 (react-query default) |
| EX-1-4 | 잘못된 path param | `/wiki/skill/UNKNOWN` 진입 | FE 라우트 매칭 X → 404 OR `target` validation → 400 | router pattern `:target(pitcher|hitter)` 권장 |
| EX-1-5 | BE EPIC 미보강 + DB EPIC 시드 존재 | DB 에 EPIC 스킬 추가됨 / BE record 4 필드만 응답 | EPIC 스킬 list 에서 누락 (silent) | R3 BE dispatch 로 EPIC 보강 — 본 케이스 = 보강 전 risk |
| EX-1-6 | 빈 BE 응답 (timeout/200 + null) | 응답 null | placeholder "표시할 스킬이 없습니다" | 빈 배열 / null 동일 처리 |

### 6.3 ENC-1-2 / ENC-2-2 (스킬 모달)

| # | 케이스 | 트리거 | 기대 동작 | 비고 |
|---|---|---|---|---|
| EX-M-1 | list refresh 중 모달 열림 | 사용자 클릭 직후 react-query refetch invalidate | 모달은 클릭 시점 snapshot 사용 → 안전 닫힘 후 list 갱신 | snapshot 패턴 |
| EX-M-2 | 모달 안 시너지 meta 부재 | `pitcherSkillMeta` 에 해당 code 누락 | "시너지 정보 없음" 라벨 표시 (모달은 정상 열림) | mock 정합 부족 OK |
| EX-M-3 | ESC / 외부 클릭 / X 닫힘 | 3 경로 모두 | 동일하게 닫힘 — focus 복귀 (a11y) | 글로벌 모달 패턴 답습 |

### 6.4 ENC-3 / ENC-4 (추천 조합)

| # | 케이스 | 트리거 | 기대 동작 | 비고 |
|---|---|---|---|---|
| EX-3-1 | 검색 + 필터 동시 적용 결과 0건 | "선발" 탭 + 검색어 "ZZZZ" | "조건에 맞는 조합이 없습니다" placeholder + "필터 초기화" 버튼 | UX 회복 동선 필수 |
| EX-3-2 | totalPoint 동점 | 30점 조합 N건 | 2차 정렬: 스킬명 가나다 | 결정적 정렬 |
| EX-3-3 | score-config API 실패 (보조) | `/api/skills/score-config` 500 | 카드 list 는 정상 표시. breakdown 모달만 "점수 룰 로드 실패" 표시 | 본 화면 종속 X (fallback) |
| EX-3-4 | mock 데이터 (PITCHER_RECOMMEND) 빈 배열 | 사용자가 mock 파일 비우면 | "추천 조합 데이터가 없습니다" placeholder | 개발자 실수 방어 |
| EX-3-5 | position 탭 전환 시 검색어 유지 | "선발" 검색 "슈퍼스타" → "마무리" 탭 | 검색어 유지 + 결과 재계산 (탭 별 독립 검색 X) | UX 결정 (가정) |

### 6.5 ENC-5 / ENC-6 (게임 정보)

| # | 케이스 | 트리거 | 기대 동작 | 비고 |
|---|---|---|---|---|
| EX-5-1 | DB 시드 미투입 (1차 진입) | `wiki_pitch` 0건 | "준비 중입니다" placeholder (RenewalNoticeModal 아님 — inline) | Q6 = 사용자 시드 작성 시점까지 발생 |
| EX-5-2 | 부분 시드 (마구만 / 등급 없음) | `wiki_pitch` 5건, `wiki_pitch_grade` 0건 | 마구 list 정상 + "구종 등급" 탭 빈 placeholder | 섹션별 독립 처리 |
| EX-5-3 | 비활성 (is_active=false) 데이터 | admin 이 soft delete | public endpoint = 자동 제외, admin viewer = 포함 (회색 표시) | WHERE is_active=true 필터 |
| EX-5-4 | invalid target | `/api/wiki/game-info/UNKNOWN` | 400 + `INVALID_TARGET` 에러 코드 | Target enum 검증 |
| EX-5-5 | 캐시 stale (admin 등록 직후) | admin POST → public GET 즉시 호출 | admin write 시 `@CacheEvict("wikiGameInfoByTarget")` 강제 | 캐시 무효화 룰 |
| EX-5-6 | HITTER 마구 없음 | `/wiki/game-info/hitter` 진입 | pitches/pitchGrades = 빈 배열 정상 (HITTER 는 stat_influence 만) | 클라이언트는 빈 섹션 숨김 |

### 6.6 ENC-A1 / ENC-A2 / ENC-A3 (admin CRUD)

| # | 케이스 | 트리거 | 기대 동작 | 비고 |
|---|---|---|---|---|
| EX-A-1 | 비로그인 / non-admin 진입 | `/admin/wiki` URL 직접 | FE `AdminRoute` 가드로 home redirect + toast "관리자 권한이 필요합니다" | BE 도 403 차단 |
| EX-A-2 | wiki_pitch code 중복 | POST `code=FASTBALL_4SEAM` (이미 존재) | 409 + `DUPLICATE_CODE` 에러 | UNIQUE 제약 활용 |
| EX-A-3 | wiki_pitch_grade FK 위반 | POST `pitch_code=NONEXISTENT` | 400 + `INVALID_PITCH_CODE` 에러 | FK 사전 검증 |
| EX-A-4 | wiki_pitch DELETE 시 grade 존재 | 자식 grade 가 있는 pitch DELETE | soft delete (is_active=false) — grade 도 함께 비활성 (CASCADE 효과 수동 처리) | 데이터 손실 방지 |
| EX-A-5 | validation 실패 (필수 필드 누락) | name=null POST | 400 + 필드별 메시지 | `@Valid` + `@NotBlank` |
| EX-A-6 | 동시 수정 충돌 | 2 admin 동시 PUT 동일 id | 후입자 승 (낙관적 lock X — PoC 단계) | 향후 version 컬럼 추가 가능 |

---

## § 7. QA 체크리스트

### 7.1 사용자 시나리오 (US-1 ~ US-5 — R1 정의)

> US-1: 신규 사용자가 스킬 카탈로그 검색
> US-2: 게임 입문자가 추천 조합으로 카드 점수 검증
> US-3: 코어 사용자가 게임 메커니즘 (마구/등급/스탯) 조회
> US-4: 비로그인 게스트 진입
> US-5: admin 이 게임 정보 등록

| # | 시나리오 | 단계 | 합격 기준 |
|---|---|---|---|
| QA-1 | US-1 / 스킬 검색 | (1) home → "추천 백과사전" QuickMenu (2) /wiki entry (3) "투수 스킬" 카드 (4) 검색창 "투혼" 입력 (5) 카드 클릭 → 모달 | 모달 안 description full 표시. 닫기 후 focus 복귀 |
| QA-2 | US-1 / grade 필터 | (1) /wiki/skill/pitcher (2) LEGEND + PLATINUM 칩 선택 (3) 결과 확인 | HERO/NORMAL 섹션 헤더 숨김. EPIC 보강 후 5종 칩 노출 |
| QA-3 | US-2 / 추천 조합 + 점수 | (1) /wiki/recommend/pitcher (2) "선발" 탭 (3) 검색어 "슈퍼스타" (4) 카드 클릭 → breakdown 모달 | breakdown = base point + WITH_SKILL 보정 + 합계 |
| QA-4 | US-3 / 게임 정보 | (1) /wiki/game-info/pitcher (2) "구종 등급" 탭 (3) "스탯 영향" 탭 | 시드 투입 후 각 섹션 정상 표시. 시드 미투입 시 placeholder |
| QA-5 | US-4 / 비로그인 | (1) 로그아웃 상태 (2) /wiki 직접 URL 진입 (3) 모든 활성 화면 순회 | 모두 정상 접근 (public). admin 진입점 비표시 |
| QA-6 | US-5 / admin 등록 | (1) admin 로그인 (2) Drawer "관리자 페이지" (3) /admin/wiki/pitches (4) POST → list refresh | DB 반영 + public `/api/wiki/game-info/PITCHER` 캐시 무효화 즉시 반영 |

### 7.2 회귀 (regression)

| # | 항목 | 검증 |
|---|---|---|
| RG-1 | `SkillSetResponse` EPIC 필드 추가 | 기존 호출처 = `domain/skill/*` 내부만 (grep 검증 완료 — simulate 도메인 부재). frontend 빌드 정상 |
| RG-2 | `/api/skills/{target}` 응답 스키마 변경 | FE 가 `legend / platinum / hero / normal` hardcode 사용처 — 본 도메인 신규 작성이므로 무영향 |
| RG-3 | URL `/encyclopedia` → `/wiki` | `QUICK_MENUS.js`, `MENU_GROUPS.js` 변경. 기존 `comingSoon: true` → `false` 또는 제거 |
| RG-4 | `SecurityConfig` `/api/admin/wiki/**` | 기존 `/api/admin/**` 룰에 포함되는지 검증 (BE dispatch brief 명시) |
| RG-5 | Drawer admin 진입점 추가 | non-admin 사용자에게는 비표시 (`user.role !== 'ADMIN'`) |

### 7.3 비기능 (NFR)

| # | 항목 | 목표 |
|---|---|---|
| NFR-1 | 페이지 진입 LCP | < 2.0s (3G 시뮬레이션) |
| NFR-2 | API p95 latency (`/api/skills/*`, `/api/wiki/game-info/*`) | < 300ms (캐시 hit 기준) |
| NFR-3 | mobile 320~430px 반응형 | 가로 스크롤 없음. tap target ≥ 44×44 |
| NFR-4 | a11y | 모달 ESC 닫힘, focus trap, aria-label 스킬 카드 |
| NFR-5 | 캐시 hit ratio (게임 정보) | > 95% (변경 빈도 매우 낮음 → 사실상 영구 캐시) |

### 7.4 검증 환경

| 환경 | 검증 항목 |
|---|---|
| 로컬 | 5 screen 전체 + admin 3 screen + 시드 SQL 1세트 |
| 운영 | smoke (home → /wiki → 각 카테고리 1회씩) |

---

## § 8. 갱신 정책 (스킬 / 게임 정보 추가·변경 절차)

### 8.1 스킬 추가 (DB `player_skills`)

| 단계 | 작업 | 담당 |
|---|---|---|
| 1 | DB `player_skills` INSERT (id / target / grade / skill_code / name / description) | ops (DB 매뉴얼 / 사용자 SQL) |
| 2 | 캐시 무효화 — 서버 재기동 OR `@CacheEvict("playerSkillSetByTarget")` 호출 | BE |
| 3 | FE 빌드 변경 없음 — react-query 가 자동 fetch (staleTime 10분 경과 후) | — |
| 4 | mock meta (`pitcherSkillMeta.js`) 시너지 갱신 (선택) | FE |

### 8.2 추천 조합 추가 (FE mock)

| 단계 | 작업 | 담당 |
|---|---|---|
| 1 | `PITCHER_RECOMMEND.js` (또는 HITTER) 정적 import 파일 수정 | FE |
| 2 | totalPoint / position / grade / 3 스킬 code 정합 검증 | FE |
| 3 | 빌드 + 배포 | FE |

> 추후 BE 이관 시: `wiki_recommend_combo` 테이블 + admin UI 신규 → 본 갱신 정책 step 1~2 가 admin POST 로 대체.

### 8.3 게임 정보 추가 (DB `wiki_pitch` / `wiki_pitch_grade` / `wiki_stat_influence`)

#### 8.3.1 admin UI 경로 (default)

| 단계 | 작업 | 담당 |
|---|---|---|
| 1 | admin 로그인 → `/admin/wiki` 진입 | admin user |
| 2 | 해당 entity 화면 (마구/등급/스탯 영향) 으로 이동 | admin user |
| 3 | POST 폼 작성 + 제출 | admin user |
| 4 | BE 가 `@CacheEvict("wikiGameInfoByTarget", key=...)` 자동 호출 | BE |
| 5 | FE public `/wiki/game-info/{target}` 진입 시 react-query refetch | — |

#### 8.3.2 SQL 직접 경로 (1차 시드 / 긴급)

| 단계 | 작업 | 담당 |
|---|---|---|
| 1 | `sql/insertData/INSERT_WIKI_GAME_INFO.sql` 또는 신규 SQL 파일에 INSERT 작성 | 사용자 (Q6 결정) |
| 2 | 운영 DB 적용 (ops 표준 절차) | ops |
| 3 | 서버 재기동 OR `@CacheEvict` 트리거 | BE |

> 시드 SQL 템플릿은 `_tasks.md § DB.3` 참조 (placeholder 위주 — 실제 값은 사용자 채움).

### 8.4 EPIC 등급 신설 절차 (BE 보강)

| 단계 | 작업 | 담당 |
|---|---|---|
| 1 | `SkillSetResponse` record 에 `List<SkillItemResponse> epic` 필드 추가 | BE |
| 2 | `PlayerSkillsServiceImpl` 빌더에 `grouped.getOrDefault(EPIC, List.of())` 추가 | BE |
| 3 | 캐시 무효화 (`@CacheEvict("playerSkillSetByTarget")`) | BE |
| 4 | FE `WikiSkillScreen` grade 섹션 매핑에 EPIC 추가 | FE |
| 5 | EPIC grade 표시 색 token 디자인 (`web/src/global/styles/**`) | designer |
| 6 | 회귀: `domain/skill/*` 외 호출처 = 없음 (grep 검증 완료) → simulate 도메인 부재 | BE |

### 8.5 권한 / 보안 변경 절차

🔴 ADMIN role 신규 분기는 **사용자 메모리** (`project_auth_model.md`, B2C 단일 권한 단순 2단계) 부합 — 본 사이클에서 허용.
권한 모델 추가 변경 (Role 세분화 / SuperAdmin 등) 시 = **신규 사이클 진입** (본 도메인 외 글로벌 정책).

---

| # | 마커 | 항목 | 가정값 | 결정 시점 |
|---|---|---|---|---|
| 1 | ✅ | feature prefix=`ENC` (R1 Q3) | 확정 | R1 — confirm 완료 |
| 2 | ✅ | 도메인 키 `wiki` (R1 Q4) | 확정 | R1 — confirm 완료 |
| 3 | ✅ | 게임 정보 자료 출처 = DB+admin (R1 Q1) | 확정 (Q1=C) | R1 — confirm 완료 |
| 4 | ✅ | public 노출 OK (R1 Q2) | 확정 | R1 — confirm 완료 |
| 5 | ✅ | game-info admin CRUD = 본 사이클 포함 (R3 Q5) | 확정 (포함) | R3 — confirm 완료 |
| 6 | ✅ | 1차 시드 SQL = 사용자 작성 (R3 Q6) | 확정 (사용자) | R3 — confirm 완료 |
| 7 | 🟨 가정 | BE `SkillSetResponse` EPIC 보강 (5종) — develop 트랙 작업 | 보강 | R3 BE dispatch |
| 8 | 🟨 가정 | URL `/encyclopedia` → `/wiki` 변경 (develop 트랙) | 변경 | R3 FE dispatch |
| 9 | 🟨 가정 | 스킬 상세 = 모달 (URL 변경 X) | 모달 | R3 designer 검증 |
| 10 | 🟨 가정 | 추천 조합 카드 클릭 시 점수 breakdown 모달 — 1차 PoC 포함 | 포함 | R3 confirm |
| 11 | 🟨 가정 | TopBar variant=default, 자체 헤더 X | default | R3 designer |
| 12 | 🟨 가정 | DB schema (wiki_pitch / wiki_pitch_grade / wiki_stat_influence) | 제안값 채택 | R3 BE 확정 |
| 13 | 🟨 가정 | swing 전용 테이블 (`wiki_swing`) — HITTER 마구 대체. PoC 단계는 stat_influence 단독 | PoC 단독 | R3 BE 검토 |
| 14 | 🟨 가정 | admin Drawer 진입점 = "관리자 페이지" 라벨 (user.role==ADMIN 일 때만) | 라벨 채택 | R3 designer |
| 15 | 🟨 가정 | `AdminRoute` 가드 — `useAuthentication().user.role==='ADMIN'` 검사 | 채택 | R3 FE dispatch |
| 16 | ❓ 미정 | KPI 목표값 (home→wiki 진입율 10%, 추천 체류 30초) | 제안값 | 사용자 검토 |
| 17 | ❓ 미정 | 검색 input debounce 시간 (300ms?) / 칩 토글 인터랙션 | designer 결정 | R3 designer |
| 18 | ❓ 미정 | wiki_pitch DELETE 시 자식 grade CASCADE 정책 (soft cascade vs reject) | soft cascade 채택 | R3 BE 결정 |
| 19 | ❓ 미정 | 낙관적 lock (version 컬럼) 도입 | PoC 단계 X | 후속 사이클 |
