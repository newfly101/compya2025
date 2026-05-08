# risk-and-priority.md — 모바일 UI 리뉴얼 진행 시 우선 처리 위험

> 평가 기준:
> - **blast radius**: 의존 화면 수 + 운영 영향 범위
> - **모호도**: 정답이 spec 만으로 결정 가능한 정도 (높을수록 product 결정 필수)
> - **차단성**: 이 위험을 풀지 않으면 모바일 리뉴얼 다음 단계 (figma-spec-validator / runtime-analyzer) 진입 불가 여부

점수 표기: 🔥 critical / 🚨 high / ⚠ medium / ◐ low

---

## TOP 10 — 우선순위 정렬

### 🔥 1. coupon dual-write 정책 ↔ 코드 갭

- **출처**: `auth-and-flags.md:79`, `dual-management.md §1`, `services.md:64-66`, `db-map.md ★ Owner 확정 #2`
- **현상**: Owner 진술은 "의도된 dual-write 운영" 인데 실제 코드는 V2-only write + V1 단건 read fallback. `CouponAdminServiceImpl#createCoupon` 흐름이 site_coupons INSERT 후 coupons 에서 readback → coupons 에 시드 row 없으면 즉시 NPE/IllegalState
- **blast radius**: admin coupon 화면 (현재 라우트 주석 처리 = 운영 호출 0) + public `/coupons` 영향. **모바일 home / coupons 화면 운영 중** → 만약 coupons 가 비어있으면 home 빈 카드
- **모호도**: 매우 높음 — 정책 결정 필요
- **차단성**: ★ **차단** (admin coupon 화면 신규 작업 시 즉시 차단). public 화면은 read 만이라 차단 안 됨
- **권장 액션**:
  1. runtime-analyzer 가 운영 환경 `coupons` vs `site_coupons` row 수 비교
  2. Owner 결정: dual-write 굳히기 (service 양쪽 INSERT 추가) vs 단방향 정리 (selectCouponById 도 site_coupons 로 변경 후 coupons DROP)
  3. 결정 후 코드 적용

### 🔥 2. V2 `fun_player_card` 모듈 작동 불능

- **출처**: `be/dead-suspects.md A,B`, `mapper-mapping.md:96-108`, `dual-management.md §4`
- **현상**: 빈 컨트롤러 + 빈 DTO 3개 + 5개 mapper namespace mismatch + fun_teams row 0 추정 → 호출 시 100% 깨짐
- **blast radius**: V2 `/api/player-cards/**` 호출 시 즉시 BindingException. 현재 FE 호출 0건이라 운영 영향 0
- **모호도**: 낮음 — 기술적 fix 만 필요 (DTO + namespace + 시드 + 통합 service)
- **차단성**: ★ **차단** (모바일 player_card 화면 신규 작업 시). 현재 모바일 화면 없어서 미차단
- **권장 액션**:
  1. 모바일 player_card 화면 figma 발견 시 작업 진입 전 4개 fix:
     - DTO 필드 채우기 (FunPlayerCard{Create,Update}Request, FunPlayerCardResponse)
     - 5개 mapper xml namespace 수정 (`domain.fun.playerCard.mapper.*` → `domain.fun.playerCard.repository.mapper.*`)
     - fun_teams 시드 (teams 의 row 복사)
     - service 가 fun_player_card + stats + positions 통합 호출하도록 정리
  2. 화면 없을 동안은 동결

### 🔥 3. `state.auth.authority` shape 불일치 + setter `useRole` 오타

- **출처**: `fe/state-and-data.md:30,126`, `web/src/domains/authentication/store/slices.js:14-17` (spot-check 확인)
- **현상**:
  - slice initialState: `{ user, userRole, initialized }`
  - slice setter `setUser`: `const { userDetail, useRole } = action.payload` ★ 오타 (`useRole` ↔ `userRole`)
  - 소비처 (`UserProfile.jsx:7`, `useAuthentication.js:14`, `useHeaderAuth.js:7`) 가 `state.auth.authority` 참조 — 이 키는 slice 에 정의돼 있지 않음
- **blast radius**: 모든 권한 분기. UserProfile 화면, TopBar 인증 메뉴, AuthGuard 로직, admin 라우트 진입 — 전부 영향
- **모호도**: 낮음 — 명백한 오타 + 잘못된 키 참조
- **차단성**: ★ **차단** (모바일 인증 화면 / 권한 분기 동작 검증 필요)
- **권장 액션**:
  1. spot-check 추가: 실제 setter payload 가 어디서 dispatch 되는지 (`requestUserHealthCheck` thunk 응답 → setUser 액션 호출 경로)
  2. slice setter 수정: `useRole` → `userRole`, `userDetail` → `user` 매핑 명확화
  3. 소비처 `state.auth.authority` 참조를 `state.auth.userRole` 로 일괄 교체
  4. 또는 backwards-compat 위해 slice 에 `authority` 별칭 추가
  5. AuthGuard / 어드민 라우트 진입 동작 회귀 테스트

### 🚨 4. 권한 가드 누락 — `POST /api/upload/events`

