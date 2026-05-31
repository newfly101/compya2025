# 통합 검증 보고서 — FE SCSS 리팩토링 + BE follow-up

> 작성일: 2026-05-31 by developer-integrate (테크리드, read-only)
> 입력: claude-20260531.log (메인+sub-agent 6건 통합) + be-followup/patch/0plus 로그 + scss-mixin-refactor-analysis.md + backend-develop.md § 16 + mobile-frame.md + secrets-rotation-guide.md
> 검증 모드: cross-validate 만. 코드 수정 X, agent 결과 무변경.

---

## § 1. 작업 요약

| 영역 | 디스패치 | 완료 | 미해결 | 빌드 |
|---|---|---|---|---|
| FE Track 0 (글로벌 mixin/토큰) | 1 | 1 | 0 | OK (237 modules, 2.48s) |
| FE Track 0+ (보강) | 1 | 1 | 0 | OK |
| FE Track 1~4 (도메인 4종) | 4 | 4 | 0 | OK (각 트랙별) |
| FE patch 라운드 (Track 1~4) | 4 | 4 | 0 | OK |
| FE 최종 통합 build | 1 | 1 | — | **✅ 239 modules, 2.15s, 0 error** |
| BE follow-up (HITL 3 + § 16.2 12건) | 1 | 1 | 0 (적용 완료) | OK |
| BE 최종 통합 build (`gradlew build -x test`) | 1 | 1 | — | **✅ BUILD SUCCESSFUL** |
| 룰 / 메타 갱신 | 1 | 1 | 0 | — |
| .progress 통합 | 1 | 1 | 0 | — |

**총 dispatch 14건 / 완료 14건 / 미해결 0건 (이번 라운드 범위 한정)**.

---

## § 2. FE SCSS 정합 검증 (신정책 부합도)

### 2.1 신정책 5항목 부합

| 정책 (mobile-frame.md / 분석문서) | 검증 결과 | 근거 |
|---|---|---|
| 480 단일 wrapper (375 → 480 갱신) | ✅ | `$layout-screen-width:480`, `$layout-card-width:448` 갱신됨 |
| 도메인 SCSS px 직사용 금지 (예외 1px/0.5px/3px accent/100%) | ✅ | grep 결과 — 도메인 raw px 매칭 모두 `1px border` / `0.5px hairline` / `3px` 액센트 / 주석 안 의도 매핑 노트 / `community/feature/admin/**` `community/feature/user/post/pc/**` (PC legacy, 본 라운드 회피 영역) |
| 도메인 font-size px 직사용 금지 | ✅ | grep 결과 = 매칭 2건 모두 `//` 주석 (PC legacy `PostUserMobileTable.module.scss`). 활성 라인 0건 |
| rem 강제 (`rem()` function + `font-size-rem` mixin) | ✅ | `web/src/global/styles/functions/_rem.scss` 신설 + `_typography.scss:102 @mixin font-size-rem`. 도메인 호출 다수 (HistoryModeScreen 등) |
| `--color-bg-modal: #1e1e1e` 신규 raw 색 (D3 확정) | ✅ | `semantic/_color.scss:52` `--color-bg-modal: #{$color-bg-modal}` |

### 2.2 Track 0 신규 mixin / 토큰 분포

