import { API } from "@/infra/http/client.js";
import { EVENTS } from "@/domains/events/store/public/endpoints.js";
// BE 는 모든 응답을 { success, code, data } 로 감싼다. api 함수는 내용물(data.data)만 반환한다.

export const fetchGetUserExternalEvent = async () => {
  const { data } = await API.get(`${EVENTS.GET_EVENTS}`);
  return data.data;
};

// 상세 1건. 없는·비공개 id 는 404 — 호출부(thunk)가 status 로 구분한다.
export const fetchGetUserEventDetail = async (id) => {
  const { data } = await API.get(EVENTS.GET_EVENT(id));
  return data.data;
};
