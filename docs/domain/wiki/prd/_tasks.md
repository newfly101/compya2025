# wiki 개발 task (R3 신규)

> 구현 history:
> - 2026-05-31 R3 신규 — planner-division Opus / dispatch brief 6건 (admin CRUD 흡수 후)
>
> 컨텍스트: [`_common.md`](./_common.md) / [`wiki.md`](./wiki.md) / [`_decision_log.md`](./_decision_log.md)
> 메인 어시스턴트가 본 파일의 각 § 를 sub-agent dispatch brief 로 그대로 활용.

---

## 0. 전체 그림 (요약 표)

| # | dispatch | 담당 agent | Edit 영역 | Read-only | 산출물 | 의존 |
|---|---|---|---|---|---|---|
| T1 | DB schema + 시드 템플릿 | (ops, 사용자 직접) | `sql/V3/site/CREATE_WIKI_TABLES.sql` (신규), `sql/insertData/INSERT_WIKI_GAME_INFO.sql` (신규 — 사용자 채움) | `sql/CREATE_TABLE.sql`, `sql/V2/site/*` | DDL 1 파일 + 시드 placeholder | 선행 (T2/T3 의존) |
| T2 | BE — public read + `SkillSetResponse` EPIC 보강 | backend-developer | `src/main/java/.../domain/wiki/**` (신규), `src/main/java/.../domain/skill/dto/response/SkillSetResponse.java`, `src/main/java/.../domain/skill/service/PlayerSkillsServiceImpl.java`, `src/main/resources/mapper/wiki/**` (신규) | `domain/skill/**` (재사용 패턴) | 컨트롤러/서비스/DTO/Mapper + EPIC 보강 | T1 |
| T3 | BE — admin CRUD | backend-developer | `domain/wiki/controller/Admin*.java`, `domain/wiki/service/admin/**`, `mapper/wiki/Admin*.xml` | `domain/player/controller/AdminPlayerCardController.java`, `config/SecurityConfig.java` | 3 admin 컨트롤러 + 서비스 + DTO + Mapper | T1, T2 |
| T4 | FE — public 5 screen + 모달 + URL 교체 | frontend-developer | `web/src/domains/wiki/**` (신규), `web/src/app/router/routes/PublicRoutes.jsx`, `web/src/app/router/config/{routePath,routeMeta}.js`, `QUICK_MENUS.js`, `MENU_GROUPS.js` | `web/src/domains/history_mode/**` (패턴 답습), `web/src/global/ui/mobile/**` | 5 screen + WikiSkillModal + react-query hooks + 라우트 | T2 |
| T5 | FE — admin 3 screen + 가드 + Drawer 진입점 | frontend-developer | `web/src/domains/wiki/admin/**` (신규), `web/src/app/router/guard/AdminRoute.jsx` (신규), `web/src/app/router/routes/AdminRoutes.jsx` (또는 PrivateRoutes 분기), `Drawer.jsx` | `useAuthentication.js` | admin 3 screen + 가드 + Drawer 신규 entry | T3, T4 |
| T6 | designer-render — Figma ↔ 컴포넌트 매핑 | designer-render | (figma plugin domain ts 작성) | `wiki.md § 4`, Figma 노드 (entry 83-2259 / list 83-2303 / 추천 86-3236) | figma-plugin domain ts + 토큰 추출 보고 | T4 (병렬 가능) |

---

## T1 — DB schema + 1차 시드 템플릿

### 1.1 목적
신규 DB 테이블 3종 + 시드 SQL placeholder 작성. 실제 값은 사용자 채움 (Q6 결정).

### 1.2 산출 위치
- 신규: `sql/V3/site/CREATE_WIKI_TABLES.sql`
- 신규: `sql/insertData/INSERT_WIKI_GAME_INFO.sql`

### 1.3 DDL (확정 — wiki.md § 4.5 schema 안 채택)

