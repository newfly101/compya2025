import { useQuery } from "@tanstack/react-query";
import { fetchGetHitterSkills, fetchGetPitcherSkills } from "@/features/playerSkills/store/api.js";
import { toScreenSkill } from "@/features/playerSkills/store/adapter.js";

// 타자/투수 각 46개 전량 — 필터·정렬은 화면이 한다. 현재 보는 role 만 enabled 로 받는다.
const STATIC = { staleTime: 30 * 60 * 1000 };

export const usePlayerSkillsQuery = (role, enabled = true) =>
  useQuery({
    queryKey: ["playerSkills", role],
    queryFn: async () => ((await (role === "hitter" ? fetchGetHitterSkills() : fetchGetPitcherSkills())) ?? []).map(toScreenSkill),
    enabled,
    ...STATIC,
  });
