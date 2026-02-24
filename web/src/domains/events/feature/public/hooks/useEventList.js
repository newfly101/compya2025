import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { splitEventsByExpired } from "@/domains/events/feature/public/utils/EventDateUtils.js";
import { requestGetExternalEventList } from "@/domains/events/store/public/thunks.js";

export const useEventList = () => {
  const dispatch = useDispatch();
  const { events } = useSelector((state) => state.events);

  const { activeEvents, expireEvents } = splitEventsByExpired(events);

  useEffect(() => {
    dispatch(requestGetExternalEventList());
  }, [dispatch]);

  const shortEvents = (limit) => {
    return {activeEvents: limit ? activeEvents.slice(0, limit) : activeEvents};
  }

  return {
    events: events ?? [],
    activeEvents,
    expireEvents,
    shortEvents,
  };

};
