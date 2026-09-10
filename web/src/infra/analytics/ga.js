// infra/analytics/ga.js
import { enqueueEvent } from "@/infra/analytics/serverEvents.js";

const isDev = window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"

// GA 이벤트 이름 ↔ 우리 서버 eventType 은 1:1 이 아니라 여기서 매핑한다.
// GA 에 아예 없던 새 이벤트(검색/외부이동)는 이 표에 안 넣고 호출부에서 enqueueEvent 를 직접 부른다
// (지킬 기존 GA 동작이 없으므로 나란히 보낼 필요도 없다).
const SERVER_EVENT_MAP = {
  page_view: (p) => ["PAGE_VIEW", { pagePath: p.page_path }],
  coupon_clicked: (p) => ["CONTENT_CLICK", { contentType: "COUPON", contentId: p.coupon_code, targetUrl: p.coupon_target_url }],
  event_clicked: (p) => ["CONTENT_CLICK", { contentType: "EVENT", contentId: String(p.event_id ?? ""), targetUrl: p.event_external_link }],
}

export const pushEvent = (event) => {
  const { event: eventName, ...params } = event
  if (!isDev) {
    window.gtag?.("event", eventName, params)
  } else {
    console.log("[GA]", event)
    window.gtag?.("event", `[GA]${eventName}`, params)
  }

  // 서버 수집은 GA 성공/실패와 무관한 별개 파이프라인
  const mapEntry = SERVER_EVENT_MAP[eventName]
  if (mapEntry) {
    const [serverEventType, payload] = mapEntry(params)
    enqueueEvent(serverEventType, payload)
  }
}

export const setUserProperties = (userRole) => {
  console.log("setUserProperties:", userRole);
  window.gtag?.('set', 'user_properties', {
    user_role: isDev ? `[GA]${userRole}` : userRole,
  })
  window.gtag?.('event', 'user_role_set', {
    user_role: isDev ? `[GA]${userRole}` : userRole,
  })
}
