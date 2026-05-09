# 전역 API 규격화된 폴더 구조 제안

> 작성: 2026-05-09
> 사용자 정책: `src/infra/uploads/` 같은 전역 API 가 추가될 예정 — 규격화된 폴더 구조 필요
> 검토 상태: **사용자 확인 대기** — 옵션 선택 후 별도 라운드에서 실제 마이그레이션
> 본 라운드 작업: 제안서 작성만 (코드 / 폴더 이동 / git 작업 없음)

---

## 1. 배경

### 1.1 현재 `src/infra/` 구조

```text
web/src/infra/
└── uploads/
    └── store/
        ├── api.js          # fetchAdminUploadImageFile (multipart S3 upload)
        ├── endpoints.js    # UPLOAD_FILE.IMAGES = "/upload/{domain}"
        ├── index.js        # barrel export
        ├── slices.js       # uploadSlice (createSlice)
        └── thunks.js       # requestUploadImage (createAsyncThunk)
```

- `src/infra/` 하위에 `uploads/` 한 모듈만 존재
- 도메인별 표준 (`domains/{domain}/store/`) 과 동일한 5 파일 layout 채택
- Redux slice 등록: `app/store/store.js:12` `import upLoadReducer from "@/infra/uploads/store/slices.js"`
- 외부 사용처 (grep `@/infra/uploads`): 5 파일
  - `web/src/infra/uploads/store/{thunks,slices}.js` (self)
  - `web/src/app/store/store.js:12` (slice 등록)
  - `web/src/domains/quiz/store/admin/thunks.js:9` `import { requestUploadImage }`
  - `web/src/domains/events/store/admin/thunks.js:9` `import { requestUploadImage }`
- 전역성 입증: 2개 도메인 (quiz / events) admin 에서 동일 thunk 호출 — 도메인 1개에 종속되지 않는 횡단 모듈

### 1.2 기타 전역 API 후보 (현재 코드베이스 식별)

#### A. axios instance — `web/src/app/store/APIConfig.js`
- `axios.create()` 단일 instance (`API`) — 모든 도메인 + infra/uploads 가 import
- `baseURL: "http://localhost:8080/api"` 하드코딩 (line 3)
- 주석으로 `window.__CONFIG__.API_BASE_URL` 분기 가능성만 표시 (line 4)
- Request interceptor: `X-Page-Path` / `X-Referrer` / `X-Page-Url` header
- Response interceptor: 401 → `{ data: null }` 변환 (silent failure)
- 모든 도메인 api.js (10 파일) 가 `import { API } from "@/app/store/APIConfig.js"` 호출
- runtime config 파일: `web/public/runtime-config.js` → `window.__CONFIG__.API_BASE_URL = "https://api.compyafun.com/api"` 정의 — 코드 측에서는 미사용 (주석)

#### B. analytics — `web/src/app/analytics/`
- `ga.js`: `pushEvent` / `setUserProperties` (gtag 단일 진입점, dev/prod 분기)
- `events/{authEvents,couponEvents,eventEvents}.js`: 도메인별 tracking 함수 (`trackCouponCopy`, `trackCouponApply`, `trackCouponGo` 등)
- `hooks/useGA4PageView.js`: 라우트 변경 → `page_view` 자동 전송
- 사용자: 다수 도메인 (coupons / notices / events / authentication) + AuthProvider
- 본질적으로 "BE 통신은 아니지만 cross-domain 횡단 인프라" — API 와 같은 카테고리로 묶을지 분리할지 결정 필요

#### C. 도메인별 API 패턴 (참고 — 전역 후보 아님)

```text
domains/{domain}/store/
  ├── api.js              # axios call
  ├── endpoints.js        # path 상수 (예: COUPONS.GET_COUPONS)
  └── (admin/public 분기 시 store/{public,admin}/{api,endpoints,thunks}.js)
```

