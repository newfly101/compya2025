// .env 파일 폐기 — 시크릿 없는 공개 endpoint 만 빌드타임 분기로 처리.
const isProd = import.meta.env.PROD;

export const API_BASE_URL = isProd
  ? "https://api.compyafun.com/api"
  : "http://localhost:8080/api";

export const COUPON_BASE_URL = "http://withhive.me/399";

// 사용자 행동 서버 수집 스위치. 개인정보처리방침 개정본 시행일(2026-09-17) 전까지는 꺼둔다.
// 꺼져 있으면 anon_id 쿠키를 만들지도, POST /api/analytics/events 를 호출하지도 않는다.
// 17일 이후 이 값만 true 로 바꾸면 켜진다.
export const ANALYTICS_ENABLED = false;
