import { API } from "@/infra/http/client.js";
import { SIMULATORS } from "@/domains/simulators/store/public/endpoints.js";
// BE 는 { success, code, data } 로 감싼다. 내용물(data.data)만 반환한다.

/** 내 기록 전체 → { items: [{ legendId, gsbCount, selCount, skillIds[3], skillTiers[3] }] } */
export const fetchGetGsb = async () => {
  const { data } = await API.get(SIMULATORS.GSB);
  return data.data;
};

/** 바뀐 선수 묶음 저장 — { items: [...] } (1~100개) → { saved } */
export const fetchPutGsb = async (body) => {
  const { data } = await API.put(SIMULATORS.GSB, body);
  return data.data;
};

/** 선수 한 명 초기화 → { deleted } */
export const fetchDeleteGsb = async (legendId) => {
  const { data } = await API.delete(SIMULATORS.gsbItem(legendId));
  return data.data;
};

/** 이미지 저장 기록 — { legendId, gsbCount, selCount, skillIds[3], skillTiers[3] } → { id } */
export const fetchPostGsbSave = async (body) => {
  const { data } = await API.post(SIMULATORS.GSB_SAVES, body);
  return data.data;
};
