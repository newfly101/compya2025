import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { requestGetHistoryRounds } from "@/domains/historyLegend/store/public/thunks.js";
import { useLegendStats } from "@/domains/legendStats/mobile/hooks/useLegendStats";
import { buildLegendRows, collectMaterials } from "@/domains/historyLegend/config/historyLegend.js";

/**
 * 라운드·로스터는 히스토리 API, 레전드 메타는 레전드 마스터에서 온다.
 * 마스터는 평점표가 이미 받아 둔 걸 그대로 쓴다 — 같은 store 라 요청이 중복되지 않는다.
 *
 * 메타가 늦거나 실패해도 표는 뜬다 (구단·포지션 칸만 빈다).
 */
export const useHistoryLegend = () => {
  const dispatch = useDispatch();

  const { items: rounds, loaded, loading, error } = useSelector(
    (state) => state.historyLegend.rounds,
  );
  const {
    legends: masters,
    loading: metaLoading,
    error: metaError,
  } = useLegendStats();

  useEffect(() => {
    if (!loaded) dispatch(requestGetHistoryRounds());
  }, [dispatch, loaded]);

  const meta = useMemo(() => {
    const out = {};
    for (const m of masters) {
      out[m.name] = { type: m.type, grade: m.grade, team: m.team, pos: m.pos };
    }
    return out;
  }, [masters]);

  const materials = useMemo(() => collectMaterials(rounds), [rounds]);
  const legends = useMemo(() => buildLegendRows(materials, meta), [materials, meta]);

  return {
    rounds,
    legends,
    materials,
    meta,
    loading: loading || metaLoading,
    loaded,
    error: error ?? metaError,
  };
};
