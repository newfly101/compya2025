# AppLayout — QA Checklist

> 작성일: 2026-05-11
> 모드: reverse
> 입력: 본 PRD 산출물 종합 (`ia.md` / `requirements.md` / `feature-spec.md` / `endpoint-spec-draft.md` / `edge-cases.md`)
> 본 문서는 **QA 실행 체크리스트** — 글로벌 layer 만 (도메인 페이지 내부는 각 도메인 PRD)

---

## 0. 사용 방식

- [ ] 체크박스 형태 — QA 가 항목별 pass/fail 표시
- 분류: 기능 / UI / 인증 / 라우팅 / 성능 / 접근성 / 보안 / 회귀
- **P0 🔴** 항목은 release block. **P1** 은 release 후 hotfix 가능. **P2** 는 관찰

---

## 1. 글로벌 Provider 체인

- [ ] **QA-1.1** App mount 시 빈 화면 (blank) → health-check 응답 → 페이지 표시 흐름 확인 (네트워크 정상)
- [ ] **QA-1.2** `state.auth.initialized === false` 동안 children 렌더 차단 확인 (Redux DevTools)
- [ ] **QA-1.3** ResponseListener 가 모든 라우트에서 mount 되어 있는지 확인 (React DevTools)
- [ ] **QA-1.4** health-check 실패 시 GA4 user property `'GUEST'` 설정 확인 (GA4 Real-time)
- [ ] **QA-1.5 🔴** 네트워크 단절 상태에서 진입 → blank 화면 영구 유지 여부 확인 (EC-1.1) — **P0**
- [ ] **QA-1.6** 헬스체크 timeout / 무응답 시 동작 확인 (느린 네트워크 시뮬레이션)

---

## 2. 라우팅

- [ ] **QA-2.1** PublicRoutes 7개 모두 진입 가능: `/` `/auth/callback` `/coupons` `/events` `/notices` `/notice/:id` `/mode/history`
- [ ] **QA-2.2** UserRoutes / AdminRoutes children 비어있음 (legacy 폐기) — 신규 라우트 추가 시 본 항목 갱신
- [ ] **QA-2.3 🔴** 미정의 라우트 (`/foo-bar`) 진입 → 404 처리 확인 (EC-2.1) — **P0**
- [ ] **QA-2.4 🔴** lazy chunk 로딩 실패 시 ErrorBoundary 처리 확인 (네트워크 차단 후 다른 페이지 navigate) (EC-2.2) — **P0**
- [ ] **QA-2.5** Suspense fallback "로딩중..." 텍스트 노출 확인 (느린 네트워크 시뮬레이션)
- [ ] **QA-2.6** 브라우저 back/forward 정상 동작 확인

---

## 3. TopBar

- [ ] **QA-3.1** home variant: 햄버거 + 로고 + 로그인/로그아웃 노출 (`/` 진입)
- [ ] **QA-3.2** 로고 클릭 → `/` navigate
- [ ] **QA-3.3** 비로그인 시 우측 "N 네이버 로그인" 버튼 노출 (네이버 그린 배경 `--color-success`)
- [ ] **QA-3.4** 로그인 시 우측 "로그아웃" 버튼 노출
- [ ] **QA-3.5** 햄버거 클릭 → Drawer open
- [ ] **QA-3.6** TopBar fixed top + height 52px + z-index 200 확인
- [ ] **QA-3.7** TopBar 모바일 wrapper (max-width 428px) 와 동일 폭 중앙 정렬 확인 (tablet 이상 viewport)
- [ ] **QA-3.8** page variant 사용 도메인 결정 후 본 항목 추가 (현재 사용처 0)
- [ ] **QA-3.9** page variant `onBack` 미주입 케이스 처리 확인 (EC-3.4)

---

## 4. Drawer

- [ ] **QA-4.1** Drawer open 시 좌측에서 slide-in 애니메이션
- [ ] **QA-4.2** overlay 표시 + 클릭 시 close
- [ ] **QA-4.3** Drawer open 시 `document.body.style.overflow = "hidden"` 적용 (배경 스크롤 잠금)
- [ ] **QA-4.4** Drawer close 시 `body.overflow` 해제
- [ ] **QA-4.5** 비로그인: "로그인하고 더 많은 컨텐츠 이용하기!" + 네이버 로그인 버튼
- [ ] **QA-4.6** 로그인: avatar + nickname + email 노출
- [ ] **QA-4.7** 메뉴 그룹: 메인 / 컨텐츠 2개 — 라벨 + 아이콘 + 라벨 + badge (옵션)
- [ ] **QA-4.8** 현재 라우트 active 표시 (좌측 액센트 바 3×24, brand-violet)
- [ ] **QA-4.9** 일반 메뉴 클릭 → close + Link navigate
- [ ] **QA-4.10** comingSoon 메뉴 (스킬 / 백과사전) 클릭 → navigate 차단 + RenewalNoticeModal 표시
- [ ] **QA-4.11** Drawer 이벤트 badge: 5 / 쿠폰 코드 badge: 3 표시 (현재 하드코딩 — EC-5.1)
- [ ] **QA-4.12** tablet 이상 viewport 에서 Drawer 가 wrapper 안쪽 한정 (clip-path 확인)
- [ ] **QA-4.13** Drawer open 상태에서 back/forward 시 Drawer 자동 close (EC-3.1) — 현재 미구현 ❓
- [ ] **QA-4.14 (a11y)** Drawer keyboard escape (`Esc` 키) — 현재 미구현 ❓