```sql
-- ============================================================
-- WIKI TABLES (V3)
-- ENC-5/6 (PITCHER/HITTER game-info) + admin CRUD 백킹
-- ============================================================

CREATE TABLE IF NOT EXISTS wiki_pitch (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    code          VARCHAR(30) NOT NULL UNIQUE,
    name          VARCHAR(50) NOT NULL,
    pitch_type    ENUM ('FASTBALL', 'BREAKING', 'OFFSPEED') NOT NULL,
    description   TEXT,
    display_order INT      DEFAULT 0,
    is_active     BOOLEAN  DEFAULT TRUE,
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pitch_type_active (pitch_type, is_active)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS wiki_pitch_grade (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    pitch_code    VARCHAR(30) NOT NULL,
    grade         CHAR(1)     NOT NULL,
    velocity_min  INT,
    velocity_max  INT,
    break_amount  INT,
    description   VARCHAR(255),
    created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_pitch_grade (pitch_code, grade),
    CONSTRAINT fk_wiki_pitch_grade_code FOREIGN KEY (pitch_code) REFERENCES wiki_pitch (code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE IF NOT EXISTS wiki_stat_influence (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    target           ENUM ('PITCHER', 'HITTER') NOT NULL,
    stat_code        VARCHAR(30) NOT NULL,
    influence_type   ENUM ('PITCH', 'SKILL', 'GENERAL') NOT NULL,
    influence_target VARCHAR(50) NOT NULL,
    weight           INT      DEFAULT 1,
    description      TEXT,
    display_order    INT      DEFAULT 0,
    is_active        BOOLEAN  DEFAULT TRUE,
    created_at       DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_target_active (target, is_active),
    INDEX idx_stat_code (stat_code)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
```

### 1.4 시드 SQL 템플릿 (사용자 채움 — placeholder)

```sql
-- ============================================================
-- WIKI GAME INFO 시드 (1차)
-- 사용자가 실제 값을 채워 운영 DB 에 적용
-- ============================================================

-- 1) 마구 (예시 — code/name/pitch_type/description 채움)
-- INSERT INTO wiki_pitch (code, name, pitch_type, description, display_order)
-- VALUES
--     ('FASTBALL_4SEAM', '포심패스트볼', 'FASTBALL', '<설명>', 1),
--     ('FASTBALL_2SEAM', '투심패스트볼', 'FASTBALL', '<설명>', 2),
--     ('CURVE',          '커브',         'BREAKING', '<설명>', 10);

-- 2) 마구 등급 (예시 — pitch_code/grade/velocity_min/velocity_max/break_amount 채움)
-- INSERT INTO wiki_pitch_grade (pitch_code, grade, velocity_min, velocity_max, break_amount, description)
-- VALUES
--     ('FASTBALL_4SEAM', 'S', 150, 160, 0, '<설명>'),
--     ('FASTBALL_4SEAM', 'A', 145, 150, 0, '<설명>');

-- 3) 스탯 영향 (예시 — target/stat_code/influence_type/influence_target/weight 채움)
-- INSERT INTO wiki_stat_influence (target, stat_code, influence_type, influence_target, weight, description, display_order)
-- VALUES
--     ('PITCHER', 'CONTROL',  'GENERAL', '제구',   5, '<설명>', 1),
--     ('PITCHER', 'VELOCITY', 'PITCH',   'FASTBALL_4SEAM', 4, '<설명>', 2),
--     ('HITTER',  'POWER',    'GENERAL', '장타',   5, '<설명>', 1);
```

### 1.5 검증
- 운영 DB 적용 후 `SELECT COUNT(*) FROM wiki_pitch` 등으로 시드 투입 여부 확인
- FK 위반: `wiki_pitch_grade.pitch_code` 가 `wiki_pitch.code` 에 존재해야 함

---

## T2 — BE public read + `SkillSetResponse` EPIC 보강

### 2.1 목적
- 신규 endpoint `GET /api/wiki/game-info/{target}` (ENC-5/6)
- 기존 `SkillSetResponse` EPIC 필드 보강 (ENC-1/2 EPIC 등급 누락 해결)

### 2.2 산출 위치
- 신규 패키지: `src/main/java/com/dawne/com2usbaseball/domain/wiki/`
  - `controller/WikiGameInfoController.java`
  - `service/WikiGameInfoService.java` + `WikiGameInfoServiceImpl.java`
  - `repository/WikiGameInfoRepository.java`
  - `dto/response/WikiGameInfoResponse.java` + `WikiPitchResponse.java` + `WikiPitchGradeResponse.java` + `WikiStatInfluenceResponse.java`
