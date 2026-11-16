import { useQuery } from "@tanstack/react-query";
import { fetchGetSniperTargets } from "@/features/mileage/store/api.js";

// 마일리지 저격 재료 카드 — 응답 그대로. 레전드 평점표가 cardId 로 직접 대조해 쓰고, 저격 리스트 탭이 화면 모델로 바꾼다.
// initialData: 서버 컴포넌트가 이미 받은 값(선택).
export const useSniperTargetsQuery = (initialData) =>
  useQuery({
    queryKey: ["mileage", "sniperTargets"],
    queryFn: async () => (await fetchGetSniperTargets()) ?? [],
    initialData,
    staleTime: 30 * 60 * 1000,
  });
