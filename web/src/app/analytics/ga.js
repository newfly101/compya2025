// app/analytics/ga.js
const isDev = window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"

export const pushEvent = (event) => {
  const { event: eventName, ...params } = event
  if (!isDev) {
    window.gtag?.("event", eventName, params)
  } else {
    console.log("[GA]", event)
    window.gtag?.("event", `[GA]${eventName}`, params)
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