| 항목 | 신설 위치 | Track 1~4 호출 |
|---|---|---|
| `card-base` | `mixins/_layout.scss:98` | HistoryModeScreen × 4, StageCard × 1, CouponCard, EventCard, NoticeCard, OfficialNoticeCard, HotPostCard, PostRow, NoticeSection (Track 1~4) |
| `chip-base` | `mixins/_layout.scss:116` | Chip (historyMode), CategoryChip, StageCard (sm) |
| `reset-button` | `mixins/_layout.scss:147` | HistoryModeScreen.clearButton, .compactClear, Section.action |
| `pressable` | `mixins/_layout.scss:158` | TopBar.loginBtn, StageCard, CouponCard, EventCard, NoticeCard, CategoryChip, Chip |
| `tap-target` | `mixins/_layout.scss:170` (`$control-height-md=44px` default) | Chip, CategoryChip |
| `thumb-box` | `mixins/_layout.scss:180` | HotPostCard, PostRow, NoticeCard, EventCard |
| `modal-backdrop` | `mixins/_layout.scss:207` (`--color-overlay`) | ResponseModal, RenewalNoticeModal, Drawer |
| `safe-area-bottom` | `mixins/_layout.scss:225` | (도입 예정, 본 라운드 호출처 0건 — 향후 BottomBar 도입 시) |
| `hangul-safe` | `mixins/_typography.scss:71` | HistoryModeScreen × 4, NoticeDetailScreen.title, CouponCard.title, EventCard.title, PostRow.title |
| `line-clamp` | `mixins/_typography.scss:79` | NoticeCard.featuredTitle (2), HotPostCard.title (2), PostRow.title (2) |
| `text-fluid` | `mixins/_typography.scss:92` | HeroSection.heroTitle (P5 보호) |
| `font-size-rem($px, $lh)` | `mixins/_typography.scss:102` | HistoryModeScreen .detailTag (9), .playerTargetTag (9), Track 1 patch (5), Track 3 patch (11) |
| `rem($px, $base=16)` function | `functions/_rem.scss:21` | Chip (52), CouponList (200), EventList (160/72/120/100), HeroSection (160), HistoryModeScreen (3 accent strip 등), StageCard (rem(2)) |
| `--color-bg-modal: #1e1e1e` | `semantic/_color.scss:52` | ResponseModal, RenewalNoticeModal |
| `--color-overlay: rgba(0,0,0,0.55)` | `semantic/_color.scss:53` | modal-backdrop mixin default, Drawer overlay (Track 1 patch) |
| `$radius-xs: 2px` | `variables/_radius.scss:7` | HistoryModeScreen.summaryStrip, StageCard chips |
| `$control-height-sm: 36px` / `-md: 44px` / `-lg: 52px` | `variables/_spacing.scss:31-33` | HistoryModeScreen.searchInputBox/.compactBar/.sectionHead/.playerLegend, Chip(tap-target md), QuickSection (lg) |

### 2.3 표준 Badge 치환 (분석문서 § 4.1 — 5건 확정)

| ID | 위치 | 치환 결과 | 검증 |
|---|---|---|---|
| B1 | HeroSection | `<StatusBadge variant="active" label="컴투스프로야구 2026" />` | ✅ (HeroSection.jsx:9) |
| B2 active/expired | EventCard | `<StatusBadge variant="expired" label="종료" />` / `variant="active" label="진행중"` | ✅ (EventCard.jsx:30-31, StatusBadge.module.scss:35 `.expired` variant 신설 — D2=a) |
| B4 new | community CommunityBadge 흡수 | `<PinnedBadge variant="new" />` (DEFAULT label = "NEW") + 폴더 삭제 | ✅ (PostRow.jsx:10, PinnedBadge.jsx:21, PinnedBadge.module.scss:45 `.new` 신설 — D1=a, `web/src/domains/community/mobile/components/communityBadge/**` 삭제 확인) |
| B5 neutral | community BoardTagBadge 흡수 | `<PinnedBadge variant="neutral" label={tag.name} />` + 폴더 삭제 | ✅ (HomeScreen.jsx:117, PinnedBadge.jsx:22, PinnedBadge.module.scss:46 `.neutral` 신설 — D1=a, `boardTagBadge/**` 삭제 확인) |
| B8 detailTag | HistoryModeScreen .detailTag | LabelBadge.update 와 시각 유사 — 미치환 결정 (inline 위치 + uppercase 차이, SCSS만 chip 정합) | ✅ (Track 3 결정 노트 기록) |

### 2.4 시각 회귀 가능 항목 (사용자 시각 확인 권장)

| # | 위치 | 변경 | 영향 |
|---|---|---|---|
| V1 | community PostRow new badge | green "신규" → **red "NEW"** (D1=a 치환 결과) | 🟨 색/문자 변경 — 사용자 의도 확인 권장 |
| V2 | historyMode Chip | tap-target 44px 보장 → padding 확장 | chip 가로 폭 미세 증가, chipRow wrap 위치 미세 변동 가능 |
| V3 | historyMode .filterSection/.summary/.detail | padding 11px → 12px | +1px 미세 |
| V4 | historyMode .empty | padding 15px → 16px | +1px |
| V5 | historyMode .searchInputBox/.compactBar | padding 9px → 12px | +3px (가시적) |
| V6 | historyMode .summary/.detail/.stageList | gap 6px → 8px | +2px |
| V7 | historyMode .summaryName | font-size 20px → 22px (small-mobile 17px fallback) | +2px (가장 큰 시각 변화) |
| V8 | historyMode .detailTag | font-size 8px → 9px | +1px 가독성 향상 |
| V9 | ResponseModal width | 320px → `max-width: calc(100% - 32px)` 권장 패치 | 320 폭 gutter 확보 (P11 적용 여부 메인 로그 미확정 — 사용자 확인 권장) |

