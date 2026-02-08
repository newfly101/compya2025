
// GA 활성 여부 판단
export const isGAEnabled = () => {
  const hostname = window.location.hostname;

  if (hostname === "localhost" || hostname === "127.0.0.1") return false;
  if (import.meta.env.MODE !== "production") return false;

  return true;
};

// DataLayout 진입점
export const pushDataLayer = (payload) => {
  if (!isGAEnabled()) return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(payload);
};

// 유저 진입점
export const setUserProperties = (properties) => {
  if (!isGAEnabled()) return;
  if (!window?.gtag) return;

  window.gtag("set", "user_properties", properties);
};
