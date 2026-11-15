import { API } from "@/infra/http/client.js";
import { LEGEND_COLLECTIONS } from "@/domains/legendCollections/store/public/endpoints.js";
// BE 는 { success, code, data } 로 감싼다. 내용물(data.data)만 반환한다.

export const fetchGetMyCollection = async () => {
  const { data } = await API.get(LEGEND_COLLECTIONS.GET_ME);
  return data.data;
};

/** 편집 변경분 — { version, materials: [{ materialId, state }], legends: [{ legendId, status }], resetLegendIds } */
export const fetchPutChanges = async (body) => {
  const { data } = await API.put(LEGEND_COLLECTIONS.PUT_CHANGES, body);
  return data.data;
};

/** 선호 순위 + 액자 토글 — { version, preferences: [{ legendId, rank }], frames: [{ legendId, frame }] } */
export const fetchPutPreferences = async (body) => {
  const { data } = await API.put(LEGEND_COLLECTIONS.PUT_PREFERENCES, body);
  return data.data;
};

/** 획득일 — { frameAcquiredAt?, acquiredAt? } "yyyy-MM-dd" | null. 보낸 필드만 바뀐다 */
export const fetchPutAcquiredAt = async (legendId, body) => {
  const { data } = await API.put(LEGEND_COLLECTIONS.putAcquiredAt(legendId), body);
  return data.data;
};

export const fetchGetSchedule = async () => {
  const { data } = await API.get(LEGEND_COLLECTIONS.GET_SCHEDULE);
  return data.data;
};

export const fetchGetLegendMaterials = async (legendId) => {
  const { data } = await API.get(LEGEND_COLLECTIONS.getLegendDetail(legendId));
  return data.data;
};