- 10개 api.js: authentication / coupons (admin+public) / events (admin+public) / notices (admin+public) / quiz (admin+public) / community
- 모두 `import { API } from "@/app/store/APIConfig.js"` 사용
- 도메인 한정 책임 → **본 제안 범위 밖** (전역 폴더로 이동 X)

### 1.3 axios baseURL 하드코딩 이슈

- `APIConfig.js:3` `const BaseUrl = "http://localhost:8080/api"` 활성
- `APIConfig.js:4` `// const BaseUrl = window.__CONFIG__.API_BASE_URL` 주석
- `web/public/runtime-config.js` 가 production baseURL 정의하지만 활용 미적용
- 추가 하드코딩: `useHeaderAuth.js:12` / `domains/authentication/hooks/useAuthentication.js:9` 의 `http://localhost:8080/api/auth/naver/callback`
- 본 제안의 § 5 에서 baseURL env 화 / runtime-config 통합 제안

---

## 2. 목표

1. 전역 API (도메인 1개에 종속되지 않고 다수 도메인 / global layout / infra 가 공유 사용하는 API) 를 **단일 폴더 트리 하위에 모음**
2. **도메인 API** (`domains/{domain}/store/`) 와 명확히 분리
3. **표준 모듈 구조** (api / endpoints / types / hooks / index) — 도메인 store 패턴과 정합
4. **향후 추가될 전역 API 통합 패턴** 미리 정립 (analytics / file utils / settings / device info 등)
5. axios instance / baseURL 환경 변수화 — 본 제안 범위 보조

---

## 3. 폴더 구조 옵션 (3안)

### 옵션 A — `src/global/api/` 패턴

#### 폴더 트리

```text
web/src/global/
├── api/                          # ★ 신규 — 전역 API 모음
│   ├── uploads/                  # (현 src/infra/uploads/ 이전)
│   │   ├── api.js
│   │   ├── endpoints.js
│   │   ├── slices.js
│   │   ├── thunks.js
│   │   └── index.js
│   ├── analytics/                # (현 src/app/analytics/ 이전 시 — 옵션)
│   │   ├── ga.js
│   │   ├── events/
│   │   └── hooks/
│   └── (향후) health/ device/ settings/ ...
├── ui/                           # (기존 — global UI components)
├── utils/                        # (기존 — 공용 utils)
├── handler/                      # (기존)
├── hooks/                        # (기존)
├── styles/                       # (기존)
└── layout/                       # (기존)
```

#### 의미
- `global/` = "도메인 비종속 횡단 코드" — 기존 `global/ui`, `global/utils`, `global/layout` 와 같은 카테고리
- `global/api` = "도메인 비종속 횡단 API"

#### 장점
- 기존 `global/ui`, `global/utils`, `global/layout`, `global/handler`, `global/hooks` 와 **일관된 위치 컨벤션**
- 새 개발자가 "global = 횡단" 멘탈 모델 한 번 학습 → 모든 글로벌 코드 위치 추정 가능
- import alias `@/global/api/uploads` 가 직관적

#### 단점
- `global/` 가 **UI + 비-UI + API** 가 한 폴더에 섞여 폴더 의미가 흐려짐 (현재도 ui + utils + handler 가 섞여 있긴 함)
- "infra" 라는 별도 카테고리가 자연스럽다고 느끼는 팀에서는 부자연스러울 수 있음

#### 마이그레이션 영향도

| 변경 | 영향 |
|---|---|
| `src/infra/uploads/` → `src/global/api/uploads/` 이동 | 5 파일 import path 갱신 (slices/thunks 자체 + store.js + quiz/events admin thunks) |
| `src/infra/` 폴더 삭제 (uploads 만 있으므로) | 폴더 자체 제거 |
| docs (`docs/specs/fe/state-and-data.md`, `docs/prd/_overview.md`) 의 `infra/uploads` 표기 갱신 | docs 동기화 라운드 필요 |
| analytics 동시 이전 시 (선택) | `@/app/analytics/*` → `@/global/api/analytics/*` — 12+ 파일 import 갱신 |

