import { API_INTERNAL_URL } from "@/config/env.js";
import { toScreenSkill } from "@/domains/playerSkills/store/adapter.js";

// 서버 컴포넌트용 fetch — 타자·투수 46개씩. 실패는 throw(직전 정상 ISR 캐시 유지, 최초면 app/error.jsx).
const load = async (role) => {
  const res = await fetch(`${API_INTERNAL_URL}/player-skills/${role}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`GET /player-skills/${role} → HTTP ${res.status}`);
  return ((await res.json()).data ?? []).map(toScreenSkill);
};

export const fetchPlayerSkills = async () => {
  const [hitters, pitchers] = await Promise.all([load("hitters"), load("pitchers")]);
  return [...hitters, ...pitchers];
};