- 신규 Mapper: `src/main/resources/mapper/wiki/WikiGameInfoMapper.xml`
- 보강:
  - `src/main/java/com/dawne/com2usbaseball/domain/skill/dto/response/SkillSetResponse.java` — `List<SkillItemResponse> epic` 필드 추가
  - `src/main/java/com/dawne/com2usbaseball/domain/skill/service/PlayerSkillsServiceImpl.java` — 빌더에 `grouped.getOrDefault(Grade.EPIC, List.of())` 추가

### 2.3 API 스펙 (wiki.md § 5.2.1 참조)

```
GET /api/wiki/game-info/{target}
- path: target ∈ {PITCHER, HITTER}
- auth: permitAll
- cache: @Cacheable("wikiGameInfoByTarget", key="#target")
- 200: WikiGameInfoResponse (pitches[], pitchGrades[], statInfluences[])
- 400: target 미존재 (INVALID_TARGET)
```

### 2.4 회귀 검증
- grep `SkillSetResponse` — `domain/skill/*` 내부만 (simulate 도메인 부재 — 사전 확인 완료)
- FE 영향: 본 도메인 신규 작성이므로 무영향
- 빌드 후 `gradlew compileJava` 통과 확인

### 2.5 SecurityConfig
- `/api/wiki/**` permitAll 추가 (기존 `/api/skills/**` 패턴 답습)

### 2.6 sub-agent 보고 형식 (300줄 이하 엄수)
1. 산출 파일 경로 list
2. 신규 endpoint 응답 JSON 샘플 1건
3. EPIC 보강 후 `SkillSetResponse` 응답 JSON 샘플 (legend/epic/platinum/hero/normal 5종 키 표시)
4. `gradlew compileJava` 결과
5. 미해결 / HITL 마커

---

## T3 — BE admin CRUD

### 3.1 목적
admin endpoint 3 entity × 3 METHOD (POST/PUT/DELETE) + GET (admin viewer, is_active=false 포함)

### 3.2 산출 위치
- `src/main/java/.../domain/wiki/controller/`
  - `AdminWikiPitchController.java`
  - `AdminWikiPitchGradeController.java`
  - `AdminWikiStatInfluenceController.java`
  - `AdminWikiGameInfoController.java` (viewer)
- `src/main/java/.../domain/wiki/service/admin/` (신규 sub-package)
  - 각 entity 별 Service + ServiceImpl
- `src/main/java/.../domain/wiki/dto/request/`
  - `WikiPitchRequest.java`, `WikiPitchGradeRequest.java`, `WikiStatInfluenceRequest.java`
- `src/main/resources/mapper/wiki/`
  - `AdminWikiPitchMapper.xml`, `AdminWikiPitchGradeMapper.xml`, `AdminWikiStatInfluenceMapper.xml`

### 3.3 패턴 (참조)
- `src/main/java/.../domain/player/controller/AdminPlayerCardController.java` — admin controller 표준 패턴
- `src/main/java/.../domain/event/controller/AdminEventController.java` — 동일

### 3.4 권한
- 클래스 레벨 `@PreAuthorize("hasRole('ADMIN')")`
- `SecurityConfig` — `/api/admin/wiki/**` 가 기존 `/api/admin/**` 룰에 포함되는지 검증 → 미포함 시 명시 추가
- 🔴 ADMIN role 분기 = 사용자 메모리 부합 (자체 결정 X)

### 3.5 룰 (wiki.md § 6.6 예외 케이스 반영)
- UNIQUE 위반 → 409 `DUPLICATE_CODE`
- FK 위반 → 400 `INVALID_PITCH_CODE`
- soft delete: `wiki_pitch` / `wiki_stat_influence` (is_active=false)
- hard delete: `wiki_pitch_grade` (FK 정합 보장 후)
- DELETE wiki_pitch 시 자식 grade soft cascade (is_active=false)
- write 시 `@CacheEvict("wikiGameInfoByTarget", allEntries=true)` 트리거

### 3.6 sub-agent 보고 (300줄 이하)
1. 9 endpoint × spec 표
2. SecurityConfig 변경 line
3. 캐시 무효화 적용 위치
4. 빌드 통과 결과

---

## T4 — FE public 5 screen + 모달 + URL 교체

### 4.1 목적
- 5 screen + 1 모달 작성
- 라우트 등록 + URL `/encyclopedia` → `/wiki` 교체