### 옵션 B — `src/shared/api/` (또는 `src/services/`)

#### 폴더 트리

```text
web/src/shared/                   # ★ 신규 폴더
└── api/
    ├── uploads/
    ├── analytics/                # (옵션)
    └── ...
```

또는 `src/services/` 명명:

```text
web/src/services/                 # ★ 신규 폴더 (대안 명명)
├── uploads/
├── analytics/
└── ...
```

#### 의미
- `shared/` = "비-UI / 비-도메인 인프라" (FSD-lite 패턴 영향). UI 는 `global/ui` 에 분리되어 있다는 가정과 정합
- `services/` = "외부 통신 서비스" (Angular / NestJS 영향). API call 의미 명확

#### 장점
- **이름 자체가 의미 명확** — `shared/api/` 또는 `services/` 만 봐도 "API 서비스 레이어" 의미 직관적
- `global/` (UI 포함) 과 **명확히 분리** → API 만 모인 폴더라는 단일 책임
- React + Redux 진영 best practice 와 정합 (`services/` 또는 `api/`)

#### 단점
- 기존 `global/` 폴더 의미와 **중복 가능성** — 현재 `global/utils` 가 비-UI util 이라 `shared/` 와 의미 충돌
- 새 폴더 1개 추가 → top-level structure 가 늘어남 (`app`, `domains`, `global`, `infra`, `shared`?, `services`?)
- 기존 `infra/uploads` 위치도 같이 정리해야 함 (`infra/` 제거 또는 `shared/` 흡수)

#### 마이그레이션 영향도

| 변경 | 영향 |
|---|---|
| `src/infra/uploads/` → `src/shared/api/uploads/` 이동 | 5 파일 import path 갱신 |
| `src/infra/` 폴더 삭제 | 폴더 자체 제거 |
| top-level 폴더 1개 추가 (`shared/`) | top-level 구조 확장 |
| analytics 동시 이전 (선택) | 12+ 파일 import 갱신 |

### 옵션 C — `src/infra/` 표준화 (현 위치 유지 + 확장)

#### 폴더 트리

```text
web/src/infra/
├── api/                          # ★ 신규 하위 카테고리
│   ├── uploads/                  # (이동 — 현 src/infra/uploads/)
│   │   ├── api.js
│   │   ├── endpoints.js
│   │   ├── slices.js
│   │   ├── thunks.js
│   │   └── index.js
│   ├── analytics/                # (이동 옵션 — 현 src/app/analytics/)
│   ├── health/                   # (신규 후보)
│   ├── files/                    # (신규 후보 — download / blob)
│   └── settings/                 # (신규 후보)
├── http/                         # (신규 — axios instance + interceptor)
│   ├── client.js                 # (이동 — 현 src/app/store/APIConfig.js)
│   ├── interceptors.js
│   └── index.js
└── config/                       # (신규 — runtime config)
    ├── env.js                    # VITE_API_BASE_URL / runtime-config 통합
    └── index.js
```

#### 의미
- `infra/` = "infrastructure layer" — 비-도메인 인프라 코드 (네트워크 / config / 외부 서비스 통신)
- `infra/api/` = 외부 API 통신 모듈
- `infra/http/` = HTTP client (axios instance) — API call 과 분리
- `infra/config/` = runtime / build config

#### 장점
- **현 `src/infra/uploads/` 위치 보존** + 하위 표준화 → **마이그레이션 비용 최소** (uploads 자체는 1 depth 만 변경)
- `infra` = "네트워크 / 외부 서비스 / 인프라" 의미 가장 명확 (Hexagonal / Clean Architecture 영향)
- `app/store/APIConfig.js` 같은 위치 부적절 파일도 자연스럽게 흡수 (`infra/http/client.js`)
- `global/` (UI + utils) 과 **책임 분리 명확** — global = "재사용 코드", infra = "외부 시스템 통신"

