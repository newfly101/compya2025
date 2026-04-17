# Authentication Domain Guide

## 1. 목적

네이버 OAuth2.0 기반 로그인/로그아웃 및 사용자 인증 상태 관리를 담당한다.  
JWT는 BE에서 쿠키로 관리하며, FE는 healthCheck API 응답으로 인증 상태를 판단한다.

---

## 2. 폴더 구조

```text
authentication/
├── callback/
│   └── AuthCallBack.jsx       ← 네이버 로그인 콜백 처리 (라우트 진입점)
├── hooks/
│   └── useAuthentication.js   ← 로그인/로그아웃/인증 상태 훅
└── store/
    ├── api.js                 ← API 호출
    ├── endpoints.js           ← API 경로 상수
    ├── slices.js              ← 인증 상태 저장소
    └── thunks.js              ← 비동기 액션
```

---

## 3. 파일별 역할

### `callback/AuthCallBack.jsx`
네이버 로그인 완료 후 BE가 FE로 리다이렉트하는 진입점.  
마운트 시 `requestUserHealthCheck` 를 호출해 사용자 정보를 가져온다.  
완료 후 `sessionStorage` 에 저장된 이전 경로로 복귀하거나 `/` 로 이동한다.

### `hooks/useAuthentication.js`
컴포넌트에서 인증 관련 기능을 사용할 수 있는 커스텀 훅.  
`isAuthenticated` 는 `user !== null` 로 파생한다.

**반환값:**
| 값 | 타입 | 설명 |
|----|------|------|
| `isAuthenticated` | `boolean` | 로그인 여부 |
| `user` | `object \| null` | 사용자 정보 |
| `userRole` | `string \| null` | 사용자 권한 (`ADMIN` / `USER`) |
| `login` | `function` | 네이버 로그인 시작 |
| `logout` | `function` | 로그아웃 처리 |

### `store/slices.js`
인증 상태를 Redux store에 저장한다.

**상태 구조:**
```js
{
  user: null,        // 사용자 정보 객체
  userRole: null,    // "ADMIN" | "USER"
  initialized: false // healthCheck 완료 여부
}
```

### `store/thunks.js`
| 액션 | 설명 |
|------|------|
| `requestUserHealthCheck` | `/users/me` 호출 → 사용자 정보 store 저장 |
| `requestUserLogout` | `/auth/logout` 호출 → 쿠키 제거 |

### `store/api.js`
| 함수 | 메서드 | 경로 |
|------|--------|------|
| `fetchHealthCheck` | GET | `/users/me` |
| `fetchLogout` | POST | `/auth/logout` |

---

## 4. 인증 흐름

### 로그인
```
1. login() 호출
   → sessionStorage에 현재 경로 저장
   → 네이버 OAuth URL로 리다이렉트

2. 네이버 인증 완료
   → BE /api/auth/naver/callback 처리
   → JWT 쿠키 발급
   → FE /auth/callback 으로 리다이렉트

3. AuthCallBack.jsx 마운트
   → requestUserHealthCheck() 호출
   → store에 user, userRole 저장
   → sessionStorage 경로로 복귀 (없으면 /)
```

### 로그아웃
```
1. logout() 호출
   → requestUserLogout() → BE 쿠키 제거
   → clearUser() → store 초기화
   → / 로 이동
```

### 앱 진입 시 인증 상태 복구
```
1. AuthProvider 마운트
   → requestUserHealthCheck() 호출
   → 성공: user, userRole store 저장, initialized = true
   → 실패(401): user = null, initialized = true (비로그인 처리)
```

---

## 5. 라우트 보호

### AuthGuard
로그인이 필요한 라우트를 보호한다.  
비로그인 접근 시 `sessionStorage` 에 현재 경로를 저장하고 `/` 로 리다이렉트한다.

```jsx
// UserRoutes.jsx
{
  element: <AuthGuard allow={["ADMIN", "USER"]} />,
  children: [
    { path: "mypage", element: <MyPage /> },
  ]
}

// AdminRoutes.jsx
{
  element: <AuthGuard allow={["ADMIN"]} />,
  children: [
    { path: "admin", element: <AdminPage /> },
  ]
}
```

---

## 6. BE 응답 구조

### GET `/api/users/me`
```json
{
  "success": true,
  "code": "AUTH_SUCCESS",
  "data": {
    "id": 1,
    "nickname": "새벽",
    "email": "user@naver.com",
    "profileImage": "https://...",
    "userRole": "ADMIN",
    "lastLoginAt": "2026-04-17 14:42"
  }
}
```

비로그인 시 `401 Unauthorized` 반환 → FE에서 비로그인 상태로 처리.

---

## 7. GA4 이벤트

| 이벤트 이름 | 발생 시점 |
|------------|----------|
| `user_login` | 일반 유저 로그인 완료 |
| `admin_login` | 어드민 로그인 완료 |
| `dev_login` | localhost 로그인 완료 |
| `user_logout` | 일반 유저 로그아웃 |
| `admin_logout` | 어드민 로그아웃 |
| `dev_logout` | localhost 로그아웃 |

이벤트는 `app/analytics/events/authEvents.js` 에서 관리한다.

---

## 8. 외부 의존성

| 모듈 | 경로 | 용도 |
|------|------|------|
| `pushEvent` | `@/app/analytics/ga` | GA4 이벤트 전송 |
| `AuthProvider` | `@/app/provider/AuthProvider` | 앱 진입 시 healthCheck |
| `AuthGuard` | `@/app/router/guards/AuthGuard` | 라우트 접근 제어 |

---

## 9. 환경별 설정

| 환경 | REDIRECT_URI |
|------|-------------|
| localhost | `http://localhost:8080/api/auth/naver/callback` |
| production | `https://api.compyafun.com/api/auth/naver/callback` |

`NAVER_CLIENT_ID` 는 `useAuthentication.js` 상단 상수로 관리한다.

---

## 10. 수정 가이드

### 로그인 로직을 수정할 때
- `hooks/useAuthentication.js`

### 사용자 정보 저장 구조를 수정할 때
- `store/slices.js`
- `store/thunks.js`

### 콜백 처리를 수정할 때
- `callback/AuthCallBack.jsx`

### API 경로를 수정할 때
- `store/endpoints.js`
- `store/api.js`

### GA 이벤트를 수정할 때
- `app/analytics/events/authEvents.js`

---

## 11. 규칙

- `isAuthenticated` 는 store에 저장하지 않고 `user !== null` 로 파생한다.
- `initialized` 는 앱 최초 진입 시 healthCheck 완료 여부만 나타내며, 로그아웃 시 변경하지 않는다.
- JWT 검증은 BE에서 담당하며, FE는 healthCheck 응답으로만 인증 상태를 판단한다.
- 로그인 시도 전 반드시 `sessionStorage` 에 현재 경로를 저장해 로그인 후 원래 페이지로 복귀한다.
- API 응답 가공(`userRole` 분리)은 `thunks.js` 에서 처리하며, 컴포넌트에서 직접 가공하지 않는다.
