import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestGetExternalEventList, requestUpdateExternalEventVisible } from "@/domains/events/store/index.js";
import { VisibleToggleHandler } from "@/global/handler/VisibleToggleHandler.js";

export const useEventListAdmin = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(requestGetExternalEventList());
  }, [dispatch]);

  const changeVisible =
    VisibleToggleHandler(dispatch, requestUpdateExternalEventVisible);

  return {
    events,
    changeVisible,
    loading,
    error,
  };
};
