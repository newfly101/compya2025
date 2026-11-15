import { useQuery } from "@tanstack/react-query";
import { fetchGetSniperTargets } from "@/domains/mileage/store/public/api.js";

// 마일리지 저격 재료 카드 — 응답 그대로. 레전드 평점표가 cardId 로 직접 대조해 쓴다.
// TODO(next-migration): 마일리지 화면 이전 시 이 파일을 확장한다 (지금은 평점표 배지용 조회만)
export const useSniperTargetsQuery = () =>
  useQuery({
    queryKey: ["mileage", "sniperTargets"],
    queryFn: async () => (await fetchGetSniperTargets()) ?? [],
    staleTime: 30 * 60 * 1000,
  });