### 4.2 산출 위치
- 신규: `web/src/domains/wiki/`
  - `screens/WikiScreen.jsx` (ENC-0)
  - `screens/WikiSkillScreen.jsx` (ENC-1/2 — target prop)
  - `screens/WikiRecommendScreen.jsx` (ENC-3/4 — target prop)
  - `screens/WikiGameInfoScreen.jsx` (ENC-5/6 — target prop)
  - `components/WikiSkillModal.jsx`
  - `components/WikiCategoryGrid.jsx` (inline OK — 단일 페이지)
  - `hooks/useSkills.js` (react-query — `["skills", target]`)
  - `hooks/useWikiGameInfo.js` (react-query — `["wiki-game-info", target]`)
  - `config/WIKI_CATEGORIES.js`
- 보강:
  - `web/src/app/router/routes/PublicRoutes.jsx` — lazy import 5 screen
  - `web/src/app/router/config/routePath.js` — `wiki`, `wiki_skill_pattern`, `wiki_recommend_pattern`, `wiki_game_info_pattern`
  - `web/src/app/router/config/routeMeta.js` — `WIKI` 그룹 신규
  - `web/src/domains/home/config/QUICK_MENUS.js:6` — `/encyclopedia` → `/wiki`, `comingSoon: false` (또는 제거)
  - `web/src/app/wrapper/mobile/config/MENU_GROUPS.js:15` — 동일

### 4.3 react-query 룰
- `useSkills`: staleTime 10분
- `useWikiGameInfo`: staleTime 30분 (변경 빈도 매우 낮음)
- error UI: retry 3회 후 "데이터를 불러올 수 없습니다" + 새로고침 버튼

### 4.4 컴포넌트 분리 룰
- `feedback_component_decomposition.md` 정합 — 단일 페이지 상태분기형 화면 sub컴포넌트 분리 최소화
- inline OK: `WikiCategoryGrid`, grade 섹션 헤더, 검색 input
- 외부 컴포넌트: `WikiSkillModal` 만 (재사용 = 2 화면에서 import)

### 4.5 적용 룰
- 자체 도메인 헤더 X — MobileLayout TopBar 통일 (`feedback_no_domain_header.md`)
- 반응형: `.claude/conventions/responsive-mobile-first.md`
- 디자인 토큰: 기존 `web/src/global/styles/**` 활용

### 4.6 sub-agent 보고 (300줄 이하)
1. 산출 파일 경로 list
2. 라우트 등록 변경 line
3. `npm run build` 결과
4. 화면별 검증 체크 (wiki.md § 7.1 QA-1~5 중 FE 가능 항목)

---

## T5 — FE admin 3 screen + 가드 + Drawer 진입점

### 5.1 목적
admin CRUD UI + 라우트 가드 + Drawer 진입점

### 5.2 산출 위치
- 신규: `web/src/domains/wiki/admin/`
  - `screens/AdminWikiScreen.jsx` (ENC-A0 entry)
  - `screens/AdminWikiPitchScreen.jsx` (ENC-A1)
  - `screens/AdminWikiPitchGradeScreen.jsx` (ENC-A2)
  - `screens/AdminWikiStatInfluenceScreen.jsx` (ENC-A3)
  - `components/WikiAdminForm.jsx` (entity 별 form — 공통 패턴 추출 가능 시)
  - `hooks/useAdminWiki*.js` — react-query mutations
- 신규: `web/src/app/router/guard/AdminRoute.jsx` — `useAuthentication().user?.role === 'ADMIN'` 검사 + redirect to `/` + toast
- 보강:
  - `web/src/app/router/routes/PublicRoutes.jsx` 또는 신규 `AdminRoutes.jsx` — admin route 등록 (가드 wrapping)
  - `web/src/app/wrapper/mobile/parts/Drawer.jsx` — 프로필 하단 "관리자 페이지" 진입점 (user.role==='ADMIN' 일 때만)
  - `web/src/app/router/config/routePath.js` — `admin_wiki`, `admin_wiki_pitches`, ... 등 신규

### 5.3 권한 UX
- 비admin URL 직접 진입: `AdminRoute` 가 redirect to `/` + toast "관리자 권한이 필요합니다"
- Drawer "관리자 페이지" 라벨 — non-admin 사용자에게는 비표시

