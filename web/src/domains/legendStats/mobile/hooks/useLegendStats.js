import { useDispatch, useSelector } from "react-redux";
import { useCallback, useEffect, useMemo } from "react";
import {
  requestGetLegendMaterials,
  requestGetLegendStats,
  requestGetPitchTypes,
  requestGetTeams,
} from "@/domains/legendStats/store/public/thunks.js";
import { toLegendStatModel, toMaterialModel } from "@/domains/legendStats/config/legendStats.js";

const EMPTY_MATERIALS = { mats: [], coaches: [] };

/**
 * 요청 세 개는 서로 독립이다 — 스탯 본체 / 구단 한글명 / 구종 표시명.
 * lookup 이 늦거나 실패해도 표는 코드값으로 살아 있다.
 * 재료는 목록에 없고 행을 펼친 레전드만 따로 받는다.
 */
export const useLegendStats = () => {
  const dispatch = useDispatch();

  const { items, loaded, loading, error } = useSelector((state) => state.legendStat.stats);
  const { teamNameByCode, loaded: teamsLoaded } = useSelector((state) => state.legendStat.teams);
  const { pitchNameByCode, loaded: pitchesLoaded } = useSelector(
    (state) => state.legendStat.pitchTypes,
  );
  const { byId, loading: materialsLoading } = useSelector((state) => state.legendStat.materials);

  useEffect(() => {
    if (!loaded) dispatch(requestGetLegendStats());
  }, [dispatch, loaded]);

  useEffect(() => {
    if (!teamsLoaded) dispatch(requestGetTeams());
  }, [dispatch, teamsLoaded]);

  useEffect(() => {
    if (!pitchesLoaded) dispatch(requestGetPitchTypes());
  }, [dispatch, pitchesLoaded]);

  const legends = useMemo(
    () => items.map((item) => toLegendStatModel(item, { teamNameByCode, pitchNameByCode })),
    [items, teamNameByCode, pitchNameByCode],
  );

  const loadMaterials = useCallback(
    (legendId) => {
      if (legendId) dispatch(requestGetLegendMaterials(legendId));
    },
    [dispatch],
  );

  const materialsOf = useCallback(
    (legendId) => {
      const detail = byId[legendId];
      return detail ? toMaterialModel(detail, teamNameByCode) : EMPTY_MATERIALS;
    },
    [byId, teamNameByCode],
  );

  return { legends, loading, loaded, error, loadMaterials, materialsOf, materialsLoading };
};
