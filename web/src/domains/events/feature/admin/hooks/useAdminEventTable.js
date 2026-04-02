import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { VisibleToggleHandler } from "@/global/handler/VisibleToggleHandler.js";
import { requestAdminGetExEventList, requestAdminUpdateExEventVisible } from "@/domains/events/store/admin/thunks.js";

export const useAdminEventTable = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);

  useEffect(() => {
    dispatch(requestAdminGetExEventList());
  }, [dispatch]);

  const changeVisible =
    VisibleToggleHandler(dispatch, requestAdminUpdateExEventVisible);

  return {
    events,
    changeVisible,
    loading,
    error,
  };
};
