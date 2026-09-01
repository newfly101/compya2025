import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { requestGetLegendList, requestGetTeams } from "@/domains/legendMaterials/store/public/thunks.js";
import { buildTeams, withTeamNames } from "@/domains/legendMaterials/config/legendMaterials.js";

/**
 * 레전드 + 재료를 한 번 받아 두고 화면이 그대로 쓴다.
 * 74명 × 8행이라 한 번 받으면 이후 구단·레전드 전환은 서버 호출이 없다.
 *
 * 구단 한글명(teams)은 독립된 요청이다 — 실패해도 legends 는 그대로 렌더되고,
 * withTeamNames 가 teamCode 를 그대로(대문자) 표시하며 화면을 유지한다.
 */
export const useLegendMaterials = () => {
  const dispatch = useDispatch();
  const { legends: rawLegends, loaded, loading, error } = useSelector((state) => state.legendMaterial.legends);
  const { teamNameByCode, loaded: teamsLoaded } = useSelector((state) => state.legendMaterial.teams);

  useEffect(() => {
    if (loaded) return;
    dispatch(requestGetLegendList());
  }, [dispatch, loaded]);

  useEffect(() => {
    if (teamsLoaded) return;
    dispatch(requestGetTeams());
  }, [dispatch, teamsLoaded]);

  const legends = useMemo(
    () => rawLegends.map((l) => withTeamNames(l, teamNameByCode)),
    [rawLegends, teamNameByCode]
  );

  const teams = useMemo(() => buildTeams(legends), [legends]);

  return { legends, teams, loading, loaded, error };
};
