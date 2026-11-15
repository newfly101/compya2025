import { formatNow, getTodayKst } from "@/global/utils/dateUtils.js";

// 통계 탭 날짜 헬퍼 — 원본 web/src/global/utils/datetime/dateUtils.js 에서 필요한 것만 복사(KST 기준, 고정 오프셋이라 24시간 계산이 정확).
export { getTodayKst };

/** KST 기준 "어제" 날짜 (yyyy-MM-dd). */
export const getYesterdayKst = () => formatNow(new Date(Date.now() - 24 * 60 * 60 * 1000)).slice(0, 10);

/** KST 기준 오늘로부터 days 일 뒤(음수면 전) 날짜 (yyyy-MM-dd). */
export const getKstDateOffset = (days) => formatNow(new Date(Date.now() + days * 24 * 60 * 60 * 1000)).slice(0, 10);

/** KST 기준 오늘로부터 months 개월 전 날짜 (yyyy-MM-dd). 화면 클램프용 근사치 — 실제 검증은 서버가 한다. */
export const getKstMonthsAgo = (months) => {
  const d = new Date();
  d.setUTCMonth(d.getUTCMonth() - months);
  return formatNow(d).slice(0, 10);
};
