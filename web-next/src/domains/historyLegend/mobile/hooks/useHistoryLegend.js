import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useHistoryRoundsQuery } from "@/domains/historyLegend/store/public/queries.js";
import { useLegendStats } from "@/domains/legendStats/mobile/hooks/useLegendStats.js";
import { buildLegendRows, collectMaterials } from "@/domains/historyLegend/config/historyLegend.js";

const EMPTY = [];

/**
 * 라운드·로스터는 히스토리 API, 레전드 메타는 레전드 마스터에서 온다.
 * initial: { rounds, legend } — 서버가 받아 둔 값. 둘 다 주면 첫 HTML 에 표가 들어간다.
 *
 * 메타가 실패하면 필터(구단·타입·포지션)를 쓸 수 없으므로 metaError 를 따로 내려
 * 화면이 알리고 재시도하게 한다.
 */
export const useHistoryLegend = (initial) => {
  const qc = useQueryClient();
  const roundsQuery = useHistoryRoundsQuery(initial?.rounds);
  const rounds = roundsQuery.data ?? EMPTY;
  const {
    legends: masters,
    loading: metaLoading,
    error: metaError,
    retry: retryMeta,
  } = useLegendStats(initial?.legend);

  // 라운드(본 데이터)는 항상 다시 받고, 레전드 메타가 실패해 있었다면 같이 재시도한다
  const retry = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["historyLegend", "rounds"] });
    if (metaError) retryMeta();
  }, [qc, metaError, retryMeta]);

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
    loading: roundsQuery.isFetching || metaLoading,
    loaded: roundsQuery.isSuccess,
    error: roundsQuery.error?.message ?? metaError,
    metaError,
    retry,
  };
};
