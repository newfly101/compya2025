import { API } from "@/infra/http/client.js";
import { ADMIN_CACHE_SYNC } from "@/domains/admin/store/admin/endpoints.js";

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
