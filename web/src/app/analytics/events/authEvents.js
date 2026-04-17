// app/analytics/events/authEvents.js
import { pushEvent } from "@/app/analytics/ga.js";

const isDev = window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1"

export const trackLogin = (userRole) => {
  const eventName = isDev
    ? "dev_login"
    : userRole === "ADMIN"
      ? "admin_login"
      : "user_login"

  pushEvent({ event: eventName })
}

export const trackLogout = (userRole) => {
  const eventName = isDev
    ? "dev_logout"
    : userRole === "ADMIN"
      ? "admin_logout"
      : "user_logout"

  pushEvent({ event: eventName })
}
