// .env 파일 폐기 — 시크릿 없는 공개 endpoint 만 빌드타임 분기로 처리.
const isProd = import.meta.env.PROD;

export const API_BASE_URL = isProd
  ? "https://api.compyafun.com/api"
  : "http://localhost:8080/api";

export const COUPON_BASE_URL = "http://withhive.me/399";

// 사용자 행동 서버 수집 스위치. 개인정보처리방침 개정본 시행일(2026-09-17) 지남 — 켜짐.
// 꺼두려면 이 값만 false 로 되돌린다. anon_id 쿠키 생성·POST /api/analytics/events 호출이 함께 멈춘다.
export const ANALYTICS_ENABLED = true;
