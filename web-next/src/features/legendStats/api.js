import { API_INTERNAL_URL } from "@/lib/env.js";
import { buildPitchNameByCode, buildTeamNameByCode } from "@/features/legendStats/legendStats.js";

// 서버 컴포넌트용 fetch — 평점표·히스토리 재료 화면이 첫 HTML 에 표를 넣을 때 쓴다.
// BE 응답은 { success, code, data }. 실패는 throw → 직전 정상 캐시 유지, 최초면 app/error.jsx (coupons 와 같은 방식).
// 브라우저용 store/public/api.js(axios) 와 같은 엔드포인트를 쓴다.
const get = async (path) => {
  const res = await fetch(`${API_INTERNAL_URL}${path}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`GET ${path} → HTTP ${res.status}`);
  return (await res.json()).data ?? [];
};

/** useLegendStats(initial) 에 그대로 넘기는 모양 — 클라이언트 queries.js 가 캐시에 넣는 값과 같다. */
export const fetchLegendStatsInitial = async () => {
  const [stats, pitchTypes, teams] = await Promise.all([get("/legend-stats"), get("/legend-stats/pitch-types"), get("/teams")]);
  return { stats, pitchNameByCode: buildPitchNameByCode(pitchTypes), teamNameByCode: buildTeamNameByCode(teams) };
};