---

## 5. pageContent / 스크롤

- [ ] **QA-5.1** pageContent padding-top 52px (TopBar 가림 회피)
- [ ] **QA-5.2** 라우트 변경 시 즉시 scroll-to-top
- [ ] **QA-5.3** lazy chunk 로딩 후 mount 직후에도 scroll-to-top 유지 (MutationObserver 동작)
- [ ] **QA-5.4** 사용자가 wheel/touch/keydown/pointerdown 발생 시 scroll-to-top 즉시 취소
- [ ] **QA-5.5** scroll-to-top 다중 timeout (0/100/300/600ms) 정상 동작
- [ ] **QA-5.6** observer 1500ms 한도 후 disconnect
- [ ] **QA-5.7** pageContent overflow-y: auto 정상 (긴 컨텐츠 시 스크롤바 노출)

---

## 6. 글로벌 ResponseModal

- [ ] **QA-6.1** thunk 가 `lastOperation` 설정 시 ResponseModal 자동 마운트
- [ ] **QA-6.2** 성공 아이콘 + 메시지 + 확인 버튼 (success: true)
- [ ] **QA-6.3** 실패 아이콘 + 메시지 + 확인 버튼 (success: false)
- [ ] **QA-6.4** "확인" 클릭 시 `clearLastOperation()` dispatch + modal unmount
- [ ] **QA-6.5** createPortal `#modal` 에 마운트 확인 (React DevTools)
- [ ] **QA-6.6** 중첩 발생 시 후속 메시지가 이전 덮어씀 확인 (EC-3.6 — 현재 동작)

---

## 7. 인증 / OAuth

🔴 **권한 분야 — 핵심 QA**

- [ ] **QA-7.1 🔴** "N 네이버 로그인" 클릭 → `sessionStorage.redirectPath` 저장 → 네이버 OAuth URL 이동
- [ ] **QA-7.2 🔴** 네이버 OAuth 완료 → `/auth/callback` → health-check → `redirectPath` 복귀
- [ ] **QA-7.3 🔴** OAuth 콜백 실패 (cookie 미발급) 시 null guard 동작 (EC-1.3) — **P0**
- [ ] **QA-7.4 🔴** ACCESS_TOKEN 만료 → 자동 `/api/auth/refresh` 1회 → 성공 retry 확인
- [ ] **QA-7.5 🔴** ACCESS_TOKEN + REFRESH_TOKEN 모두 만료 → guest fallback (`data: null`)
- [ ] **QA-7.6 🔴** 로그아웃 클릭 → `clearUser()` + `window.location.replace("/")`
- [ ] **QA-7.7 🔴** 로그아웃 API 실패 시 클라이언트 측 user state 처리 (EC-1.4)
- [ ] **QA-7.8 🔴** AuthGuard 동작 (현재 사용처 0 — 신규 도입 시 본 항목 활성화)
- [ ] **QA-7.9 🔴** cookie `withCredentials: true` 모든 요청에 적용 확인 (DevTools Network 탭)

---

## 8. 글로벌 디자인 토큰

- [ ] **QA-8.1** body 배경 `--color-bg-deepest #0f0a14`
- [ ] **QA-8.2** body max-width 428px + margin auto 중앙 정렬
- [ ] **QA-8.3** TopBar / Drawer 도 동일 max-width 중앙 정렬
- [ ] **QA-8.4** Drawer 배경 `--color-bg-deep #140f1f`
- [ ] **QA-8.5** Drawer active 액센트 바 `--color-brand-violet #6c5ce7`
- [ ] **QA-8.6** 네이버 로그인 버튼 배경 `--color-success #03c75a`
- [ ] **QA-8.7** Typography: Inter 폰트 family 적용 확인
- [ ] **QA-8.8** Spacing 8pt grid 준수
- [ ] **QA-8.9** Z-index 계층 (TopBar 200 / Drawer 300 / Modal 410)

---

## 9. 반응형 / 모바일 우선

- [ ] **QA-9.1** mobile (320~428px) — 단일 wrapper 전체 폭
- [ ] **QA-9.2** tablet (768px+) — body 중앙 정렬 + 좌우 다크 배경 노출
- [ ] **QA-9.3** desktop (1024px+) — 동일 (별도 PC 레이아웃 없음 — 의도)
- [ ] **QA-9.4** Drawer tablet 이상에서 wrapper 안쪽 한정 (`clip-path`)
- [ ] **QA-9.5** iOS Safari `100dvh` 동작 확인 (toolbar show/hide) (EC-4.4)
- [ ] **QA-9.6** Android Chrome 동작 확인
- [ ] **QA-9.7** 가로 모드 (landscape) 동작 확인

