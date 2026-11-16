import { useCallback, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  legendStatKeys,
  useLegendMaterialsMap,
  useLegendStatsQuery,
  usePitchTypesQuery,
  useTeamsQuery,
} from "@/features/legendStats/store/queries.js";
import { toLegendStatModel, toMaterialModel } from "@/features/legendStats/legendStats.js";

const EMPTY_MATERIALS = { mats: [], coaches: [] };
const EMPTY_LIST = [];
const EMPTY_MAP = {};

/**
 * 요청 세 개는 서로 독립이다 — 스탯 본체 / 구단 한글명 / 구종 표시명.
 * lookup 이 늦거나 실패해도 표는 코드값으로 살아 있다.
 * 재료는 목록에 없고 행을 펼친 레전드만 따로 받는다(loadMaterials).
 */
// initial: { stats, teamNameByCode, pitchNameByCode } — 서버가 받아 둔 값(선택). 없으면 브라우저에서 받는다.
export const useLegendStats = (initial) => {
  const qc = useQueryClient();
  const stats = useLegendStatsQuery(initial?.stats);
  const teams = useTeamsQuery(initial?.teamNameByCode);
  const pitches = usePitchTypesQuery(initial?.pitchNameByCode);
  const items = stats.data ?? EMPTY_LIST;
  const teamNameByCode = teams.data ?? EMPTY_MAP;
  const pitchNameByCode = pitches.data ?? EMPTY_MAP;

  const legends = useMemo(
    () => items.map((item) => toLegendStatModel(item, { teamNameByCode, pitchNameByCode })),
    [items, teamNameByCode, pitchNameByCode],
  );

  // 펼친 레전드 id 만 기억한다 — 재료 응답은 쿼리 캐시가 들고 있다.
  const [opened, setOpened] = useState(EMPTY_LIST);
  const { byId, loading: materialsLoading } = useLegendMaterialsMap(opened);

  const loadMaterials = useCallback(
    (legendId) => {
      if (legendId) setOpened((prev) => (prev.includes(legendId) ? prev : [...prev, legendId]));
    },
    [setOpened],
  );

  const materialsOf = useCallback(
    (legendId) => {
      const detail = byId[legendId];
      return detail ? toMaterialModel(detail, teamNameByCode) : EMPTY_MATERIALS;
    },
    [byId, teamNameByCode],
  );

  // 정상 응답(재료 0건)과 요청 실패를 구분하기 위한 존재 여부 체크
  const hasMaterialsResponse = useCallback((legendId) => legendId in byId, [byId]);

  // 목록 조회 재시도 — 표를 채우는 본 데이터만 다시 받는다
  const retry = useCallback(() => {
    qc.invalidateQueries({ queryKey: legendStatKeys.stats });
  }, [qc]);

  return {
    legends,
    loading: stats.isFetching,
    loaded: stats.isSuccess,
    error: stats.error?.message ?? null,
    loadMaterials,
    materialsOf,
    hasMaterialsResponse,
    materialsLoading,
    retry,
    teamNameByCode,
  };
};
