import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchAdminGetUserTitles,
  fetchAdminGrantTitle,
  fetchAdminRevokeTitle,
  fetchAdminGrantEarlyAdopters,
} from "@/domains/gamification/store/admin/api.js";
import { gamificationKeys } from "@/domains/gamification/store/public/queries.js";

export const adminGamificationKeys = { userTitles: (publicId) => ["admin", "gamification", "userTitles", publicId] };

// 응답 [{code,name,category,bonusPoint,owned,equipped,grantedAt}]
export const useAdminUserTitles = (publicId) =>
  useQuery({ queryKey: adminGamificationKeys.userTitles(publicId), queryFn: async () => (await fetchAdminGetUserTitles(publicId)) ?? [], staleTime: 0 });

// 지급/회수 뒤 그 유저의 칭호 목록을 다시 읽는다. 공개 쪽 칭호·내 정보 캐시도 함께 무효화 — 본인에게 지급한 경우 바로 반영.
const useTitleMutation = (mutationFn) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: (_d, { publicId }) => {
      qc.invalidateQueries({ queryKey: adminGamificationKeys.userTitles(publicId) });
      qc.invalidateQueries({ queryKey: gamificationKeys.titles });
      qc.invalidateQueries({ queryKey: gamificationKeys.me });
    },
  });
};

export const useAdminGrantTitle = () => useTitleMutation(fetchAdminGrantTitle);
export const useAdminRevokeTitle = () => useTitleMutation(fetchAdminRevokeTitle);

// 인자 { dryRun }. 응답 { dryRun, founderCount, samplePublicIds }
export const useAdminGrantEarlyAdopters = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fetchAdminGrantEarlyAdopters,
    onSuccess: (_d, { dryRun }) => {
      if (dryRun) return;
      qc.invalidateQueries({ queryKey: ["admin", "gamification"] });
      qc.invalidateQueries({ queryKey: gamificationKeys.titles });
      qc.invalidateQueries({ queryKey: gamificationKeys.me });
    },
  });
};