---

## 10. 접근성 (a11y)

- [ ] **QA-10.1** 햄버거 버튼 `aria-label="메뉴"`
- [ ] **QA-10.2** back 버튼 `aria-label="뒤로가기"`
- [ ] **QA-10.3** Drawer active 메뉴 시각적 구분 (액센트 바 + 배경)
- [ ] **QA-10.4** Drawer overlay 클릭 → close (escape 가능)
- [ ] **QA-10.5** keyboard tab 순서 자연스러움 확인
- [ ] **QA-10.6 (미구현)** Drawer keyboard `Esc` 닫힘 ❓
- [ ] **QA-10.7** screen reader 호환 (NVDA / VoiceOver 간단 확인)
- [ ] **QA-10.8** 색 대비 (WCAG AA) — text-primary on bg-deepest 등

---

## 11. 성능

- [ ] **QA-11.1** Lighthouse Performance 점수 (모바일) 75+ 권장
- [ ] **QA-11.2** lazy 페이지 chunk 분리 확인 (Network 탭 chunk 파일명)
- [ ] **QA-11.3** First Contentful Paint < 2s (3G slow 시뮬레이션)
- [ ] **QA-11.4** scroll-to-top 다중 시도가 사용자 input 시 즉시 취소 (EC-4.1)
- [ ] **QA-11.5** route 변경 빠른 연속 시 메모리 누수 없음 (Chrome DevTools Memory profiler)

---

## 12. 회귀 (regression)

- [ ] **QA-12.1** legacy 도메인 (community / quiz page / profile / admin / kbo) 라우트 미노출 (`/community` 진입 시 404)
- [ ] **QA-12.2** legacy 도메인 코드 잔재 (`domains/community/**`) 가 빌드 영향 없음 확인
- [ ] **QA-12.3** HomeScreen 의 dead import (`MOCK_POSTS / MOCK_TEAM_POSTS`) 가 런타임 에러 없음 (community 주석 안쪽 — unreachable)
- [ ] **QA-12.4** ROUTE_META.COMMUNITY 정의되어 있으나 미사용 — 빌드 영향 없음

---

## 13. 보안 / 환경

🔴 **보안 분야 — 핵심 QA**

- [ ] **QA-13.1 🔴** 모든 API 요청에 `withCredentials: true` (DevTools Network → Request Cookies 확인)
- [ ] **QA-13.2 🔴** cookie `httpOnly` / `secure` / `sameSite` 정책 BE 확인 (env 분리)
- [ ] **QA-13.3 🔴** sessionStorage `redirectPath` 가 외부 URL 주입 가능성 검사 (XSS 우회)
- [ ] **QA-13.4 🔴** OAuth state 파라미터 검증 (CSRF) — BE 책임 cite
- [ ] **QA-13.5 🔴** 로그아웃 시 클라이언트 state + 서버 cookie 모두 무효화 확인

---

## 14. 디자인 정합 (designer 단계 후 추가)

> designer agent 가 Figma frame 그린 후 본 섹션에 항목 추가

- [ ] **QA-14.1** Figma F1 (Mobile wrapper) ↔ 실 구현 일치
- [ ] **QA-14.2** Figma F2 (TopBar home) ↔ 실 구현 일치
- [ ] **QA-14.3** Figma F3 (TopBar page) ↔ 실 구현 일치 (사용처 결정 후)
- [ ] **QA-14.4** Figma F4 (Drawer guest) ↔ 실 구현 일치
- [ ] **QA-14.5** Figma F5 (Drawer user) ↔ 실 구현 일치
- [ ] **QA-14.6** Figma F6 (RenewalNoticeModal) ↔ 실 구현 일치
- [ ] **QA-14.7** Figma F7/F8 (ResponseModal) ↔ 실 구현 일치
- [ ] **QA-14.8** Figma F9 (Suspense loading) ↔ 실 구현 일치
- [ ] **QA-14.9** Figma F10 (AuthProvider blank) ↔ 실 구현 일치 (디자인 결정 후)

---

## 15. 사용자 확인 필요 항목 (P0 핵심)

다음은 release block — 반드시 해결 후 배포:

| 항목 | 카테고리 | 위험도 |
|---|---|---|
| QA-1.5 | 네트워크 단절 + initialized 미설정 | P0 🔴 |
| QA-2.3 | 404 페이지 미정의 | P0 🔴 |
| QA-2.4 | 글로벌 ErrorBoundary 부재 | P0 🔴 |
| QA-7.3 | OAuth 콜백 null guard | P0 🔴 |
| QA-13.2 | cookie 정책 (httpOnly/secure/sameSite) | P0 🔴 |
| QA-13.3 | sessionStorage redirectPath XSS 검사 | P0 🔴 |

위 항목은 본 PRD scope 일부 — 별도 라운드 fix 또는 designer/develop 트랙 협력 필요.
