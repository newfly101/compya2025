// GA 이벤트 진입점 — 브라우저에서만 동작한다(서버 렌더 중 호출돼도 무해).
// TODO(next-migration): 서버 수집(serverEvents · anonId · sessionId)과 SERVER_EVENT_MAP 은 미이전 — 로그인 이벤트는 GA 전용이라 영향 없음
const isDev = () =>
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const pushEvent = (event) => {
  if (typeof window === "undefined") return;
  const { event: eventName, ...params } = event;
  if (!isDev()) {
    window.gtag?.("event", eventName, params);
  } else {
    console.log("[GA]", event);
    window.gtag?.("event", `[GA]${eventName}`, params);
  }
};

export const setUserProperties = (userRole) => {
  if (typeof window === "undefined") return;
  const role = isDev() ? `[GA]${userRole}` : userRole;
  window.gtag?.("set", "user_properties", { user_role: role });
  window.gtag?.("event", "user_role_set", { user_role: role });
};