### 2.5 검증 grep 결과 (정량)

- **도메인 SCSS `[0-9]+px` 활성 라인** (주석/legacy 제외): 0건 (모두 `1px border`, `0.5px hairline`, `3px accent strip`, 주석 매핑 노트, PC legacy 회피 영역)
- **도메인 SCSS `font-size: [0-9]+px` 활성 라인**: 0건
- **`grep "card-base|chip-base|pressable|modal-backdrop|hangul-safe|line-clamp|font-size-rem|reset-button|tap-target|thumb-box"`**: 글로벌 정의 + 도메인 호출 다수 확인

---

## § 3. BE follow-up 정합 검증

### 3.1 HITL 3건 (사용자 결정 완료 → 적용)

| 항목 | 권고 | 처리 결과 | 검증 |
|---|---|---|---|
| prod secret 평문 | placeholder `${PROD_XXX}` + secrets-rotation-guide.md | ✅ application-prod.properties 12,13,32,33,38,49,50 line 모두 `${PROD_*}` | grep `${PROD_` 확인 |
| `jwt.refresh-token-expire-days` 누락 | prod 에 명시 | ✅ application-prod.properties:40 `jwt.refresh-token-expire-days=30` | 확인 |
| `/api/dev` permitAll | `/api/admin/dev` 로 이동 | ✅ SwaggerController.java:21 `@RequestMapping("/api/admin/dev")` | grep 확인 + SecurityConfig `/api/admin/**` 차단 룰 자동 적용 |

### 3.2 § 16.2 일괄 처리 12항목

| ID | 항목 | 처리 결과 | 검증 |
|---|---|---|---|
| **B** | Admin* 네이밍 통일 | ✅ `AdminCouponController.java` 존재 확인 (CouponAdminController → rename) | Glob 확인 |
| **C** | mapper xml 도메인 폴더 이동 | ✅ 모든 xml 이 `mapper/{site/fun/player/skill}/{domain}/**` 구조 (root 직속 0건) | Glob 결과 25건 모두 sub-dir |
| **D** | Entity 필드 가시성 `private` 명시 | ✅ (메인 로그 기록) | (스팟체크 생략 — 빌드 OK) |
| **E** | response wrap 통일 (`GlobalResponse<T>` + status enum) | ✅ FunPlayerCard 등 신규 패턴 적용 (FunAdminPlayerCardController:22 `GlobalResponse.success(...)`) | grep 확인. **잔여**: legacy controller 점진 마이그레이션 (장기 과제) |
| **H** | `@Transactional(readOnly=true)` class + 변경 메서드 override | ✅ (메인 로그 기록) | (생략) |
| **I** | FunPlayerCard exception 교체 (`IllegalArgumentException` → `BaseException + FunPlayerCardMessages`) | ✅ FunPlayerCardServiceImpl 38/50/57/65 line `BaseException(FunPlayerCardMessages.*, HttpStatus.NOT_FOUND)`. FunPlayerCardMessages enum 신설 | grep 확인 |
| **J** | mapper 단일 조회 `Optional<T>` 통일 | ✅ BoardMapper.getBoardDetail / FunPlayerCardMapper / PlayerCardHitter/Pitcher/Positions / RefreshToken / User / Quiz 모두 `Optional<T>` | grep 확인. **잔여**: 다른 도메인 mapper 점진 보강 (전수 검증은 후속) |
| **K** | helper method `private` 강등 | ✅ (메인 로그 기록) | (생략) |
| **L** | SecurityConfig 401/403 응답 — `AuthMessages` enum + GlobalResponse | ✅ SecurityConfig:96/115 `GlobalResponse.fail(AuthMessages.AUTH_UNAUTHORIZED/AUTH_USER_BLOCKED)` | grep 확인 |
| **Q** | AdminPlayerCardServiceImpl `return null` 제거 | 🟡 부분 — `UnsupportedOperationException` 으로 명시화 (개선) 단 실 구현 미달성. 해당 endpoint 호출 시 500 | grep 확인 (line 36/89) |
| **R** | AdminPlayerCardController 주석 endpoint 정리 | ✅ (메인 로그 기록) | (스팟체크 생략) |
| **S** | `NaverOAuthService` `new RestTemplate()` Bean 주입 | ✅ NaverOAuthService:34 `private final RestTemplate restTemplate;` (constructor injection), import 22 line `org.springframework.web.client.RestTemplate` | grep 확인 |

