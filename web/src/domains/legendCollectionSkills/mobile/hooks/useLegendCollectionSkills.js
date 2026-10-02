import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLegendStats } from "@/domains/legendStats/mobile/hooks/useLegendStats.js";
import { usePlayerSkills } from "@/domains/playerSkills/mobile/hooks/usePlayerSkills.js";
import {
  requestGetSkillItems,
  requestPostSkillBatch,
  requestPostSkillEvent,
  requestPutSkillSlots,
} from "@/domains/legendCollectionSkills/store/public/thunks.js";

/**
 * 레전드 스킬 기록 — 레전드 목록(legendStats) · 스킬 마스터(playerSkills) · 내 기록을 한데 묶는다.
 * 서버 호출은 저장·강화 버튼에서만 일어나고, 실패하면 { message, conflict, unauthorized } 를 돌려준다 (성공 null).
 */
export const useLegendCollectionSkills = () => {
  const dispatch = useDispatch();
  const stats = useLegendStats();
  const hitters = usePlayerSkills("hitter");
  const pitchers = usePlayerSkills("pitcher");
  const me = useSelector((state) => state.legendCollectionSkills);

  useEffect(() => {
    if (!me.loaded && !me.loading && !me.error) dispatch(requestGetSkillItems());
  }, [dispatch, me.loaded, me.loading, me.error]);

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
    return me.items.map((item) => ({ item, legend: legendById.get(item.legendId) })).filter((r) => r.legend);
  }, [stats.legends, me.items]);

  const run = useCallback(
    async (thunkAction, rejected) => {
      const result = await dispatch(thunkAction);
      return rejected.match(result) ? (result.payload ?? { message: "저장하지 못했습니다." }) : null;
    },
    [dispatch],
  );

  const save = useCallback(
    (legendId, slots) => run(requestPutSkillSlots({ legendId, slots }), requestPutSkillSlots.rejected),
    [run],
  );
  const act = useCallback(
    (legendId, action, slot) => run(requestPostSkillEvent({ legendId, action, slot }), requestPostSkillEvent.rejected),
    [run],
  );

  const batch = useCallback(
    (legendId, actions) => run(requestPostSkillBatch({ legendId, actions }), requestPostSkillBatch.rejected),
    [run],
  );

  const retry = useCallback(() => {
    stats.retry();
    hitters.retry();
    pitchers.retry();
    dispatch(requestGetSkillItems());
  }, [dispatch, stats, hitters, pitchers]);

  return {
    rows,
    skillById,
    skillsOf,
    teamNameByCode: stats.teamNameByCode,
    loading: me.loading || (!stats.loaded && stats.loading) || !hitters.loaded || !pitchers.loaded,
    error: me.error || stats.error || hitters.error || pitchers.error,
    saving: me.mutateLoading,
    retry,
    save,
    act,
    batch,
  };
};
