import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestGetExternalEventList, requestUpdateExternalEventVisible } from "@/domains/events/store/index.js";
import { dateUtils } from "@/global/utils/datetime/dateUtils.js";
import { VisibleToggleHandler } from "@/global/handler/VisibleToggleHandler.js";

export const useEventListAdmin = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);
  const isExpired = dateUtils.expired(events.expireAt);

  useEffect(() => {
    dispatch(requestGetExternalEventList());
  }, [dispatch]);

  const changeVisible =
    VisibleToggleHandler(dispatch, requestUpdateExternalEventVisible);

  return {
    events,
    isExpired,
    changeVisible,
    loading,
    error,
  };
};