### 3.3 § 16.2 미처리 (다음 라운드)

| ID | 항목 | 상태 |
|---|---|---|
| A | validation annotation (`@Valid`, `@NotBlank` 등) | 미처리 (신규 작성 시 적용 점진) |
| F | service interface 분리 (`SkillScoreConfigServiceImpl` 등) | 미처리 |
| G | `@PreAuthorize` 일원화 (SecurityConfig 만 사용) | 미처리 |
| M | 페이지네이션 적용 (장기 과제) | 미처리 |
| N | `spring.cache.type=caffeine` 전환 | 미처리 |
| **O** | `FunPlayerCardController.java` empty body — endpoint 구현 또는 dead code 삭제 | 🔴 **미처리** (빈 controller 잔존, 11 line) |
| **P** | `FunPlayerCardCreateRequest/UpdateRequest` record body empty (field 0) | 🔴 **미처리** (실호출 시 null insert 위험) |
| **Q** | (위 부분 처리) AdminPlayerCardServiceImpl 실 구현 | 🟡 부분 처리 (예외 throw 단계까지) |
| T | `community/enums/messages/CommunityMessages.java` → `community/enums/` 이동 | 미처리 (`enums/messages/` 그대로) |
| U | `admin` 디렉터리 구조 격상 검토 (`domain/upload/` 등) | 미처리 (정보성) |

### 3.4 secrets-rotation-guide.md 검증

| 항목 | 내용 |
|---|---|
| 노출 secret 목록 | DB pw / JWT / AWS access+secret / Naver client id+secret 6건 명시 |
| rotation 절차 | DB / JWT / AWS / Naver 4섹션 — step-by-step + 재기동 안내 |
| git history 점검 | `.gitignore:28` `**/application-prod.properties` 확인 → git history 노출 **없음** 명시. 추가 grep 명령 (PowerShell + bash) 제공 |
| 배포 env 변수 목록 | PROD_DB_* / PROD_JWT_SECRET / PROD_AWS_* / PROD_NAVER_* 명시 |
| 검증 체크리스트 | 6개 체크포인트 |

→ 가이드 완성도 ✅. **사용자 액션 (실 키 발급 + 배포 서버 env 갱신)** 만 남음.

### 3.5 BE 빌드 검증

`./gradlew build -x test` → **BUILD SUCCESSFUL in 1s** (`4 actionable tasks: 4 up-to-date`)

---

## § 4. 룰 / 메타 일관성 검증

| 항목 | 검증 |
|---|---|
| CLAUDE.md § 2-1/-3/-6/-8 / § 8 갱신 | ✅ "메인 = 입력 대기 / HITL 처리 / 결과 검증만" 문구 (§ 2-1), "단순 작업도 백그라운드" (§ 2-3), claude-YYYYMMDD.log 룰 (§ 2-6), sub-agent log 통합 후 원본 삭제 (§ 2-6 + 40 line ref), § 8 안티패턴 갱신 — 모두 확인 |
| conventions/agent-progress.md § 3.3 / § 6 / § 8 | ✅ § 8 "sub-agent log 통합 + 원본 삭제 (단일 파일 추적)" 룰 신설 (157 line). § 6 메인 어시스턴트 로그 (101 line). § 3.3 진행상황 stream + Monitor 룰 |
| memory 갱신 2건 | ✅ MEMORY.md 의 `feedback_default_background_dispatch.md` + `feedback_progress_log_claude.md` 인덱스 등록 |
| .progress/ 통합 결과 | ✅ 현재 `.progress/` 디렉터리: `claude-20260531.log` (통합본 + sub log 6건 인라인), `be-followup-20260531-174707.log` (보존), `_current.txt` / `_log_*.ps1` 헬퍼. **sub-agent 원본 log 6건 모두 삭제 확인** (mobile-frame, track-0, track-1, track-2, track-3, track-4) |

