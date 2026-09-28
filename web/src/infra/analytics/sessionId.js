// infra/analytics/sessionId.js
// 세션 식별 쿠키. anonId.js 쌍둥이 — 다른 점은 만료가 30분 무활동이라는 것뿐.
// 별도 expiresAt 필드 없이 쿠키 Max-Age 자체로 "활동 시 갱신" 요구를 충족한다 —
// 매 이벤트 전송(getOrCreateSessionId 호출)마다 쿠키를 다시 써서 만료시각을 슬라이딩.
// 활동이 없으면 브라우저가 30분 뒤 자동 만료 → 다음 읽기에서 신규 발급.
import { ANALYTICS_ENABLED } from "@/config/env.js";

export const SESSION_ID_COOKIE = "cpf_session_id";
const THIRTY_MIN_SECONDS = 60 * 30;

const readCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

const writeCookie = (name, value, maxAgeSeconds) => {
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
};

const generateUuid = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const getOrCreateSessionId = () => {
  if (!ANALYTICS_ENABLED) return null;

  const id = readCookie(SESSION_ID_COOKIE) ?? generateUuid();
  writeCookie(SESSION_ID_COOKIE, id, THIRTY_MIN_SECONDS); // 매 호출마다 다시 써 만료시각 슬라이딩
  return id;
};
