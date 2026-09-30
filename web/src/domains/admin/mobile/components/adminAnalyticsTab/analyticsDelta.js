// domains/admin/mobile/components/adminAnalyticsTab/analyticsDelta.js
// 개요 카드 증감률 배지(▲/▼/-) 계산. 직전 값이 없거나 0이면 "-"(비교 불가) — 분모가 0이면
// 퍼센트가 무한대라 표시할 수 없다.
export const deltaOf = (current, previous) => {
  if (!previous) return null;
  const pct = Math.round(((current - previous) / previous) * 100);
  if (pct === 0) return null;
  return { sign: pct > 0 ? "up" : "down", pct: Math.abs(pct) };
};
