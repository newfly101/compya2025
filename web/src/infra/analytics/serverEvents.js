// infra/analytics/serverEvents.js
// GA 와 별개로 우리 서버(POST /api/analytics/events)에도 행동 이벤트를 쌓는다.
// 즉시 보내지 않고 모았다가(최대 20건 또는 4초) sendBeacon 으로 묶어 보낸다 —
// 페이지 이탈 직전에도 유실 없이 나가는 게 핵심이라 fetch 보다 beacon 을 우선한다.
// ⚠️ 실패해도 화면에 아무 영향이 없어야 한다 — throw 금지, 운영 콘솔 로그도 남기지 않는다.
import { ANALYTICS_ENABLED, API_BASE_URL } from "@/config/env.js";
import { getOrCreateAnonId } from "@/infra/analytics/anonId.js";

const ENDPOINT = `${API_BASE_URL}/analytics/events`;
const FLUSH_INTERVAL_MS = 4000;
const MAX_BATCH_SIZE = 20;
const isDev = import.meta.env.DEV;

let queue = [];
let flushTimer = null;

const buildEvent = (eventType, payload = {}) => ({
  eventType,
  anonId: getOrCreateAnonId(),
  pagePath: window.location.pathname,
  referrer: document.referrer || undefined,
  occurredAt: new Date().toISOString(),
  ...payload,
});

const send = (events) => {
  if (events.length === 0) return;
  const body = JSON.stringify({ events });

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(ENDPOINT, blob)) return;
    }
  } catch (error) {
    if (isDev) console.debug("[analytics] sendBeacon 실패, fetch 로 폴백", error);
  }

  // beacon 이 없거나 실패한 경우에만 fetch. 응답을 기다리지 않고 catch 는 개발 모드에만 로그.
  fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
    credentials: "include",
  }).catch((error) => {
    if (isDev) console.debug("[analytics] 전송 실패", error);
  });
};

export const flush = () => {
  if (queue.length === 0) return;
  const batch = queue.splice(0, MAX_BATCH_SIZE);
  send(batch);
  if (queue.length > 0) flush(); // 20건 초과분이 남아있으면 이어서
};

const scheduleFlush = () => {
  if (flushTimer) return;
  flushTimer = setTimeout(() => {
    flushTimer = null;
    flush();
  }, FLUSH_INTERVAL_MS);
};

export const enqueueEvent = (eventType, payload) => {
  if (!ANALYTICS_ENABLED) return; // 스위치 꺼짐 — 쿠키도, 요청도 만들지 않는다
  try {
    queue.push(buildEvent(eventType, payload));
  } catch (error) {
    if (isDev) console.debug("[analytics] 이벤트 적재 실패", error);
    return;
  }
  if (queue.length >= MAX_BATCH_SIZE) flush();
  else scheduleFlush();
};

// 탭을 떠나는 시점(hidden/pagehide)에 남은 큐를 비운다 — 이탈 추적의 핵심.
// ANALYTICS_ENABLED 가 꺼져 있으면 큐가 항상 비어 있어 flush 가 그냥 no-op.
if (typeof document !== "undefined") {
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") flush();
  });
  window.addEventListener("pagehide", () => flush());
}