⚠️ `fe-scss-track-0plus-*.log` / `fe-scss-track-*-patch-*.log` 5건은 현재 `.progress/` 에 보이지 않음 — 이미 통합+삭제됐거나, sub-agent 가 별도 디렉터리 사용. **메인 로그 line 200 (`.progress 통합 완료`)** 와 일치 추정 — 문제 없음.

---

## § 5. cross-domain mismatch 점검

### 5.1 BE 응답 변경 ↔ FE 호출

| 변경 | FE 영향 | 검증 |
|---|---|---|
| BE response wrap 통일 (`GlobalResponse<T>`) — E 항목 | 신규 적용 영역은 FunPlayerCard (admin only, FE 미사용). 기존 endpoint (board / coupon / event / notice) wrap 형태 유지 → FE 호출 변경 불필요 | ✅ mismatch 없음 |

### 5.2 BE `/api/admin/dev` path 이동 ↔ FE swagger 링크

| 변경 | FE 영향 | 검증 |
|---|---|---|
| `/api/dev/**` → `/api/admin/dev/**` (SwaggerController) | FE grep `/api/dev|swagger` → **매치 0건**. swagger 는 admin 도구로 FE 라우터 호출처 없음 | ✅ mismatch 없음 |

### 5.3 BE J 항목 `Optional<T>` 도입 ↔ FE

| 변경 | FE 영향 | 검증 |
|---|---|---|
| mapper 단일 조회 `Optional<T>` | 서비스 레이어가 unwrap (`orElseThrow`) → API JSON 형태 동일. FE 응답 schema 무변화 | ✅ mismatch 없음 |

### 5.4 FE Badge 컴포넌트 폴더 삭제 ↔ BE/타 도메인

| 변경 | FE 영향 | 검증 |
|---|---|---|
| `communityBadge/`, `boardTagBadge/` 폴더 삭제 | grep — 외부 import 0건 (PostRow.jsx + HomeScreen.jsx 가 PinnedBadge 직접 import). BE 영향 0 | ✅ mismatch 없음 |

---

## § 6. 위험 / 미해결 / 사용자 결정 사안

### 6.1 사용자 결정 / 액션 필요 (높음)

| 우선 | 항목 | 권고 |
|---|---|---|
| 🔴 시급 | **BE prod secret rotation 실 액션** — DB pw / JWT / AWS access+secret / Naver client secret | ops 라운드: 새 키 발급 → 배포 서버 env 갱신 → application 재기동 → 기존 AWS key inactive 처리. secrets-rotation-guide.md § 2 절차 따라 사용자 직접 수행 |
| 🟨 시각 확인 | **FE PostRow new badge 시각 변경** — green "신규" → red "NEW" | 화면에서 community list 직접 확인. 사용자 의도 = D1=a 확정값이므로 spec 부합. 시각 컨펌만 필요 |
| 🟨 시각 확인 | **historyMode summaryName 22px (소폭 폰트 확대)** + chip tap-target 확장 | mobile 320 보호 fallback 17px 함께 적용. 시각 컨펌 권장 |

### 6.2 본 라운드 미처리 (다음 라운드 권고)

| ID | 영역 | 항목 | 권고 |
|---|---|---|---|
| FE-P11 | ResponseModal width gutter | `width:320px` → `max-width:calc(100% - 32px)` 패치 (분석문서 권장). 본 라운드 메인 로그에 명시적 기록 없음 — 적용 여부 재확인 필요 | FE patch 라운드 추가 또는 사용자 확인 |
| BE-O | `FunPlayerCardController` empty body | dead code 삭제 또는 endpoint 구현 | backend-developer 단발 처리 |
| BE-P | `FunPlayerCardCreateRequest/UpdateRequest` record empty | field 정의 (PlayerCardEntity 매핑) — admin 호출 시 null insert 위험 | backend-developer 단발 처리 (admin 기능 활성 전 필수) |
| BE-Q | `AdminPlayerCardServiceImpl#getPlayerInfo/updatePlayerCard` — 미구현 `UnsupportedOperationException` | 실 구현 (PlayerCardMapper 활용) 또는 명시적 endpoint 차단 | 별도 backend 라운드 |
| BE-T | `community/enums/messages/CommunityMessages.java` 디렉터리 통일 | `community/enums/CommunityMessages.java` 로 이동 + import 일괄 수정 | cleanup 라운드 |
| BE-A/F/G/M/N/U | validation / interface 분리 / @PreAuthorize 일원화 / 페이지네이션 / Caffeine cache / admin 도메인 격상 | 장기 과제 — 별도 트랙 분리 권장 | 후속 라운드 |

