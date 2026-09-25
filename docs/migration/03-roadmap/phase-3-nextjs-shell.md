# 3단계 — Next.js 뼈대

> 목표: 페이지 없이 **레이아웃 · 스타일 · 스토어 · API 클라이언트 · 빌드 산출물 형태**를 확정한다
> 닫는 결함: [FE-06](../02-diagnosis/frontend/FE-06-singleton-store.md)
> 운영 영향: 없음 (배포하지 않음)

---

## 1. 생성

```bash
npx create-next-app@latest frontend --typescript --app --src-dir --eslint --no-tailwind --import-alias "@/*"
cd frontend && npm i @reduxjs/toolkit react-redux axios sass dompurify
```

`next.config.ts` 핵심:

| 옵션 | 값 | 이유 |
|---|---|---|
| `output` | `'export'` | 정적 파일(`out/`)로 빌드 → 지금의 S3 + CloudFront 그대로 |
| `trailingSlash` | `true` | `/skills` → `out/skills/index.html`. 기존 CloudFront Function 의 `/경로/index.html` 규칙과 일치 |
| `images.unoptimized` | `true` | 정적 export 에서는 이미지 최적화 서버가 없다 |
| `sassOptions.additionalData` | 토큰 · 믹스인 index 주입 | 지금 `vite.config.js` 의 `additionalData` 와 같은 효과 — SCSS 모듈을 그대로 옮길 수 있다 |
| `reactStrictMode` | `true` | 이중 실행으로 부수 효과 버그 조기 발견 |

---

## 2. 폴더 규칙 — 기존 컨벤션을 유지한다

`docs/convention/frontend.md` 의 도메인 구조를 버리지 않는다. **`app/` 은 주소 지도만** 담고, 화면은 `domains/` 에 둔다.

```
frontend/src/
├─ app/                          # 라우트 = 폴더. 얇게 유지 (page.tsx 는 조립만)
│  ├─ layout.tsx                 # <html>, 전역 스타일, metadataBase, Providers
│  ├─ providers.tsx              # "use client" — StoreProvider, AuthProvider
│  ├─ not-found.tsx              # 404.html
│  ├─ sitemap.ts · robots.ts     # 5단계
│  ├─ (site)/layout.tsx          # 모바일 레이아웃: TopBar · Drawer · Footer
│  └─ (site)/coupons/page.tsx …  # 4단계
├─ domains/{name}/               # 기존 구조 유지: mobile/ · components/ · hooks/ · store/
├─ infra/
│  ├─ http/server.ts             # 빌드(서버) 전용 fetch — 브라우저 API 사용 금지
│  ├─ http/client.ts             # "use client" — 기존 axios + refresh 인터셉터
│  ├─ seo/                       # 메타 생성 헬퍼 (5단계)
│  └─ ads/                       # AdSlot ("use client")
├─ global/{styles,ui,utils}/
└─ types/api.ts                  # GlobalResponse<T>, ListResponse<T>
```

---

## 3. 서버 / 클라이언트 경계 규칙

| 규칙 | 이유 |
|---|---|
| `page.tsx` · `layout.tsx` 는 기본 **서버 컴포넌트**. 데이터는 여기서 `await` | 빌드 때 HTML 에 본문이 들어간다 |
| 상태 · 이벤트 · 브라우저 API 가 필요한 컴포넌트만 `"use client"` | 클라이언트 번들 최소화 |
| 서버 컴포넌트에서 `react-redux` · `axios` 인스턴스 import 금지 | [FE-06](../02-diagnosis/frontend/FE-06-singleton-store.md), [FE-05](../02-diagnosis/frontend/FE-05-browser-only-code.md) |
| 서버 → 클라이언트로 넘기는 props 는 직렬화 가능한 값만 | 함수 · Date 객체 · 클래스 인스턴스는 넘어가지 않는다 |
| 인증에 따라 달라지는 UI 는 마운트 후 렌더 | hydration 불일치 방지([FE-01](../02-diagnosis/frontend/FE-01-snapshot-discarded-on-mount.md)) |

---

## 4. 스토어 · API

- `app/store/makeStore.ts` — `configureStore` 를 **함수**로. `StoreProvider` 가 `useRef` 로 한 번만 생성
- `infra/http/server.ts` — `apiGet<T>(path)`: 2xx → `data`, 404 → `null`(호출부에서 `notFound()`), 그 외 → **throw**(빌드 실패). [BE-01](../02-diagnosis/backend/BE-01-all-errors-500.md) 이 선행돼야 404 와 500 이 구분된다
- `infra/http/client.ts` — 기존 `web/src/infra/http/client.js` 를 옮기되 `window` 접근은 인터셉터 안에서 가드
- 환경변수: `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SITE_URL`, `.env.example` 커밋

개발 중 API 호출은 브라우저 → `localhost:8080` 직접. BE CORS 허용 목록(설정값, [BE-05](../02-diagnosis/backend/BE-05-hardcoded-env.md))에 `http://localhost:3000` 포함. `output: 'export'` 에서는 `rewrites` 를 쓰지 않는다.

---

## 5. 완료 기준

- [ ] `npm run build` → `out/index.html`, `out/404.html` 생성
- [ ] 빈 홈 페이지에 기존 TopBar · Drawer · Footer 가 같은 모양으로 보인다(SCSS 토큰 주입 확인)
- [ ] `grep -rn "export const store" frontend/src` 0건
- [ ] `npm run lint` 통과, 서버 컴포넌트에서 `react-redux` import 시 lint 오류(`no-restricted-imports` 설정)
