import { formatNow } from "@/global/utils/datetime/dateUtils";

// 남은 날 — 날짜(KST) 단위 차이. 마감일 당일은 D-DAY.
export const remainLabel = (expireAt) => {
  if (!expireAt) return null;
  const toDay = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  const diff = Math.round((toDay(expireAt) - toDay(formatNow())) / 86400000);
  if (diff < 0) return "종료";
  return diff === 0 ? "D-DAY" : `${diff}일 남음`;
};
