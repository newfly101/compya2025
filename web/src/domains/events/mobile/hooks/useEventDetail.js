import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetEventDetail } from "@/domains/events/store/public/thunks.js";

export const useEventDetail = (id) => {
  const dispatch = useDispatch();
  const detail = useSelector(state => state.events.detail);
  const loading = useSelector(state => state.events.detailLoading);
  const error = useSelector(state => state.events.detailError);
  const notFound = useSelector(state => state.events.detailNotFound);

  useEffect(() => {
    dispatch(requestGetEventDetail(id));
  }, [dispatch, id]);

  const retry = useCallback(() => {
    dispatch(requestGetEventDetail(id));
  }, [dispatch, id]);

  // 이전에 본 다른 이벤트가 새 요청이 끝날 때까지 남아 있으므로 id 가 맞을 때만 쓴다.
  const event = detail && String(detail.id) === String(id) ? detail : null;

  return { event, loading, error, notFound: notFound && !event, retry };
};
