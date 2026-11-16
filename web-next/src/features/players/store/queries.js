import { useQuery } from "@tanstack/react-query";
import { API } from "@/lib/http/client.js";
import { PLAYER_CARDS } from "@/features/players/store/endpoints.js";
import { toScreenPlayer } from "@/features/players/store/adapter.js";
import { toScreenStatRow } from "@/features/players/store/statsAdapter.js";

// 카드 전량 — 정적에 가까워 길게 캐시. 필터는 화면이 한다.
export const usePlayerCardsQuery = () =>
  useQuery({
    queryKey: ["players", "cards"],
    queryFn: async () => ((await API.get(PLAYER_CARDS.GET_ALL)).data.data ?? []).map(toScreenPlayer),
    staleTime: 30 * 60 * 1000,
  });

// 리스트형 표 — 구단 하나(teamCode)만. 키에 teamCode 가 들어가 구단을 바꾸면 자동 재조회.
export const usePlayerStatsQuery = (teamCode, enabled) =>
  useQuery({
    queryKey: ["players", "stats", teamCode],
    queryFn: async () =>
      ((await API.get(PLAYER_CARDS.getStats(teamCode))).data.data ?? []).map((row) => toScreenStatRow(row, teamCode)),
    enabled: enabled && !!teamCode,
    staleTime: 30 * 60 * 1000,
  });
