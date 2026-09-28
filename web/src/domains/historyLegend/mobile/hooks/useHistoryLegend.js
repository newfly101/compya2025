import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo } from "react";
import { requestGetHistoryRounds } from "@/domains/historyLegend/store/public/thunks.js";
import { useLegendStats } from "@/domains/legendStats/mobile/hooks/useLegendStats";
import { buildLegendRows, collectMaterials } from "@/domains/historyLegend/config/historyLegend.js";

/**
 * 라운드·로스터는 히스토리 API, 레전드 메타는 레전드 마스터에서 온다.
 * 마스터는 평점표가 이미 받아 둔 걸 그대로 쓴다 — 같은 store 라 요청이 중복되지 않는다.
 *
 * 메타가 늦어도 표는 뜬다. 메타가 실패하면 필터(구단·타입·포지션)를 쓸 수 없으므로
 * metaError 를 따로 내려 화면이 알리고 재시도하게 한다 — loaded 와 별개로 확인해야
 * 라운드가 먼저 성공한 뒤에도 실패가 가려지지 않는다.
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
    retry: retryMeta,
  } = useLegendStats();

  // 화면에 들어올 때마다 다시 받는다 — loaded 로 막으면 관리자가 캐시 동기화를 눌러도
  // 이미 열린 탭이 새로고침 전까지 옛 값을 보여준다. 동시 중복 요청은 thunk 의
  // condition(loading) 이 막고, 이미 받아 둔 값은 응답이 올 때까지 그대로 렌더된다.
  useEffect(() => {
    dispatch(requestGetHistoryRounds());
  }, [dispatch]);

  // 라운드(본 데이터)는 항상 다시 받고, 레전드 메타가 실패해 있었다면 같이 재시도한다
  const retry = useCallback(() => {
    dispatch(requestGetHistoryRounds());
    if (metaError) retryMeta();
  }, [dispatch, metaError, retryMeta]);

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
    // 라운드가 이미 성공해 loaded=true 여도 화면이 필터 실패를 알 수 있도록 따로 내려준다
    metaError,
    retry,
  };
};
