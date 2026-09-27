// domains/events/feature/public/hooks/useEventList.js
import { useCallback, useEffect } from "react";
import { formatNow } from "@/global/utils/datetime/dateUtils";
import { useDispatch, useSelector } from "react-redux";
import { requestGetExternalEventList } from "@/domains/events/store/public/thunks.js";
import { useKstDayTick } from "@/global/hooks/useKstDayTick.js";

export const useEventList = () => {
  const dispatch = useDispatch();
  // 공개 전용 칸 — state.events.events 는 관리자 목록(숨김 포함)이고
  // loading/error 는 관리자 조회 칸이다. 공유하면 관리자 쪽 오류가 공개 화면에 새어 나온다.
  const eventList = useSelector(state => state.events.publicEvents);
  const loading = useSelector(state => state.events.publicLoading);
  const error = useSelector(state => state.events.publicError);

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