- **출처**: `auth-and-flags.md:64`
- **현상**: `/api/upload/**` 가 `/api/admin/**` prefix 가 아니라 SecurityConfig URL 가드에 안 잡힘 → permitAll. 누구나 S3 PUT 가능
- **blast radius**: S3 무차별 PUT (스토리지 비용 / 컨텐츠 폴더 오염)
- **모호도**: 매우 낮음 — 명백한 보안 결함
- **차단성**: ◐ 모바일 리뉴얼 직접 차단 아님 (별개 보안 이슈). 단 즉시 fix 필요
- **권장 액션**:
  1. SecurityConfig 에 `/api/upload/**` `hasRole("ADMIN")` 추가
  2. 또는 컨트롤러 path 를 `/api/admin/upload/...` 로 이동

### 🚨 5. 권한 가드 누락 — `GET /api/dev/test-token`

- **출처**: `auth-and-flags.md:62`, `be/dead-suspects.md:55`
- **현상**: `permitAll` + ADMIN JWT 즉시 발급 하드코딩 (userId=1, role=ADMIN). 운영도 컨트롤러 살아있음
- **blast radius**: 인증 체계 전체 우회. ADMIN 권한 모든 endpoint 노출
- **모호도**: 매우 낮음
- **차단성**: ◐ 모바일 리뉴얼 직접 차단 아님. 즉시 fix 필요
- **권장 액션**:
  1. SecurityConfig 에 `/api/dev/**` denyAll 추가
  2. 또는 prod profile 에서 컨트롤러 비활성화 (`@Profile("!prod")`)

### ⚠ 6. `@PreAuthorize` decorative + `@EnableMethodSecurity` 미활성화

- **출처**: `auth-and-flags.md:43`
- **현상**: 3개 컨트롤러 (AdminCoupon, AdminEvent, AdminPlayerCard) 가 `@PreAuthorize("hasRole('ADMIN')")` 부착했지만 method security 미활성 → 무시됨
- **blast radius**: 다행히 모두 `/api/admin/**` prefix 라 URL 가드로 자연 보호. 단 향후 `/api/admin/**` 외 경로에 같은 어노테이션 사용하면 가드 부재
- **모호도**: 낮음 — 정리 방향 명확
- **차단성**: ◐
- **권장 액션**: `@EnableMethodSecurity` 추가 또는 어노테이션 제거 (URL 가드 만으로 통일)

### ⚠ 7. community 위장 신고/좋아요/댓글 — userId SecurityContext 매칭 X

- **출처**: `auth-and-flags.md:65`
- **현상**: post-reactions, comment-reactions, reports, comments 모든 endpoint 가 body/query 의 `userId/authorId/reporterId` 만 받고 SecurityContext 의 userId 와 매칭 검증 부재
- **blast radius**: 다른 사용자로 위장한 좋아요/신고/댓글 작성/삭제 가능
- **모호도**: 낮음 — 보안 결함
- **차단성**: ⚠ 모바일 community BE 연결 시 fix 필수 (현재 mock-only 이라 미차단)
- **권장 액션**: 모바일 community BE 연결 작업과 함께 controller 단 본인 검증 추가 (JwtAuthFilter 가 `request.getAttribute("userId")` 세팅하므로 이를 확인)

### ⚠ 8. `contact → discipline` 컬럼 의미 변경

- **출처**: `dual-management.md §6`
- **현상**: V1 `player_card_hitter_attributes.contact` (콘택트) ↔ V2 `fun_player_card_hitter_stats.discipline` (선구안). 코멘트는 양쪽 "선구" 동일하지만 영문 의미 다름 (contact = 방망이 맞추기, discipline = 볼 골라내기)
- **blast radius**: 카드 능력치 표시 / 시뮬레이터 / 카드 상세 모든 화면. **모바일 player_card 화면 신규 시 즉시 노출**
- **모호도**: 매우 높음 — Owner 도메인 결정 필수
- **차단성**: ★ **차단** (모바일 player_card 화면 작업 진입 전 결정 필요)
- **권장 액션**: Owner 도메인 의도 명확화 — (1) 단순 영문 표기 정정 (contact → discipline 의미 동일) / (2) 능력치 재정의 (contact 능력 폐기, discipline 으로 교체) — 결정 후 V1 데이터 마이그 정책 결정

### ⚠ 9. FE↔BE path 미스매치 (admin community / admin quiz / quiz public)

- **출처**: `fe-be-mismatch.md #8, #23-24, #31-43`
- **현상**:
  - quiz public: FE `/quiz-answers/latest` ↔ BE `/api/quiz/latest` (★ 호출 누락 + path 오류)
  - admin quiz: FE `/admin/quiz-answers*` ↔ BE `/api/admin/quiz*` (spot-check 확인)
  - admin community: FE `/community/admin/boards*` ↔ BE `/api/admin/boards*` (spot-check 확인)
  - admin notice: FE PATCH 사용 ↔ BE PUT (method 미스매치)
