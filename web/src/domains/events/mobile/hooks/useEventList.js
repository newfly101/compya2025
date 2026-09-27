// domains/events/feature/public/hooks/useEventList.js
import { useCallback, useEffect } from "react";
import { formatNow } from "@/global/utils/datetime/dateUtils";
import { useDispatch, useSelector } from "react-redux";
import { requestGetExternalEventList } from "@/domains/events/store/public/thunks.js";
import { useKstDayTick } from "@/global/hooks/useKstDayTick.js";

export const useEventList = () => {
  const dispatch = useDispatch();
  const eventList = useSelector(state => state.events.events);
  const loading = useSelector(state => state.events.loading);
  const error = useSelector(state => state.events.error);

  useEffect(() => {
    dispatch(requestGetExternalEventList());
  }, [dispatch]);

  const retry = useCallback(() => {
    dispatch(requestGetExternalEventList());
  }, [dispatch]);

  useKstDayTick(); // 자정을 넘기면 만료 분류를 다시 계산한다 (홈 훅과 공유)

  const now = formatNow(new Date());

  return {
    activeEvents: eventList.filter(e => e.visible && e.expireAt >= now),
    expiredEvents: eventList.filter(e => e.visible && e.expireAt < now),
    loading,
    error,
    retry,
  };
};
