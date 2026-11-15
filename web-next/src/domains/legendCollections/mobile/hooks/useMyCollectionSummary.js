import { useMemo } from "react";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { useMyCollectionQuery, useScheduleQuery } from "@/domains/legendCollections/store/public/queries.js";
import { LEGEND } from "@/domains/legendCollections/config/legendCollections.js";

/**
 * 홈 카드용 요약 — 내 기록(보유·액자 수, 선호)과 오늘 안내 일정. 로그인했을 때만 요청한다.
 * 같은 쿼리 키라 여러 곳에서 불러도 요청은 한 번만 나간다.
 */
export const useMyCollectionSummary = () => {
  const { isAuthenticated } = useAuthentication();
  const meQuery = useMyCollectionQuery(isAuthenticated);
  const scheduleQuery = useScheduleQuery(isAuthenticated);
  const me = meQuery.data;
  const scheduleData = scheduleQuery.data;
  const schedule = useMemo(
    () => ({ todayDayNo: null, items: [], ...scheduleData, loaded: scheduleQuery.isSuccess, error: scheduleQuery.error ?? null }),
    [scheduleData, scheduleQuery.isSuccess, scheduleQuery.error],
  );

  return useMemo(() => {
    const statuses = Object.values(me?.legends ?? {});
    return {
      meLoaded: isAuthenticated && meQuery.isSuccess,
      meError: !meQuery.isSuccess && !!meQuery.error,
      owned: statuses.filter((s) => s === LEGEND.OWNED).length,
      frame: statuses.filter((s) => s === LEGEND.FRAME).length,
      preferences: me?.preferences ?? [],
      schedule,
    };
  }, [isAuthenticated, meQuery.isSuccess, meQuery.error, me, schedule]);
};