#### 단점
- `infra` 라는 용어가 일부 개발자에게 익숙하지 않을 수 있음
- 기존 `global/utils` 와 **카테고리 구분이 필요** — utils 는 순수 함수, infra 는 부수효과 (외부 통신 / 환경 의존) 라는 룰 명시 필요
- 신규 카테고리 (`http`, `config`) 추가 시 폴더 depth 증가

#### 마이그레이션 영향도

| 변경 | 영향 |
|---|---|
| `src/infra/uploads/` → `src/infra/api/uploads/` 이동 | 5 파일 import path 갱신 (1 depth 추가) |
| `src/app/store/APIConfig.js` → `src/infra/http/client.js` 이동 (선택) | 11+ 파일 import 갱신 (모든 api.js + uploads thunk) |
| `web/public/runtime-config.js` ↔ `infra/config/env.js` 통합 | env 도입 시 별도 라운드 |
| analytics 이전 (옵션) | 12+ 파일 import 갱신 |

---

## 4. 표준 모듈 구조 (각 전역 API 별)

각 옵션 공통 — 단일 모듈 (예: `uploads/`, `analytics/`, `health/`) 내부 표준 layout:

```text
{global-api-folder}/{moduleName}/
├── api.js              # axios call (fetch{Action}{Resource})
├── endpoints.js        # path 상수 ({MODULE}.{ACTION} = "/path/{param}")
├── types.js or dto.js  # request / response shape (JSDoc 또는 TS 마이그 후 type)
├── slices.js           # Redux slice (선택 — Redux 통합 필요한 모듈만)
├── thunks.js           # createAsyncThunk (선택 — Redux 통합 모듈만)
├── hooks.js            # React hooks wrapper (선택 — Redux 미통합 모듈은 hooks 직접 사용)
└── index.js            # barrel export
```

### 결정 가이드 (어떤 파일 포함하는지)

| 모듈 성격 | 필수 | 선택 |
|---|---|---|
| Redux 통합 (예: uploads) | api / endpoints / slices / thunks / index | dto / hooks |
| Redux 비통합 hooks 패턴 (예: file utils) | api / endpoints / hooks / index | dto |
| 순수 SDK (예: analytics ga.js) | (api 없음 — 외부 SDK 호출 wrapper) ga.js / events/ / hooks/ / index | - |

### 명명 컨벤션

- 파일명: `kebab-case` 또는 `camelCase` (현 코드베이스 = camelCase, 일관성 유지)
- API 함수: `fetch{Action}{Resource}(params)` (예: `fetchAdminUploadImageFile`) 또는 `{action}{Resource}` (예: `uploadImage`) — 사용자 결정 필요
- endpoint 상수: `SCREAMING_SNAKE_CASE` 객체 (예: `UPLOAD_FILE.IMAGES`)
- thunk: `request{Action}{Resource}` (예: `requestUploadImage`) — 도메인 store 와 정합

### 도메인 API 와의 경계

| 위치 | 책임 | 호출 패턴 |
|---|---|---|
| `domains/{domain}/store/{public,admin}/api.js` | 단일 도메인 API (Redux thunks 와 결합) | `dispatch(requestX())` |
| `{global-api-folder}/{module}/api.js` | 횡단 API — 다수 도메인 / global layout 공유 | `dispatch(requestX())` 또는 `import { fetchX } from '@/...'` 직접 호출 |

판단 룰: **"이 API 가 2개 이상 도메인에서 호출되거나 도메인 비종속 layout 에서 호출되는가?"** YES → 전역 / NO → 도메인.

---

## 5. axios instance 정합

### 현 상태
- `web/src/app/store/APIConfig.js` 가 `axios.create()` instance (`API`) export
- 위치 부적절: `app/store/` 는 Redux store 폴더 — axios instance 와 의미 안 맞음 (현재 import 11+ 파일에서 `@/app/store/APIConfig.js` 사용 중)
- baseURL 하드코딩 (`http://localhost:8080/api`) — production 미적용

