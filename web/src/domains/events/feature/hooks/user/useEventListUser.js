import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestGetExternalEventList } from "@/domains/events/store/index.js";
import { splitEventsByExpired } from "@/domains/events/utils/EventDateUtils.js";

export const useEventListUser = () => {
  const dispatch = useDispatch();
  const { events } = useSelector((state) => state.events);

  const { activeEvents, expireEvents } = splitEventsByExpired(events);

  useEffect(() => {
    dispatch(requestGetExternalEventList());
  }, [dispatch]);

  return {
    events,
    activeEvents,
    expireEvents,
  };

};
