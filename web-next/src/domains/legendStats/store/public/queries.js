import { useQueries, useQuery } from "@tanstack/react-query";
import {
  fetchGetLegendMaterials,
  fetchGetLegendStats,
  fetchGetPitchTypes,
  fetchGetTeams,
} from "@/domains/legendStats/store/public/api.js";
import { buildPitchNameByCode, buildTeamNameByCode } from "@/domains/legendStats/config/legendStats.js";

// 요청 세 개는 서로 독립이다 — 스탯 본체 / 구단 한글명 / 구종 표시명. lookup 이 실패해도 표는 코드값으로 산다.
// 마스터 데이터라 staleTime 을 길게 둔다(기본 1분 → 30분).
const STATIC = { staleTime: 30 * 60 * 1000 };

export const legendStatKeys = {
  stats: ["legendStats", "stats"],
  pitchTypes: ["legendStats", "pitchTypes"],
  teams: ["legendStats", "teams"],
  materials: (legendId) => ["legendStats", "materials", legendId],
};

/** 스탯은 응답 그대로 — 표시용 조립은 훅이 한다 */
// initialData: 서버 컴포넌트가 이미 받은 값 — 주면 첫 렌더가 그 값으로 그려지고(SSR HTML 에 표 포함) staleTime 안에는 재요청하지 않는다.
export const useLegendStatsQuery = (initialData) =>
  useQuery({ queryKey: legendStatKeys.stats, queryFn: async () => (await fetchGetLegendStats()) ?? [], initialData, ...STATIC });

export const usePitchTypesQuery = (initialData) =>
  useQuery({ queryKey: legendStatKeys.pitchTypes, queryFn: async () => buildPitchNameByCode((await fetchGetPitchTypes()) ?? []), initialData, ...STATIC });

export const useTeamsQuery = (initialData) =>
  useQuery({ queryKey: legendStatKeys.teams, queryFn: async () => buildTeamNameByCode((await fetchGetTeams()) ?? []), initialData, ...STATIC });

// 재료 — 요청한 레전드(ids)만, 한 번 받은 레전드는 캐시에서 쓴다. byId: { [legendId]: 응답 }
const combineMaterials = (results) => ({
  byId: Object.fromEntries(results.filter((r) => r.data).map((r) => [r.data.legendId, r.data.detail])),
  loading: results.some((r) => r.isFetching),
});
export const useLegendMaterialsMap = (ids) =>
  useQueries({
    queries: ids.map((id) => ({
      queryKey: legendStatKeys.materials(id),
      queryFn: async () => ({ legendId: id, detail: await fetchGetLegendMaterials(id) }),
      ...STATIC,
    })),
    combine: combineMaterials,
  });
