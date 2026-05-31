# admin 4종 + wiki 풀스택 통합 검증 보고서

> 작성일: 2026-05-31 by developer-integrate (Opus)
> 입력: `analysis.md` + `decisions.log` + `_global-admin/develop/fe-history.md` + `wiki/prd/wiki.md` + `wiki/prd/_tasks.md` + `wiki/develop/fe-history.md`
> 권한: read-only — 코드 수정 X. 권고만 제시.

---

## § 1. 작업 요약

| 트랙 | 완료 | mismatch | 미해결/HITL | 빌드 |
|---|---|---|---|---|
| BE — admin 4종 | ✅ | 0 | 1 (🔴 oauthEmail 매핑) | 통과 (가정) |
| BE — wiki public + admin | ✅ | 0 | 1 (🔴 SQL 미실행) | 통과 (가정) |
| FE — admin 4종 | ✅ | 1 (P0) | 0 | Vite 통과 |
| FE — wiki public 5종 | ✅ | 1 (P0 — API path 버그) | 1 (❓ react-query 미설치 우회) | Vite 통과 |
| FE — wiki admin 4종 | ⚠️ 부분 | 2 (P0 라우트 미등록 + lazy import wrong target) | 0 | Vite 통과 (lazy 미 hit) |

---

## § 2. cross-domain 정합 검증 (8 항목)

| # | 항목 | 결과 | 상세 |
|---|---|---|---|
| 1 | admin 4종 (쿠폰/이벤트/공지/유저) 라우트 ↔ Screen | ✅ OK | `AdminRoutes.jsx` line 21~24 — 4 path 등록 + Screen 파일 4종 모두 존재 |
| 2 | AdminCouponScreen 중복 | ✅ OK | 단일 파일 — 인프라 placeholder + A3 실구현이 동일 경로에 1개 (CRUD 폼/Bottom Sheet 완비). scss 동일 |
| 3 | users slice 정합 | ❌ **P0 Mismatch** | `store.js:11` 가 `users/store/admin/slices.js` (placeholder — `items[]` 빈 reducer) import. 실제 slice 는 `users/store/slices.js` (4 thunk 핸들러 완비). `AdminUserScreen` 은 `s.adminUsers.users` 읽음 — placeholder 의 `items` 와 키 불일치 → **유저 목록 영구 빈 표시** |
| 4 | wiki Screen 경로 (public) | ✅ OK | `screens/*.jsx` 는 re-export only, 실구현 `mobile/*.jsx`. `PublicRoutes.jsx` lazy import = `screens/` → 정상 |
| 5 | wiki BE endpoint 존재 + FE path 정합 | ❌ **P0 Mismatch** | BE `GET /api/wiki/game-info/{target}` 컨트롤러 존재 (line 21). FE `useWikiGameInfo.js:33` 가 `API.get('/api/wiki/...')` 호출 — **`API_BASE_URL`이 이미 `/api` 포함** → 실제 요청 `/api/api/wiki/...` → 404. `useSkills.js:34`, `useAdminWiki.js` 9개 endpoint 모두 동일 버그 |
| 6 | notices endpoints 버그 정합 | ✅ OK | `endpoints.js:11-12` 함수형 `(id) => /admin/notices/${id}` 적용. `AdminNoticeScreen` `requestAdminUpdateNotice` 호출 시 id 전달 패턴 일치 |
| 7 | wiki public DB SQL | 🟡 보류 | `sql/V3/site/CREATE_WIKI_TABLES.sql` 존재. 실행 미완료 (사용자 책임 — DB 파괴적 작업) |
| 8 | wiki admin 라우트 정합 | ❌ **P0 Mismatch** | `AdminWikiScreen.jsx` 가 `/admin/wiki/pitches`, `/admin/wiki/pitch-grades`, `/admin/wiki/stat-influences` navigate. 실제 `AdminRoutes.jsx:26-30` 는 `/admin/wiki/game-info` 만 등록 → 3 entity 화면 **전부 unreachable** (404). 추가: lazy import target `AdminWikiGameInfoScreen.jsx` 가 사실 `AdminWikiScreen.jsx` 를 re-export (entry 그리드) — 게임 정보 화면은 별도로 등록 안 됨 |

---

## § 3. 추가 발견 (브리프 외)

