import { useCallback, useMemo } from "react";
import { useLegendStats } from "@/domains/legendStats/mobile/hooks/useLegendStats.js";
import { usePlayerSkills } from "@/domains/playerSkills/mobile/hooks/usePlayerSkills.js";
import {
  usePostSkillBatchMutation,
  usePostSkillEventMutation,
  usePutSkillSlotsMutation,
  useSkillItemsQuery,
} from "@/domains/legendCollectionSkills/store/public/queries.js";

const EMPTY_ITEMS = [];

/**
 * 레전드 스킬 기록 — 레전드 목록(legendStats) · 스킬 마스터(playerSkills) · 내 기록을 한데 묶는다.
 * 서버 호출은 저장·강화 버튼에서만 일어나고, 실패하면 { message, conflict, unauthorized } 를 돌려준다 (성공 null).
 */
export const useLegendCollectionSkills = () => {
  const stats = useLegendStats();
  const hitters = usePlayerSkills("hitter");
  const pitchers = usePlayerSkills("pitcher");
  const itemsQuery = useSkillItemsQuery();
  const putSlots = usePutSkillSlotsMutation();
  const postEvent = usePostSkillEventMutation();
  const postBatch = usePostSkillBatchMutation();
  const items = itemsQuery.data ?? EMPTY_ITEMS;

  const skillById = useMemo(
    () => new Map(hitters.all.map((s) => [s.serverId, s])),
    [hitters.all],
  );
  const skillsOf = useCallback(
    (type) => hitters.all.filter((s) => s.type === (type === "투수" ? "pitcher" : "hitter")),
    [hitters.all],
  );

  const rows = useMemo(() => {
    const legendById = new Map(stats.legends.map((l) => [l.id, l]));
    return items.map((item) => ({ item, legend: legendById.get(item.legendId) })).filter((r) => r.legend);
  }, [stats.legends, items]);

  // 성공 null, 실패하면 { message, conflict, unauthorized } (Error)
  const run = async (mutation, arg) => {
    try {
      await mutation.mutateAsync(arg);
      return null;
    } catch (e) {
      return e ?? { message: "저장하지 못했습니다." };
    }
  };

  const save = (legendId, slots) => run(putSlots, { legendId, slots });
  const act = (legendId, action, slot) => run(postEvent, { legendId, action, slot });
  const batch = (legendId, actions) => run(postBatch, { legendId, actions });

  const retry = useCallback(() => {
    stats.retry();
    hitters.retry();
    pitchers.retry();
    itemsQuery.refetch();
  }, [stats, hitters, pitchers, itemsQuery]);

  return {
    rows,
    skillById,
    skillsOf,
    teamNameByCode: stats.teamNameByCode,
    loading: itemsQuery.isFetching || (!stats.loaded && stats.loading) || !hitters.loaded || !pitchers.loaded,
    error: itemsQuery.error?.message || stats.error || hitters.error || pitchers.error,
    saving: putSlots.isPending || postEvent.isPending || postBatch.isPending,
    retry,
    save,
    act,
    batch,
  };
};