### 제안 (옵션 C 의 경우)
- `src/infra/http/client.js` 로 이동 — `import { API } from "@/infra/http"` 패턴
- baseURL → env 변수: `import.meta.env.VITE_API_BASE_URL` (Vite) + fallback `http://localhost:8080/api`
- 또는 runtime-config 보존: `window.__CONFIG__?.API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api"`

### 제안 (옵션 A / B 의 경우)
- `src/global/api/_http/client.js` 또는 `src/shared/api/_client.js` 로 이동
- 또는 위치 유지 + import path 만 일관화 — 사용자 결정 사항

### 마이그레이션 영향
- import path 갱신: 11+ 파일 (모든 도메인 api.js + infra/uploads/api.js + AppProvider 등)
- baseURL env 화: `.env.local` / `.env.production` 신설 필요 + 운영 배포 시점 정합 필요

---

## 6. 향후 추가될 전역 API 후보 (사용자 확인용)

현 코드베이스에서 식별한 후보 + 일반적 횡단 API:

| 후보 | 위치 (옵션 C 기준) | 현 상태 | 우선순위 |
|---|---|---|---|
| **uploads** | `infra/api/uploads/` | ✅ 존재 (`src/infra/uploads/`) — 이전 대상 | P0 (본 제안 핵심) |
| **analytics** | `infra/api/analytics/` 또는 별도 | ✅ 존재 (`src/app/analytics/`) — 위치 부적절 가능 | P0 (본 제안과 동시 정리 권고) |
| **http client** | `infra/http/` | ✅ 존재 (`src/app/store/APIConfig.js`) — 위치 부적절 | P0 (본 제안과 동시 정리 권고) |
| **runtime config / env** | `infra/config/` | 부분 존재 (`web/public/runtime-config.js` + 하드코딩) | P1 (env 화 결정 시) |
| **health check** | `infra/api/health/` | 도메인 종속 (authentication 의 `fetchHealthCheck`) | P2 (현재 도메인 책임 — 이전 불요) |
| **file utilities** | `infra/api/files/` | 미존재 — 향후 download / blob URL / 파일 변환 필요 시 | P2 (요구 발생 시) |
| **device info** | `infra/api/device/` | 미존재 — 모바일 / desktop / OS 분기 hooks 필요 시 | P2 (요구 발생 시) |
| **settings / config fetch** | `infra/api/settings/` | 미존재 — 글로벌 BE 설정 fetch 필요 시 | P2 (요구 발생 시) |
| **notifications / push** | `infra/api/notifications/` | 미존재 | P3 (기획 시) |

---

## 7. 추천

### 추천 옵션: **옵션 C (`src/infra/` 표준화)**

#### 사유

1. **현 위치 보존 + 점진적 마이그레이션**
   - `src/infra/uploads/` 는 이미 존재 → `src/infra/api/uploads/` 로 1 depth 추가만 하면 됨
   - 옵션 A/B 는 폴더 자체 이동 → 영향 파일은 같지만 "기존 결정과의 일관성" 이 옵션 C 에 유리

2. **`infra` = 외부 통신 / 인프라 의미가 가장 명확**
   - Hexagonal / Clean Architecture 의 "infrastructure layer" 컨벤션
   - `global/` (UI + utils 재사용) 과 책임 명확 분리: global = "재사용 코드", infra = "외부 시스템 통신"
   - `app/store/APIConfig.js` (위치 부적절) 같은 파일도 자연스럽게 흡수 가능

3. **확장성**
   - `infra/api/` (외부 API), `infra/http/` (HTTP client), `infra/config/` (env) 같은 카테고리 분리 가능
   - 향후 `infra/storage/` (localStorage / IndexedDB wrapper), `infra/auth/` (token 관리) 등 추가 가능

4. **사용자 명시 정책 정합**
   - 사용자: "src/infra 에 uploads api 존재 (S3 연관, 전역 사용)" — `infra` 가 이미 전역 인프라 의미로 쓰이고 있음을 인지
   - 옵션 A/B 로 이동 시 기존 결정 번복 → 불필요한 변경