- **blast radius**: admin 화면 다수 + HomeScreen 빈 퀴즈 카드. admin 라우트 주석 처리된 항목은 운영 영향 0, 살아있는 admin community / admin quiz / admin notice 는 화면 진입 시 404
- **모호도**: 낮음 — path/method 정렬만 하면 됨
- **차단성**: ⚠ home 빈 퀴즈 카드는 모바일 리뉴얼 직접 영향. admin 은 PC 어드민이라 모바일 차단 아님
- **권장 액션**:
  1. FE endpoint 상수 일괄 수정 (FE 측 path 가 BE 매핑에 맞춰지도록)
  2. notice admin: FE PATCH → PUT 으로 변경 또는 BE 에 PATCH alias 추가
  3. quiz public: HomeScreen 에 `requestLatestQuizAnswer` dispatch 추가 + endpoints.js path 수정

### ⚠ 10. mock-only 화면 3개 + HomeScreen 부분 mock — figma-spec-validator base 부재

- **출처**: `fe/state-and-data.md:97-106,124`
- **현상**:
  - **CommunityScreen / CategoryScreen**: 100% mock (`@/data/community/*`)
  - **HistoryModeScreen**: 100% mock (`@/data/historyMode/*`)
  - **HomeScreen**: 부분 mock (quiz, 인기글, 자유게시판)
- **blast radius**: 모바일 핵심 진입 화면 4개. BE schema 와 정합성 검증 base 가 mock 만 있는 상태 → figma-spec-validator 가 BE 응답 형태 검증 불가
- **모호도**: 중간 — community 도메인 BE 풀세트 (35+ endpoints) 는 살아있지만 FE 호출 0건. mock data shape 와 BE response shape 가 같은지 검증 필요
- **차단성**: ⚠ figma-spec-validator 단계 직전에 정합성 결론 필요
- **권장 액션**:
  1. mock data shape (`data/community/{categories,notices,hotPosts,posts}.js`) ↔ BE response shape (PostResponse, BoardResponse) 비교
  2. 일치하면 BE 연결 코드만 추가 (thunks)
  3. 불일치하면 FE adapter 또는 BE response 조정 결정

---

## 차단성 종합 — 모바일 리뉴얼 진행 가능 여부

| # | 위험 | 차단? | 차단 해소 조건 |
|---:|---|---|---|
| 1 | coupon dual-write 갭 | ★ admin coupon | runtime row 수 + Owner 결정 |
| 2 | V2 fun_player_card 작동 불능 | ★ player_card 화면 | DTO + namespace + 시드 + service 통합 |
| 3 | `state.auth.authority` 오타 | ★ 모든 권한 화면 | slice 수정 + 소비처 일괄 변경 |
| 4 | upload 가드 누락 | ◐ | 보안 별개 fix |
| 5 | dev test-token 노출 | ◐ | 보안 별개 fix |
| 6 | @PreAuthorize decorative | ◐ | 정리 라운드 |
| 7 | community 위장 위험 | ⚠ community BE 연결 | controller 본인 검증 추가 |
| 8 | contact↔discipline 의미 | ★ player_card 화면 | Owner 도메인 결정 |
| 9 | FE↔BE path 미스매치 | ⚠ home / admin | endpoint 상수 정렬 |
| 10 | mock-only 화면 3개 | ⚠ figma-spec-validator | mock shape ↔ BE shape 정합성 검증 |

**모바일 리뉴얼 진행 차단성 critical (★)**:
- #1 coupon (admin 라인만 차단, public 미차단)
- #2 V2 player_card (player_card 화면 신규 시 차단)
- #3 auth shape (모든 인증 분기 차단)
- #8 contact↔discipline (player_card 화면 신규 시 차단)

→ **즉시 진행 가능한 모바일 작업**: HomeScreen 부분 mock 정리, community 모바일 BE 연결, historyMode (이미 완료)
→ **차단되는 작업**: admin coupon 화면 디자인, 모바일 player_card 화면 (figma 도착 시 작업 진입 전 #2 #8 해소 필수)

---

## figma-spec-validator 가 사용할 핵심 신호

> figma 도착 후 화면 단위로 검증할 때 우선 봐야 할 dim:

| 화면 | 관련 위험 | validator 우선 체크 |
|---|---|---|
| **HomeScreen** | #3, #9, #10 | (a) 인증 상태 분기 동작, (b) quiz section dispatch 존재 여부, (c) 인기글/자유게시판 mock vs BE shape |
| **CommunityScreen / CategoryScreen** | #7, #10 | (a) BE post/comment shape vs mock shape 비교, (b) 좋아요/신고 본인 검증 추가 후 연결 |
| **HistoryModeScreen** | (없음 — 안정) | mock 으로 운영 OK. 필요 시 향후 dictionary BE 와 연결 결정 |
| **모바일 player_card 화면 (신규)** | #2, #8 | ★ **figma 도착 즉시 차단** — V2 모듈 fix 4건 + contact/discipline 의미 결정 후 진입 |
| **모바일 인증 화면** | #3 | auth slice shape 정리 후 진입 |
| **admin 화면 전반** | #1, #4, #5, #6, #9 | 모바일 리뉴얼 대상 외 (Owner 정책: PC 어드민 단독). 단 보안 fix #4, #5 는 별개로 즉시 진행 |
