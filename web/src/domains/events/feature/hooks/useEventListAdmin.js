import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestGetExternalEventList, requestUpdateExternalEventVisible } from "@/domains/events/store";

export const useEventListAdmin = () => {
  const dispatch = useDispatch();
  const { events, loading, error } = useSelector((state) => state.events);
  const nowDate = new Date();

  useEffect(() => {
    dispatch(requestGetExternalEventList());
  }, [dispatch]);

  const handleVisibleChange = (id) => (nextVisible) => {
    dispatch(
      requestUpdateExternalEventVisible({
        id,
        visible: nextVisible,
      })
    );
  };

  return {
    events,
    nowDate,
    handleVisibleChange,
    loading,
    error,
  };
};