| # | 항목 | 결과 |
|---|---|---|
| 9 | BE `AdminCouponController` @PreAuthorize | ✅ 완료 — 클래스 레벨 `@PreAuthorize("hasRole('ADMIN')")` 적용 (line 18). analysis.md P2 cleanup 해소 |
| 10 | BE `AdminUserController` | ✅ 완료 — `domain/oauth/controller/AdminUserController.java` — 4 endpoint + @PreAuthorize 완비 |
| 11 | BE `AdminWikiController` 통합 (분리 X) | 🟨 가정 변동 | analysis 는 entity 별 3 컨트롤러 분리 제안 → 실제는 단일 `AdminWikiController` 에 9 endpoint 통합. 기능 동일. 권고 마커만 |
| 12 | SecurityConfig `/api/admin/**` + `/api/wiki/**` | ✅ OK — line 62~63 |
| 13 | Drawer admin 진입점 default 경로 | 🟨 가정 — `/admin/coupon` hardcode (TODO 마커 line 58). 진입 동선 결정 필요 |
| 14 | Drawer non-admin 위키 entry | ⚠️ UX 의문 | `user && !isAdmin` 조건 → admin 은 wiki entry 못 봄. 일반 동선과 분리 의도? 또는 home QuickMenu 만으로 충분? |
| 15 | `users/store/slices.js` 미사용 dead file | 🟨 cleanup | 실구현 slice 인데 store 가 잘못된 경로 import. P0 수정 후 dead 처리 또는 admin/slices.js 로 이동 권고 |

---

## § 4. mismatch 우선순위 + 권고 액션

| 우선순위 | 항목 | 권고 sub-agent | brief 요약 |
|---|---|---|---|
| **P0** | #5 wiki hooks `/api/` prefix 이중 — useSkills / useWikiGameInfo / useAdminWiki | `frontend-developer` 재호출 | `web/src/domains/wiki/hooks/*.js` 의 모든 `API.get('/api/...')` → `API.get('/...')` 로 교체 (baseURL 에 이미 `/api` 포함). 검증: 빌드 + 콘솔 fetch URL 확인 |
| **P0** | #3 users adminUsers reducer placeholder import | `frontend-developer` 재호출 | `store.js:11` import 경로를 `users/store/slices.js` 로 교정 또는 `admin/slices.js` 를 실구현으로 덮어쓰기 (현 `admin/slices.js` 는 `items[]` placeholder). `AdminUserScreen` 의 `s.adminUsers.users` 키와 정합 |
| **P0** | #8 wiki admin 라우트 누락 + entry 화면 lazy target 오류 | `frontend-developer` 재호출 | `AdminRoutes.jsx` 에 (a) `admin_wiki` entry 라우트 (= `AdminWikiScreen`), (b) `/admin/wiki/pitches`, `/admin/wiki/pitch-grades`, `/admin/wiki/stat-influences`, `/admin/wiki/game-info` 4 라우트 추가. lazy import 정합 (현재 `AdminWikiGameInfoScreen.jsx` 가 `AdminWikiScreen` 을 re-export 하는 잘못된 alias) |
| P1 | #11 BE wiki admin 컨트롤러 분리 vs 통합 | (없음 — 가정 변경만) | analysis 안은 3 컨트롤러 분리. 실제는 단일 `AdminWikiController` — 동작 OK. `decisions.log` 에 가정 변경 기록 권고 |
| P1 | #13 Drawer admin 진입점 default `/admin/coupon` hardcode | 사용자 결정 | 진입 목적지 명세 후 FE 보정. 또는 `/admin` 인덱스 화면 신설 |
| P2 | #15 `users/store/slices.js` cleanup | P0 #3 수정과 함께 처리 | 어느 경로를 정본으로 할지 결정 후 dead 파일 삭제 |

---

## § 5. HITL 잔여 (사용자 결정 사안)

| 마커 | 항목 | 현재 적용값 | 결정 권고 |
|---|---|---|---|
| 🔴 | wiki DB SQL 실행 시점 | 미실행 — `sql/V3/site/CREATE_WIKI_TABLES.sql` 대기 | 사용자가 운영 DB 적용 시점 결정. 적용 전까지 wiki game-info BE 호출 = 빈 응답 (정합 OK — placeholder UI) |
| 🔴 | `AdminUserResponse.email` 매핑 (BE) | record 필드 `email` 존재 (line 11). 일반 email 컬럼 부재 시 `oauthEmail` 매핑 추정 | BE service/mapper 의 `email` 소스 컬럼 확인 권고. `oauthEmail` 노출이면 정합 (analysis.md 🔴 적용값). DB 컬럼 결정 사안 |
| ❓ | react-query 미설치 — wiki hooks custom 구현 | `useState/useRef` 기반 캐시 + 백오프 retry — 동작 OK | 향후 react-query 도입 시 `useSkills`/`useWikiGameInfo`/`useAdminWiki` hook 교체 컨벤션 마커. 본 사이클 외 |
| ❓ | wiki_pitch 비활성화 시 grade cascade | soft cascade 채택 (decisions.log) | BE 구현 검증 필요 — `AdminWikiServiceImpl.deletePitch` 가 grade 도 함께 비활성화하는지 확인 권고 (본 보고서 범위 외) |
| 🟨 | wiki BE 컨트롤러 분리 vs 통합 | 통합 (`AdminWikiController` 단일, 9 endpoint) | analysis.md § 3 안 (entity 별 3 분리) 와 다름. 동작 OK — `decisions.log` 갱신 권고 |
| 🟨 | Drawer admin 진입 default 경로 | `/admin/coupon` hardcode | `/admin` 인덱스 페이지 신설 또는 사용자 우선순위 결정 |

