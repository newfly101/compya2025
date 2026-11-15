import { usePlayerCardsQuery } from "@/domains/players/store/queries.js";

const EMPTY = [];

// 마운트 즉시 전량 요청. 도착 전엔 loaded=false — 화면이 SSR 로 받은 기본 로스터를 대신 보여준다.
export const usePlayerCards = () => {
  const q = usePlayerCardsQuery();
  return { items: q.data ?? EMPTY, error: q.error?.message ?? null, loaded: q.isSuccess, retry: () => q.refetch() };
};
