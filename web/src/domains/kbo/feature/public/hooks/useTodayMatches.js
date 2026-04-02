import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { requestGetTodayMatches } from "@/domains/kbo/store/public/thunks.js";
import { TODAY_MATCH_GRID } from "@/domains/kbo/config/kboMatch.config.js";

export const useTodayMatches = () => {
  const dispatch = useDispatch();
  const todayMatches = useSelector((state) => state.kbo.todayMatches) ?? [];
  const loading     = useSelector((state) => state.kbo.loading);
  const error       = useSelector((state) => state.kbo.error);

  useEffect(() => {
    dispatch(requestGetTodayMatches());
  }, [dispatch]);

  const visibleMatches = todayMatches.slice(0, TODAY_MATCH_GRID.maxVisible);
  const hasMore        = todayMatches.length > TODAY_MATCH_GRID.maxVisible;

  return {
    todayMatches,
    visibleMatches,
    hasMore,
    loading,
    error,
  };
};
