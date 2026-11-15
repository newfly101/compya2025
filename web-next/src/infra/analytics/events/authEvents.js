// infra/analytics/events/authEvents.js
import { pushEvent } from "@/infra/analytics/ga.js";

const isDev = () =>
  typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const trackLogin = (userRole) => {
  const eventName = isDev()
    ? "dev_login"
    : userRole === "ADMIN"
      ? "admin_login"
      : "user_login"

  pushEvent({ event: eventName })
}

export const trackLogout = (userRole) => {
  const eventName = isDev()
    ? "dev_logout"
    : userRole === "ADMIN"
      ? "admin_logout"
      : "user_logout"

  pushEvent({ event: eventName })
}
