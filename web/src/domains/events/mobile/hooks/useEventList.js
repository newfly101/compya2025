// domains/events/feature/public/hooks/useEventList.js
import { useEffect } from "react";
import { formatNow } from "@/global/utils/datetime/dateUtils";
import { useDispatch, useSelector } from "react-redux";
import { requestGetExternalEventList } from "@/domains/events/store/public/thunks.js";

export const useEventList = () => {
  const dispatch = useDispatch();
  const eventList = useSelector(state => state.events.events);

  useEffect(() => {
    dispatch(requestGetExternalEventList());
  }, [dispatch]);

  const now = formatNow(new Date());

  return {
    activeEvents: eventList.filter(e => e.visible && e.expireAt >= now),
    expiredEvents: eventList.filter(e => e.visible && e.expireAt < now),
  };
};
