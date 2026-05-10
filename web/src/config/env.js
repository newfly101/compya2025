// .env 파일 폐기 — 시크릿 없는 공개 endpoint 만 빌드타임 분기로 처리.
const isProd = import.meta.env.PROD;

export const API_BASE_URL = isProd
  ? "https://api.compyafun.com/api"
  : "http://localhost:8080/api";

export const COUPON_BASE_URL = "http://withhive.me/399";
