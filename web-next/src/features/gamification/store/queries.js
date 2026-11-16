import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCheckIn,
  fetchEquipTitle,
  fetchGetHistory,
  fetchGetLevels,
  fetchGetMyGamification,
  fetchGetTitles,
} from "@/features/gamification/store/api.js";
import { useGamificationStore } from "@/features/gamification/store/store.js";

const ME_STALE_MS = 30 * 1000;

export const gamificationKeys = {
  me: ["gamification", "me"],
  levels: ["gamification", "levels"],
  titles: ["gamification", "titles"],
  history: (type) => ["gamification", "history", type],
};

// 내 등급·포인트·칭호 — 30초 안엔 캐시를 그대로 쓰고(마운트마다 재요청 방지), 갱신은 체크인·장착 뒤 setQueryData 로 한다.
export const useMyGamificationQuery = (enabled = true) =>
  useQuery({ queryKey: gamificationKeys.me, queryFn: fetchGetMyGamification, enabled, staleTime: ME_STALE_MS });

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
        // 체크인 응답은 증가분 — 캐시에 합산하면 진행 중인 me 요청 결과와 이중 합산된다. 진행 중 요청을 취소하고 다시 읽는다.
        await qc.cancelQueries({ queryKey: gamificationKeys.me });
        qc.invalidateQueries({ queryKey: gamificationKeys.me });
      }
    } catch {
      /* 무시 */
    }
  };
};
