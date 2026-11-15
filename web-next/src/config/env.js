// env 접근은 이 파일 한 곳에서만. 서버 컴포넌트는 API_INTERNAL_URL, 브라우저는 NEXT_PUBLIC_API_URL.
export const API_INTERNAL_URL = process.env.API_INTERNAL_URL ?? "http://localhost:8080/api";
if (process.env.NODE_ENV === "production" && !process.env.API_INTERNAL_URL) {
  console.warn("[env] API_INTERNAL_URL 미설정 — 서버 렌더가 http://localhost:8080/api 를 호출한다");
}
export const API_PUBLIC_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.compyafun.com/api";

export const COUPON_BASE_URL = "http://withhive.me/399";
export const SITE_URL = "https://compyafun.com";