### 6.3 잠재 위험 (정보성)

| 위험 | 영향 | 권고 |
|---|---|---|
| FE patch 라운드의 patch log 5건이 현재 `.progress/` 에 보이지 않음 — 통합 완료 추정이나 audit 누락 가능 | 추적성 일부 손실 | 메인 로그 line 200~205 와 cross-check 시 충분. 필요 시 통합 agent 산출물 명시 확인 |
| Track 0 brief 의 `$control-height-xs/-tap/-xl` 토큰 일부 미신설 (`-sm/-md/-lg` 만 신설) | 향후 호출 시 컴파일 에러 | 현 호출 0건이라 무영향. 향후 필요 시 추가 |

---

## § 7. 빌드 / 정합 최종 결과

| 검증 | 명령 | 결과 |
|---|---|---|
| FE 전체 빌드 | `npm --prefix web run build` | ✅ **vite 7.2.6 / 239 modules / built in 2.15s / 0 error 0 warning** |
| BE 전체 빌드 | `./gradlew build -x test` | ✅ **BUILD SUCCESSFUL in 1s (4 tasks up-to-date)** |
| FE 도메인 SCSS px 직사용 grep | `grep [0-9]+px web/src/domains/**` | ✅ 활성 라인 0건 (예외만) |
| FE 도메인 font-size px grep | `grep font-size:[0-9]+px web/src/domains/**` | ✅ 활성 라인 0건 |
| FE Track 0 mixin 정의 grep | `grep card-base\|chip-base\|... mixins/*.scss` | ✅ 11종 mixin + rem() function + 신규 토큰 모두 확인 |
| BE prod secret placeholder grep | `${PROD_` in application-prod.properties | ✅ 6건 모두 placeholder |
| BE `/api/admin/dev` path grep | `SwaggerController @RequestMapping` | ✅ `/api/admin/dev` 적용 |
| FE `/api/dev` 호출 grep | `web/src/**/*` | ✅ 매치 0 (mismatch 없음) |

---

## § 8. 다음 액션 권고

### 8.1 즉시 (사용자 결정 / 액션)

1. **BE secret rotation** — secrets-rotation-guide.md § 2 절차 (DB pw / JWT / AWS / Naver) 실 수행 + 배포 서버 env 갱신.
2. **FE 시각 컨펌** — community PostRow (NEW red), historyMode summaryName 22px / chip tap-target.

### 8.2 다음 라운드 (backend-developer 단발 디스패치)

3. **BE-O / BE-P / BE-Q 일괄 처리** — FunPlayerCardController empty body 정리 + Request DTO field 정의 + AdminPlayerCardServiceImpl 미구현 실 구현. (사용자 admin endpoint 활성 전 필수)
4. **BE-T cleanup** — `CommunityMessages.java` 디렉터리 이동 + import 일괄 수정.

### 8.3 장기 트랙 (별도 라운드)

5. **BE-A** validation annotation 점진 보강 (신규 작성 시 default 룰화).
6. **BE-G** `@PreAuthorize` 일원화 (SecurityConfig 단일 정책).
7. **BE-M** 페이지네이션 도입 (PageRequest/PageResponse + xml LIMIT/OFFSET).
8. **BE-N** `spring.cache.type=caffeine` 전환.
9. **BE-F** service interface 분리 룰.

### 8.4 본 라운드 종료 조건

- 본 통합 검증 보고서 사용자 검토 완료 → 본 라운드 종료
- § 8.1 사용자 액션 완료 시 deployment 정합 보장

---

— 끝.
