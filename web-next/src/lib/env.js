// env 접근은 이 파일 한 곳에서만. 서버 컴포넌트는 API_INTERNAL_URL, 브라우저는 NEXT_PUBLIC_API_URL.
// 운영 빌드/런타임에 미설정이면 조용히 localhost 로 가지 않도록 즉시 실패. 개발은 localhost 폴백.
// 서버에서만 검사 — 이 파일은 client 컴포넌트도 import 하고, 브라우저 번들엔 API_INTERNAL_URL 이 없다.
if (typeof window === "undefined" && process.env.NODE_ENV === "production" && !process.env.API_INTERNAL_URL) {
  throw new Error("[env] API_INTERNAL_URL 미설정 — 운영 빌드·실행에는 서버→API 주소가 필요하다");
}
export const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:8080/api";
export const API_PUBLIC_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.compyafun.com/api";

export const COUPON_BASE_URL = "http://withhive.me/399";
export const SITE_URL = "https://compyafun.com";
