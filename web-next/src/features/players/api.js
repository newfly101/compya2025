import { API_INTERNAL_URL } from "@/lib/env.js";
import { PLAYER_CARDS } from "@/features/players/store/endpoints.js";
import { toScreenPlayer } from "@/features/players/store/adapter.js";
import { getTeams, getYearsForTeam } from "@/features/players/config/playersLoader.js";

// 서버 컴포넌트용 — 카드 전량(11,668건, 약 760KB)을 받아 "기본 진입 화면" 몫만 잘라 돌려준다.
// 전량을 client 로 넘기면 HTML 이 ~1MB 늘어나서, 기본 로스터(구단 1 + 연도 1)만 SSR 하고
// 나머지는 client 가 TanStack Query 로 받는다. 실패는 throw(직전 ISR 캐시 유지, 최초면 app/error.jsx).
export const fetchPlayersInitial = async () => {
  const res = await fetch(`${API_INTERNAL_URL}${PLAYER_CARDS.GET_ALL}`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`GET /player-cards → HTTP ${res.status}`);
  const all = ((await res.json()).data ?? []).map(toScreenPlayer);
  const teams = getTeams(all);
  const team = teams[0] ?? "";
  const years = getYearsForTeam(all, team);
  const year = years[0] ?? "";
  return { teams, years, cards: all.filter((c) => c.tm === team && c.y === year) };
};