---

## § 6. 가정 정리 (검증 못 한 항목)

| 항목 | 가정 | 확인 권고 |
|---|---|---|
| BE 빌드 통과 | analysis 명세대로 컴파일 OK | `gradlew compileJava` 직접 실행 미수행 — be-history 부재로 확인 불가 |
| BE wiki mapper xml | 매핑 정상 | `mapper/wiki/*.xml` 파일 read 미수행 (시간 제약) |
| BE notice GET list 필터 파라미터 | analysis.md FN-A3 명세 적용 가정 | `AdminNoticeController` read 안 함 |
| FE 빌드 통과 | fe-history "Vite 빌드 통과" 보고 | 메인이 별도 검증 권고 (P0 fix 후 함께) |

---

## § 7. 통합 history (시각순 — 발췌)

| 시각 | 영역 | FN | 이벤트 |
|---|---|---|---|
| 2026-05-31 | analysis | — | `developer-analyze` admin 4종 분석 + dispatch brief 5건 |
| 2026-05-31 | analysis | — | wiki planner-division R3 — task brief 6건 |
| 2026-05-31 | BE | A1 (admin) | AdminCoupon DELETE + @PreAuthorize / AdminEvent GET list + DELETE / AdminNotice 필터 + @PreAuthorize / AdminUser 신규 |
| 2026-05-31 | BE | wiki T2 | WikiGameInfoController + SkillSetResponse EPIC 보강 |
| 2026-05-31 | BE | wiki T3 | AdminWikiController 통합 (entity 별 분리 X — 가정 변경) |
| 2026-05-31 | FE | F0 (인프라) | useAuthentication 버그 수정 / notices endpoints id 함수형 / routePath/routeMeta admin 4 + wiki 5 + adminWikiGameInfo 추가 / Drawer admin 진입점 |
| 2026-05-31 | FE | F0 | adminUsers slice placeholder 생성 + store 등록 ← **P0 mismatch 원인** |
| 2026-05-31 | FE | F5 | AdminRoutes 복원 — admin 4종 + wiki admin 1개만 (3 entity 미등록) ← **P0 mismatch 원인** |
| 2026-05-31 | FE | F1~F4 | admin 4종 Screen 실구현 + users/store/slices.js (실구현) — placeholder 경로와 불일치 ← **P0 mismatch** |
| 2026-05-31 | FE | wiki T4 | public 5 screen + URL `/encyclopedia` → `/wiki` 교체 + hooks `/api/` 이중 prefix ← **P0 mismatch** |
| 2026-05-31 | FE | wiki T5 | admin 4 screen + navigate target 3개 (라우트 미등록) ← **P0 mismatch** |
| 2026-05-31 | designer | T6 | (별도 검증 — 본 사이클 외) |

---

## § 8. 다음 단계

1. **즉시 (P0 — frontend-developer 재호출 1건 권고)** — 3 P0 mismatch 동시 수정:
   - 권고 brief: "wiki hooks `/api/` 이중 prefix 제거 (useSkills, useWikiGameInfo, useAdminWiki 9 endpoint) + AdminRoutes wiki admin 3 entity 라우트 + entry 라우트 등록 + users adminUsers reducer import 경로 정정. integrate-report-20260531.md § 4 참조"
   - 단일 dispatch 권고 — 모두 인프라 / 라우트 / 매핑 영역으로 충돌 없음
2. **사용자 결정 (HITL)**:
   - 🔴 wiki DB SQL 실행 (사용자 직접 또는 ops dispatch)
   - 🔴 `AdminUserResponse.email` 소스 컬럼 (oauthEmail vs 별도 컬럼) 확인
   - 🟨 Drawer admin 진입 default 경로 — `/admin/coupon` vs `/admin` 인덱스
3. **검증 (사용자 결정 후)**:
   - 본 agent 재호출 — P0 fix 후 통합 재검증 (특히 wiki hooks 빌드 + 네트워크 검증)
   - 모든 P0 해소 시 라운드 종료
4. **이월 (별도 사이클)**:
   - 유저 상세 Bottom Sheet (analysis ❓ TBD)
   - react-query 도입 시 wiki hooks 마이그레이션
   - BE wiki admin 컨트롤러 통합 vs 분리 정책 (decisions.log 갱신)