#### 차선책: 옵션 A
- `global/` 만으로 모든 횡단 코드를 통일하고 싶다면 옵션 A 가 일관성 측면 우수
- 단점: `global/` 의 의미가 "UI + utils + API" 까지 확장되어 흐려짐

---

## 8. 사용자 확인 항목

다음 5개 항목 사용자 확인 필요. 각 항목 결정 후 **별도 마이그레이션 라운드** 진행.

### Q1. 옵션 선택
- [ ] 옵션 A — `src/global/api/` (global/ui, utils 와 일관)
- [ ] 옵션 B — `src/shared/api/` 또는 `src/services/` (비-UI 인프라 의미 명확)
- [ ] **옵션 C — `src/infra/` 표준화** (agent 추천)
- [ ] 다른 안 (사용자 제시)

### Q2. 표준 모듈 구조 확정
- [ ] 본 제안 § 4 의 `api / endpoints / types / slices / thunks / hooks / index` 패턴 OK
- [ ] 일부 변경 (예: `dto.js` 명칭 vs `types.js` / `hooks.js` 위치)
- [ ] 다른 패턴

### Q3. axios instance 이전 여부
- [ ] `app/store/APIConfig.js` → `infra/http/client.js` (또는 옵션 A/B 위치) 이전 진행
- [ ] 위치 보존 + path alias 일관화만
- [ ] 본 라운드 보류 (별도 결정)

### Q4. baseURL env 화
- [ ] `import.meta.env.VITE_API_BASE_URL` 도입 (Vite 표준)
- [ ] `window.__CONFIG__.API_BASE_URL` (runtime-config) 활성화 + APIConfig.js 주석 해제
- [ ] 둘 다 (env build-time + runtime-config 우선) 통합
- [ ] 본 라운드 보류

### Q5. analytics (`src/app/analytics/`) 동시 이전 여부
- [ ] 본 라운드와 동시 이전 (전역 카테고리 일관성)
- [ ] 별도 라운드 (analytics 자체 영향 12+ 파일 → 분리 commit 권장)
- [ ] 위치 보존 (`app/` = 앱 부팅 / global config 의미로 적절)

### Q6. 향후 전역 API 후보 우선순위
사용자가 P0/P1/P2/P3 우선순위 확정 — § 6 표 참조.

### Q7. 마이그레이션 시점
- [ ] 즉시 (다음 라운드)
- [ ] 다른 도메인 정리 (community / authentication IA 재개 등) 후
- [ ] 사용자 별도 지시 시점

---

## 9. 부록 — 본 제안 범위 외 (참고)

### 본 제안에서 다루지 않는 항목

- **도메인 API** (`domains/{domain}/store/`) — 도메인 책임 유지, 이동 X
- **BE / DB 변경** — 본 제안은 FE 폴더 구조만
- **TypeScript 마이그레이션** — `types.js` 표기는 JSDoc 기반, TS 마이그는 별도 결정
- **Redux Toolkit Query / RTK Query 도입** — 현 패턴 (axios + createAsyncThunk) 유지 전제

### 본 제안 적용 후 자연 해소 가능한 사이드 이슈

- `web/public/runtime-config.js` ↔ `APIConfig.js` 의 baseURL 이중 정의 (Q4 동시 해결)
- `useHeaderAuth.js:12` / `useAuthentication.js:9` 의 `http://localhost:8080/api/auth/naver/callback` 하드코딩 (env 도입 시 `${baseURL}/auth/naver/callback` 으로 정리 가능)
- `_overview.md § 1.2` 의 hardcoded baseURL 이슈 (Q4 해결 시 docs 갱신)

---

## 10. 변경 이력

| Date | Action | By |
|---|---|---|
| 2026-05-09 | 제안서 신설 (옵션 A/B/C + 사용자 확인 항목 8개 정리) | manual |
