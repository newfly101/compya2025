import { API } from "@/infra/http/client.js";
import { LEGEND_COLLECTION_SKILLS } from "@/domains/legendCollectionSkills/store/public/endpoints.js";
// BE 는 { success, code, data } 로 감싼다. 내용물(data.data)만 반환한다.

export const fetchGetSkillItems = async () => {
  const { data } = await API.get(LEGEND_COLLECTION_SKILLS.GET_ALL);
  return data.data;
};

/** 등록 — { slots: [{ skillId, baseGrade } x3] } */
export const fetchPutSlots = async (legendId, body) => {
  const { data } = await API.put(LEGEND_COLLECTION_SKILLS.putSlots(legendId), body);
  return data.data;
};

/** 강화·되돌리기·초기화·일괄 — { action, slot? }. 갱신된 항목을 돌려준다 */
export const fetchPostEvent = async (legendId, body) => {
  const { data } = await API.post(LEGEND_COLLECTION_SKILLS.postEvent(legendId), body);
  return data.data;
};

/** 저장 전 쌓아 둔 강화 한 번에 — { actions: [{ action, slot }] }. 갱신된 항목을 돌려준다 */
export const fetchPostBatch = async (legendId, body) => {
  const { data } = await API.post(LEGEND_COLLECTION_SKILLS.postBatch(legendId), body);
  return data.data;
};
