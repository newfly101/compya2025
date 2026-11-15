// 타자/투수 스킬을 읽고, 현재 보고 있는 role 만 불러온다. 이미 받은 role 은 캐시에서 쓴다.
import { useMemo } from "react";
import { usePlayerSkillsQuery } from "@/domains/playerSkills/store/queries.js";

const EMPTY = [];

export const usePlayerSkills = (type) => {
  const hitters = usePlayerSkillsQuery("hitter", type === "hitter");
  const pitchers = usePlayerSkillsQuery("pitcher", type === "pitcher");

  // 화면 필터(filterAndSortSkills)가 type 으로 다시 걸러내므로 두 role 을 합쳐 넘긴다.
  const all = useMemo(() => [...(hitters.data ?? EMPTY), ...(pitchers.data ?? EMPTY)], [hitters.data, pitchers.data]);
  const current = type === "hitter" ? hitters : pitchers;

  return {
    all,
    loading: current.isFetching,
    error: current.error?.message ?? null,
    loaded: current.isSuccess,
    retry: () => current.refetch(),
  };
};
