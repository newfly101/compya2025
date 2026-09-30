// domains/admin/mobile/components/adminAnalyticsTab/periodMath.js
// 선택된 임의 기간(from~to, yyyy-MM-dd) 을 다루는 순수 날짜 계산. dateUtils.js 는 "오늘 기준"
// 상대 계산만 제공해 임의 날짜를 기준으로 하는 계산(직전 구간·날짜별 채우기)엔 맞지 않아 여기 둔다.
// 전부 달력 날짜 단위 가감이라 UTC 로 계산해도 시간대 영향이 없다.

const toUtc = (yyyyMmDd) => {
  const [y, m, d] = yyyyMmDd.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

export const addDays = (yyyyMmDd, days) => {
  const date = new Date(toUtc(yyyyMmDd));
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

export const daysBetween = (from, to) => Math.round((toUtc(to) - toUtc(from)) / 86400000);

/** 현재 구간과 같은 길이의 바로 직전 구간. 예: 09-24~09-30(7일) → 09-17~09-23. */
export const previousPeriodOf = ({ from, to }) => {
  const length = daysBetween(from, to) + 1;
  const prevTo = addDays(from, -1);
  const prevFrom = addDays(prevTo, -(length - 1));
  return { from: prevFrom, to: prevTo };
};

/** 카드 헤더 옆에 붙는 짧은 구간 표기. "2026-09-24" → "09-24", 범위면 "09-24 ~ 09-30". */
export const formatPeriodLabel = (from, to) => {
  if (!from || !to) return "";
  const short = (d) => d.slice(5);
  return from === to ? short(from) : `${short(from)} ~ ${short(to)}`;
};

/** from~to 사이 매일을 채운 배열 — API 는 활동이 있던 날만 반환해 빈 날이 생략된다. */
export const fillDayRange = (points, from, to) => {
  const byBucket = new Map(points.map((p) => [p.bucket, p]));
  const length = daysBetween(from, to) + 1;
  return Array.from({ length }, (_, i) => {
    const bucket = addDays(from, i);
    return byBucket.get(bucket) ?? { bucket, uniqueVisitors: 0, pageViews: 0 };
  });
};
