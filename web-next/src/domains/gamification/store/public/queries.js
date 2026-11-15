import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCheckIn,
  fetchEquipTitle,
  fetchGetHistory,
  fetchGetLevels,
  fetchGetMyGamification,
  fetchGetTitles,
} from "@/domains/gamification/store/public/api.js";
import { useGamificationStore } from "@/domains/gamification/store/store.js";

export const gamificationKeys = {
  me: ["gamification", "me"],
  levels: ["gamification", "levels"],
  titles: ["gamification", "titles"],
  history: (type) => ["gamification", "history", type],
};

// 내 등급·포인트·칭호 — 마운트할 때마다 새로 읽고(staleTime 0), 응답 전엔 이전 값을 보여준다.
export const useMyGamificationQuery = (enabled = true) =>
  useQuery({ queryKey: gamificationKeys.me, queryFn: fetchGetMyGamification, enabled, staleTime: 0 });

export const useLevelsQuery = () => useQuery({ queryKey: gamificationKeys.levels, queryFn: async () => (await fetchGetLevels()) ?? [] });

export const useTitlesQuery = () => useQuery({ queryKey: gamificationKeys.titles, queryFn: async () => (await fetchGetTitles()) ?? [] });

// 서버가 갱신된 내 정보(me 전체)를 돌려준다 — 그대로 me 캐시로 교체한다. code=null 이면 대표 칭호 해제.
export const useEquipTitleMutation = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fetchEquipTitle,
    onSuccess: (me) => {
      qc.setQueryData(gamificationKeys.me, me);
      qc.invalidateQueries({ queryKey: gamificationKeys.titles });
    },
  });
};

// type: "XP" | "POINT" — 탭별로 따로, 0 페이지부터 [더 보기] 로 이어 읽는다
export const useHistoryInfiniteQuery = (type) =>
  useInfiniteQuery({
    queryKey: gamificationKeys.history(type),
    queryFn: ({ pageParam }) => fetchGetHistory({ type, page: pageParam }),
    initialPageParam: 0,
    getNextPageParam: (last) => (last.hasNext ? last.page + 1 : undefined),
  });

// 로그인 직후 1회 — 서버가 하루 1회 멱등 처리. 실패해도 로그인 흐름에 영향 없음.
export const useCheckIn = () => {
  const qc = useQueryClient();
  const show = useGamificationStore((s) => s.showCheckIn);
  return async () => {
    try {
      const result = await fetchCheckIn();
      if (result?.xp > 0) {
        show(result);
        qc.removeQueries({ queryKey: ["gamification", "history"] });
        qc.invalidateQueries({ queryKey: gamificationKeys.me });
      }
    } catch {
      /* 무시 */
    }
  };
};
