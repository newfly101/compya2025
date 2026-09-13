// web/src/infra/http/authSessionMarker.js
//
// "로그인한 적이 있다" 는 힌트만 localStorage 에 남긴다. 진짜 인증 여부는
// httpOnly 쿠키를 가진 서버만 판정할 수 있다 — FE 는 쿠키를 직접 못 읽는다.
//
// 용도: 비로그인 방문자가 GET /users/me, POST /auth/refresh 를 불필요하게
// 호출해 401 콘솔 노이즈를 만드는 것을 막는다. 마커가 있는데 실제로는
// 세션이 만료된 경우 기존 흐름(401 → refresh → 실패 → 마커 제거) 그대로 동작한다.
const AUTH_SESSION_KEY = "auth:hasSession";

export const hasAuthSessionMarker = () => localStorage.getItem(AUTH_SESSION_KEY) === "1";

export const setAuthSessionMarker = () => {
  localStorage.setItem(AUTH_SESSION_KEY, "1");
};

export const clearAuthSessionMarker = () => {
  localStorage.removeItem(AUTH_SESSION_KEY);
};
