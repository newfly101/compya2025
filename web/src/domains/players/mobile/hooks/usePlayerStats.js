// 리스트형(스탯 표) 전용. active 가 true 일 때만(카드형이면 호출 안 함) 구단 하나를 통째로 받는다.
// 팀을 바꾸면 teamCode 가 바뀌어 thunk 의 condition 이 자동으로 다시 받아오게 한다.
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetPlayerStats } from "@/domains/players/store/thunks.js";
import { CODE_BY_TEAM_NAME } from "@/domains/players/store/adapter.js";

export const usePlayerStats = (active, teamName) => {
  const dispatch = useDispatch();
  const teamCode = CODE_BY_TEAM_NAME[teamName] ?? null;
  const stats = useSelector((state) => state.players.stats);

  useEffect(() => {
    if (!active || !teamCode) return;
    dispatch(requestGetPlayerStats(teamCode));
  }, [dispatch, active, teamCode]);

  // 다른 팀 캐시가 남아 있는 동안엔 화면이 그 값을 잘못 보여주지 않도록 stale 로 취급한다.
  const stale = stats.teamCode !== teamCode;

  return {
    items: stale ? [] : stats.items,
    loading: stale || stats.loading,
    error: stale ? null : stats.error,
    loaded: !stale && stats.loaded,
    retry: () => teamCode && dispatch(requestGetPlayerStats(teamCode)),
  };
};
