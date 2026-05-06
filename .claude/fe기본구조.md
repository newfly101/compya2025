# FE 기본 구조 가이드 (Mobile First 리뉴얼)

> 기준 도메인: `web/src/domains/coupons`
> 목적: 기존 PC 버전 → Mobile First 재구성 패턴 문서화

---

## 폴더 구조

```
domains/{domain}/
├── mobile/                          ← 모바일 UI 루트
│   ├── {DomainScreen}.jsx           ← 메인 페이지 컴포넌트
│   ├── {DomainScreen}.module.scss
│   ├── components/
│   │   └── {componentName}/
│   │       ├── {ComponentName}.jsx
│   │       └── {ComponentName}.module.scss
│   ├── containers/
│   │   └── public/
│   │       ├── {Domain}ListVertical.jsx
│   │       ├── {Domain}ListHorizontal.jsx
│   │       └── {Domain}List.module.scss
│   └── hooks/
│       └── use{DomainName}.js       ← 화면 표시용 데이터 가공 훅
└── store/
    ├── slices.js                    ← Redux slice (상태 저장)
    ├── dto.js                       ← (선택) 요청 데이터 변환 함수
    ├── public/
    │   ├── endpoints.js             ← API 경로 상수
    │   ├── api.js                   ← HTTP 호출 함수
    │   └── thunks.js                ← 비동기 액션 + 비즈니스 로직
    └── admin/
        ├── endpoints.js
        ├── api.js
        └── thunks.js
```

---

## 계층별 책임

| 계층 | 파일 | 역할 |
|------|------|------|
| Endpoints | `store/*/endpoints.js` | API 경로 상수만 정의 |
| API | `store/*/api.js` | HTTP 호출만 담당 (래퍼 함수) |
| Thunks | `store/*/thunks.js` | API 호출 + 원본 데이터 가공 (필터링, 정렬) |
| DTO | `store/dto.js` | 요청 데이터 변환 (선택 — 필드 정제가 필요한 도메인만) |
| Slice | `store/slices.js` | 상태 저장 (`applyAsyncHandlers` 사용) |
| Hook | `mobile/hooks/use*.js` | 화면 표시용 데이터 가공 (분류, 변환) |
| Container | `mobile/containers/` | 리스트 컨테이너 — hook 호출 후 컴포넌트에 전달 |
| Component | `mobile/components/` | UI 렌더링 전담 |
| Screen | `mobile/*Screen.jsx` | 페이지 조립 — 섹션 구성 |

---

## 데이터 흐름

```
Screen.jsx
  ↓ (hook 호출)
use{Domain}.js                  ← dispatch thunk, 데이터 가공
  ↓
store/public/thunks.js          ← API 호출, 필터링/정렬
  ↓
store/public/api.js             ← HTTP 요청
  ↓ (응답)
store/slices.js                 ← 상태 업데이트
  ↓
hook: 화면용으로 가공 (e.g. 활성/종료 분리)
  ↓
Container → Component
```

---

## Mobile First 전환 규칙

### 삭제 대상 (PC 전용)
- `pc/` 폴더 전체
- PC 전용 레이아웃 컴포넌트
- 반응형이 아닌 고정 width 스타일

### 유지/이관 대상
- `store/` 폴더는 PC/모바일 공용 — 그대로 유지
- 비즈니스 로직 (thunks 내 필터링, 정렬) — 그대로 유지
- `mobile/` 폴더 구조를 기준으로 새로 구성

### 모바일 컴포넌트 작성 규칙
- 파일 위치: `mobile/components/{componentName}/`
- 스타일: SCSS Modules (`*.module.scss`)
- 레이아웃: `flex-col`, `scroll-row` mixin 우선 사용
- 간격: 디자인 토큰 (`$space-*`) 사용, 하드코딩 금지
- 색상: CSS 변수 (`--color-*`) 사용, 하드코딩 금지

---

## 스타일링 패턴

```scss
/* 디자인 토큰 */
$space-1, $space-2, $radius-xl, $letter-spacing-wide

/* CSS 변수 */
--color-bg-card, --color-brand-dark, --color-text-primary

/* Mixin */
@include text-body;
@include flex-col;
@include scroll-row;

/* 상태 처리 */
.component {}           // 기본(활성) 상태
.component.disabled {}  // 비활성 상태 (투명도, 색상 변경)
.component.expired {}   // 종료 상태
```

---

## 컴포넌트 Props 패턴

```jsx
// 카드 컴포넌트 예시
{
  item: { id, title, detail, ... },
  showDetail: boolean,   // true: 상세모드 / false: 간략모드 (홈 노출용)
  isExpired: boolean     // true: 종료 스타일
}

// 리스트 컨테이너 예시
{
  items: Item[],
  isExpired: boolean     // 하위 카드로 전달
}
```

---

## Redux Slice 상태 구조

```javascript
{domain}: {
  {items}: [],
  loading: false,
  error: null
}
```

---

## 외부 공용 모듈 참고

| 모듈 경로 | 용도 |
|-----------|------|
| `@/global/ui/mobile/section/SectionBlock` | 섹션 래퍼 컴포넌트 |
| `@/global/utils/datetime/dateUtils` | 날짜 포맷 유틸 |
| `@/global/handler/applyAsyncHandlers` | Redux 비동기 핸들러 유틸 |
| `@/app/analytics/events/{domain}Events` | GA 이벤트 트래킹 |

---

## DTO 패턴 (선택)

API 요청 시 전송할 필드를 정제해야 하는 경우 `store/dto.js`를 추가한다.

```javascript
// store/dto.js 예시
export const baseDomainDTO = (state) => {
  const dto = { title: state.title, detail: state.detail };
  if (state.imageUrl) dto.imageUrl = state.imageUrl;
  return dto;
};
```

**사용 위치**: `store/admin/thunks.js` 내 create/update 액션에서만 사용.
**추가 조건**: 단순 전달이면 불필요, 필드 선택·변환이 필요할 때만 생성.

---

## 신규 도메인 추가 체크리스트

- [ ] `store/public/endpoints.js` — API 경로 정의
- [ ] `store/public/api.js` — API 호출 함수
- [ ] `store/public/thunks.js` — 비동기 액션 (필터링/정렬 포함)
- [ ] `store/slices.js` — Redux slice 등록
- [ ] `store/dto.js` — 요청 데이터 변환 (필요 시)
- [ ] `mobile/hooks/use{Domain}.js` — 화면용 데이터 가공 훅
- [ ] `mobile/components/{item}/` — 카드/아이템 컴포넌트
- [ ] `mobile/containers/public/` — 리스트 컨테이너 (Vertical/Horizontal)
- [ ] `mobile/{Domain}Screen.jsx` — 메인 화면 조립
- [ ] GA 이벤트 연결 (`@/app/analytics/events/`)
