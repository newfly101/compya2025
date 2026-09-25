# 4단계 — 페이지 이관

> 목표: 도메인 단위로 페이지를 옮기고, 옮길 때마다 기준선과 같은지 확인한다
> 닫는 결함: [FE-01](../02-diagnosis/frontend/FE-01-snapshot-discarded-on-mount.md), [BE-07](../02-diagnosis/backend/BE-07-response-shape.md)(도메인별)
> 운영 영향: 없음 (배포는 6단계)

---

## 1. 이관 순서와 렌더링 방식

| 묶음 | 기존 경로 | Next 경로 | 렌더링 | 데이터 | 비고 |
|---|---|---|---|---|---|
| **A 정적** | `/privacy` `/terms` `/contact` `/about` | 같음 | SSG | 없음 | 레이아웃 · 메타 · 배포 경로 검증용 첫 PR |
| A | `/guides`, `/guides/:slug` | `guides/[slug]` | SSG | 로컬 콘텐츠 파일 | `generateStaticParams` 가 콘텐츠 파일에서 슬러그 목록 생성 — 3중 기록 제거([FE-03](../02-diagnosis/frontend/FE-03-prerender-fragility.md)) |
| A | `/probability`, `/probability/:sectionId` | `probability/[sectionId]` | SSG | 로컬 JSON | 상세 61개는 `robots: noindex` 유지 |
| A | `/mileage` | 같음 | SSG + 클라이언트 계산 | 로컬 설정 + `/api/mileage/sniper-targets` | |
| **B 목록** | `/coupons` · `/events` · `/notices` | 같음 | SSG | `/api/coupons` · `/api/events/external` · `/api/notices/summaries` | 목록 데이터를 Redux 에서 **서버 fetch → props** 로 전환 |
| B | `/skills` | 같음 | SSG + 클라이언트 필터 | `/api/player-skills/*` | |
| B | `/players` | 같음 | SSG(기본 뷰) + 클라이언트 필터 | `/api/player-cards` | `?team&year` 쿼리는 정적 HTML 에 반영 안 됨 → 기본 뷰만 HTML, 필터는 hydrate 후. `useSearchParams` 는 `<Suspense>` 경계 필수 |
| B | `/legend-stats`, `/history-mode/legend` | 같음 | SSG + 클라이언트 필터 | `/api/legend-stats`, `/api/history-rounds` | |
| B | `/` 홈 | `(site)/page.tsx` | SSG | 쿠폰 · 이벤트 · 공지 · 퀴즈 | 여러 도메인 컴포넌트 조립 → B 의 다른 도메인 뒤에 |
| **C 상세** | `/notice/:slug` | `notice/[slug]` | SSG | `/api/notices/summaries` → `/api/notices/slug/{slug}` | `dynamicParams = false`. 새 공지는 재빌드로 생성(5단계 트리거) |
| **D 클라이언트 전용** | `/auth/callback` | 같음 | 정적 셸 + 클라이언트 | — | 1단계 이후 BE 가 콜백을 처리하므로 FE 는 이동만 |
| D | `/mypage` | 같음 | 정적 셸 + 클라이언트 | `/api/users/me` | `noindex`, 클라이언트 가드 |
| D | `/community` | 같음 | 정적 셸 + 클라이언트 | 커뮤니티 API | `noindex`(정책), 읽기 전용 |
| D | `/admin`, `/admin/:tab` | `admin/[tab]` | 정적 셸 + 클라이언트 | 관리자 API | 탭 6개를 `generateStaticParams` 로 고정 |
| D | `/admin/notice/write/:id` | `admin/notice/write?id=` | 정적 셸 + 클라이언트 | 관리자 API | ⚠️ 정적 export 는 **빌드 때 모르는 id 경로를 만들 수 없다** → 쿼리 파라미터로 변경 |

순서: A → B(홈 제외) → C → B 홈 → D. 한 행 = 한 PR 을 기본으로 한다.

---

## 2. react-router → Next 치환표

| 기존 | Next | 주의 |
|---|---|---|
| `routePath.js` · `PublicRoutes.jsx` | `app/` 폴더 구조 | 경로 상수(`ROUTE_PATHS`)는 링크용으로 유지 |
| `<Link to>` · `navigate()` | `next/link` `<Link href>` · `useRouter().push()` | `next/navigation` 에서 import (`next/router` 아님) |
| `useParams()` | 서버: `params` prop / 클라이언트: `useParams()` | Next 15+ 에서 `params` 는 Promise — `await params` |
| `useSearchParams()` | `next/navigation` `useSearchParams()` | 정적 export 에서 `<Suspense>` 로 감싸지 않으면 빌드 오류 |
| `useLocation().pathname` | `usePathname()` | |
| `React.lazy` + `Suspense` | 라우트 단위 자동 분할. 무거운 컴포넌트는 `next/dynamic` | 공지 에디터(Tiptap)는 `dynamic(..., { ssr: false })` |
| `AuthGuard` | 클라이언트 컴포넌트 가드(동작 동일) | 렌더 중 storage 쓰기 금지([FE-05](../02-diagnosis/frontend/FE-05-browser-only-code.md)) |
| `createPortal(…, #modal)` | 같음, 단 마운트 후 대상 조회 | |
| `useDocumentMeta` | `metadata` / `generateMetadata` | 5단계에서 일괄 확인 |

---

## 3. 도메인 1개 이관 체크리스트 (PR 템플릿에 복사)

- [ ] 화면 · 컴포넌트 · 훅 · SCSS 모듈을 `frontend/src/domains/{d}/` 로 복사(원본 `web/` 유지)
- [ ] 브라우저 API · 상태 · 이벤트가 있는 파일에만 `"use client"`
- [ ] 목록/상세 데이터: `useEffect` + thunk → `page.tsx` 에서 `apiGet` 후 props
- [ ] 응답 타입을 `types/api.ts` 제네릭으로 — BE 응답 형태가 규칙과 다르면 BE 부터 정리([BE-07](../02-diagnosis/backend/BE-07-response-shape.md))
- [ ] `metadata` · `generateMetadata` 작성(설명문은 `routeSeo.js` 에서 이동)
- [ ] JS 끈 상태에서 본문이 보인다
- [ ] 개발 모드 hydration 경고 0
- [ ] 기준선 스크립트로 이 경로의 title · description · canonical · h1 · 항목 수 비교 — 차이 0 또는 의도한 차이 기록
- [ ] 광고 슬롯 위치가 `docs/convention/adsense.md` 규칙과 같다

---

## 4. 완료 기준

- [ ] 위 표의 모든 행이 `frontend/` 에 존재, `npm run build` 성공
- [ ] 기준선 비교 스크립트가 전 경로 통과
- [ ] `frontend/src` 에서 `react-router` import 0건
