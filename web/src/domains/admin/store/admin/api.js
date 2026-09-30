import { API } from "@/infra/http/client.js";
import { ADMIN_CACHE_SYNC, ADMIN_ANALYTICS } from "@/domains/admin/store/admin/endpoints.js";

// BE 는 모든 응답을 { success, code, data } 로 감싼다. 실제 payload 는 data.data.
export const fetchCacheSyncTargets = async () => {
  const { data } = await API.get(ADMIN_CACHE_SYNC.GET_TARGETS);
  return data.data;
};

export const fetchCacheSyncOne = async (id) => {
  const { data } = await API.post(ADMIN_CACHE_SYNC.SYNC_ONE(id));
  return data.data;
};

export const fetchCacheSyncAll = async () => {
  const { data } = await API.post(ADMIN_CACHE_SYNC.SYNC_ALL);
  return data.data;
};

export const fetchAdminAnalyticsSummary = async ({ range, from, to }) => {
  const { data } = await API.get(ADMIN_ANALYTICS.GET_SUMMARY(range, from, to));
  return data.data;
};

export const fetchAdminAnalyticsTrend = async ({ from, to, granularity }) => {
  const { data } = await API.get(ADMIN_ANALYTICS.GET_TREND(from, to, granularity));
  return data.data;
};

export const fetchAdminAnalyticsAggregate = async (date) => {
  const { data } = await API.post(ADMIN_ANALYTICS.AGGREGATE(date));
  return data.data;
};
