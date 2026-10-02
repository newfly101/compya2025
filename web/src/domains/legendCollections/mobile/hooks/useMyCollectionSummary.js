import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { requestGetMyCollection, requestGetSchedule } from "@/domains/legendCollections/store/public/thunks.js";
import { LEGEND } from "@/domains/legendCollections/config/legendCollections.js";

/**
 * 홈 카드용 요약 — 내 기록(보유·액자 수, 선호)과 오늘 안내 일정. 로그인했을 때만 요청한다.
 * 홈에서 한 곳(HomeScreen)이 한 번만 호출해 두 카드에 나눠 준다 (같은 요청 중복 방지).
 */
export const useMyCollectionSummary = () => {
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuthentication();
  const me = useSelector((state) => state.legendCollections.me);
  const schedule = useSelector((state) => state.legendCollections.schedule);

  useEffect(() => {
    if (isAuthenticated && !me.loaded && !me.loading && !me.error) dispatch(requestGetMyCollection());
  }, [dispatch, isAuthenticated, me.loaded, me.loading, me.error]);

  useEffect(() => {
    if (isAuthenticated && !schedule.loaded && !schedule.loading && !schedule.error) dispatch(requestGetSchedule());
  }, [dispatch, isAuthenticated, schedule.loaded, schedule.loading, schedule.error]);

  const statuses = Object.values(me.legends);
  return useMemo(
    () => ({
      meLoaded: isAuthenticated && me.loaded,
      meError: !me.loaded && !!me.error,
      owned: statuses.filter((s) => s === LEGEND.OWNED).length,
      frame: statuses.filter((s) => s === LEGEND.FRAME).length,
      preferences: me.preferences,
      schedule,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAuthenticated, me.loaded, me.error, me.legends, me.preferences, schedule],
  );
};
