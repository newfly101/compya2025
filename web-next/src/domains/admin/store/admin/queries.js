import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchCacheSyncTargets,
  fetchCacheSyncOne,
  fetchCacheSyncAll,
  fetchAdminAnalyticsSummary,
  fetchAdminAnalyticsTrend,
  fetchAdminAnalyticsAggregate,
} from "@/domains/admin/store/admin/api.js";

export const adminKeys = {
  syncTargets: ["admin", "cacheSync", "targets"],
  summary: (args) => ["admin", "analytics", "summary", args],
  trend: (args) => ["admin", "analytics", "trend", args],
};

// 동기화 대상 목록은 서버가 내려주는 대로 쓴다(FE 하드코딩 금지). 셸 탭 배지와 같은 키라 요청은 1번.
export const useCacheSyncTargets = () => useQuery({ queryKey: adminKeys.syncTargets, queryFn: fetchCacheSyncTargets, staleTime: 0 });

// 성공한 결과의 syncedAt 을 목록 행의 lastSyncedAt 에 반영한다
const patchSynced = (qc, results) =>
  qc.setQueryData(adminKeys.syncTargets, (targets) =>
    targets?.map((t) => {
      const r = results.find((x) => x.id === t.id && x.success);
      return r ? { ...t, lastSyncedAt: r.syncedAt } : t;
    }),
  );

export const useCacheSyncOne = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fetchCacheSyncOne, onSuccess: (result) => patchSynced(qc, [result]) });
};

// 응답은 대상별 성공/실패가 섞인 배열
export const useCacheSyncAll = () => {
  const qc = useQueryClient();
  return useMutation({ mutationFn: fetchCacheSyncAll, onSuccess: (results) => patchSynced(qc, results) });
};

// 통계 — 매 요청이 새 조회(캐시 재사용 안 함). args: { range, from, to } / { from, to, granularity }
export const useAdminAnalyticsSummary = (args, enabled = true) =>
  useQuery({ queryKey: adminKeys.summary(args), queryFn: () => fetchAdminAnalyticsSummary(args), enabled, staleTime: 0, gcTime: 0 });

export const useAdminAnalyticsTrend = (args, enabled = true) =>
  useQuery({ queryKey: adminKeys.trend(args), queryFn: () => fetchAdminAnalyticsTrend(args), enabled, staleTime: 0, gcTime: 0 });

// 수동 재집계 — date(yyyy-MM-dd) 하루치를 다시 계산. 성공 알림은 전역 모달, 현재 기간 재조회는 화면이 한다.
export const useAdminAnalyticsAggregate = (date) =>
  useMutation({ mutationFn: fetchAdminAnalyticsAggregate, meta: { notify: { success: `${date} 재집계했습니다.` } } });
