// 리스트형(스탯 표) 전용. active 일 때만 구단 하나를 통째로 받는다.
import { usePlayerStatsQuery } from "@/domains/players/store/queries.js";
import { CODE_BY_TEAM_NAME } from "@/domains/players/store/adapter.js";

const EMPTY = [];

export const usePlayerStats = (active, teamName) => {
  const q = usePlayerStatsQuery(CODE_BY_TEAM_NAME[teamName] ?? null, active);
  return { items: q.data ?? EMPTY, error: q.error?.message ?? null, loaded: q.isSuccess, retry: () => q.refetch() };
};
