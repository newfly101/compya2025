// app/analytics/ga.js
const isDev = window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"

export const pushEvent = (event) => {
  if (isDev) {
    console.log("[GA]", event)
    return
  }
  const { event: eventName, ...params } = event
  window.gtag?.("event", eventName, params)
}
