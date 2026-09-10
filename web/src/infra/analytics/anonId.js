// infra/analytics/anonId.js
// 익명 방문자 식별 쿠키. 방침에 이 이름(cpf_anon_id)으로 고지될 예정이라 바꾸지 않는다.
// ANALYTICS_ENABLED 가 꺼져 있으면 쿠키 자체를 만들지 않는다 — 방침 개정 전 고지 없는 수집 방지.
import { ANALYTICS_ENABLED } from "@/config/env.js";

export const ANON_ID_COOKIE = "cpf_anon_id";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

const readCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const writeCookie = (name, value, maxAgeSeconds) => {
  // 운영(https)에서만 Secure — 로컬 http 에서 Secure 를 붙이면 쿠키가 아예 안 심긴다
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
};

// crypto.randomUUID 가 없는 구형 브라우저 대비 폴백
const generateUuid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// 같은 탭 안에서 매 이벤트마다 document.cookie 를 다시 파싱하지 않도록 메모리에도 캐시
let cached = null;

export const getOrCreateAnonId = () => {
  if (!ANALYTICS_ENABLED) return null;
  if (cached) return cached;

  const existing = readCookie(ANON_ID_COOKIE);
  if (existing) {
    cached = existing;
    return cached;
  }

  const next = generateUuid();
  writeCookie(ANON_ID_COOKIE, next, ONE_YEAR_SECONDS);
  cached = next;
  return cached;
};