### 5.4 form 룰
- 필수 필드 client 검증 + BE 400 메시지 fallback
- 성공 시 toast + list refresh (`queryClient.invalidateQueries`)
- delete 확인 모달 (실수 방지)

### 5.5 🔴 마커
- `useAuthentication.js` 의 `user.role` 필드 = backend OIDC claim 또는 DB role 컬럼 매핑 확인 필요
- 본 사이클에서 role 필드 미존재 시 → BE/auth 보강 마커 (T2 또는 T3 에서 보강) — agent 가 자체 결정 X, brief 에 명시

### 5.6 sub-agent 보고 (300줄 이하)
1. 산출 파일 경로 list
2. AdminRoute 가드 동작 검증 (admin / non-admin / 비로그인 3 시나리오)
3. Drawer 진입점 노출 조건 검증
4. `npm run build` 결과

---

## T6 — designer-render (Figma ↔ 컴포넌트 매핑)

### 6.1 목적
Figma 노드 → FE 컴포넌트 매핑 + 디자인 토큰 추출 + figma-plugin domain ts 작성

### 6.2 대상 Figma 노드
| Figma node | 매핑 | 화면 |
|---|---|---|
| 83-2259 | `WikiScreen` (entry 그리드) | ENC-0 |
| 83-2303 | `WikiSkillScreen` (PITCHER) | ENC-1 |
| 83-2500 | `WikiSkillScreen` (HITTER) | ENC-2 |
| 86-3236 | `WikiRecommendScreen` | ENC-3/4 |
| (TBD) | `WikiGameInfoScreen` | ENC-5/6 — Figma 노드 부재 시 → designer 자체 와이어프레임 제안 |
| (TBD) | `AdminWikiScreen` 시리즈 | ENC-A0~A3 — admin Figma 노드 부재 가능성 ↑ → 표준 admin form 패턴 답습 |

### 6.3 산출
- figma-plugin domain ts 파일 — `code.ts` 신규 wiki 도메인 추가
- 토큰 추출 보고 (`docs/domain/wiki/design/tokens.md` 신규) — grade badge 색, 카드 spacing, 탭 indicator 등

### 6.4 적용 룰
- 적용 룰: `.claude/conventions/figma-plugin.md`
- 룰: `docs/global-guide/design/mobile-frame.md`

### 6.5 sub-agent 보고 (300줄 이하)
1. figma-plugin code.ts 변경 line
2. 매핑 표 (Figma node ↔ FE 컴포넌트 ↔ 토큰)
3. 누락 노드 (admin / game-info) — fallback 패턴 결정

---

## 자가 검증 (메인 어시스턴트가 dispatch 후)

| 검증 | 방법 |
|---|---|
| T1 DDL 정합 | SQL 파일 read + 컬럼명 정합 (wiki.md § 4.5 안과 일치) |
| T2 빌드 | `gradlew compileJava` |
| T2 EPIC 보강 | grep `epic` in `SkillSetResponse.java` |
| T3 admin 9 endpoint | grep `@PostMapping`, `@PutMapping`, `@DeleteMapping` in `AdminWiki*Controller.java` |
| T4 URL 교체 | grep `/encyclopedia` in `web/src/` — 0건이어야 함 (legacy redirect 외) |
| T4 빌드 | `npm run build` |
| T5 가드 | `AdminRoute.jsx` 존재 + Drawer admin 진입점 조건 |
| T6 figma | `figma/plugin/code.ts` wiki domain export 확인 |

---

## 미해결 / HITL 마커

| 마커 | 항목 | 처리 |
|---|---|---|
| 🔴 admin role | `useAuthentication.js` user.role 필드 확보 — BE/auth 보강 필요 시 별도 사이클 분리 가능 | T5 dispatch brief 명시 — agent 가 발견 시 마커 + 사용자 결정 대기 |
| 🟨 가정 | `SecurityConfig` `/api/admin/wiki/**` 가 기존 `/api/admin/**` 룰에 포함 — 미포함 시 명시 추가 | T3 dispatch brief 명시 |
| ❓ 미정 | KPI 목표값 사용자 확정 | R4 또는 운영 후 검토 |
| ❓ 미정 | wiki_pitch_grade 의 grade CASCADE 정책 | T3 BE 결정 — soft cascade 채택 |
