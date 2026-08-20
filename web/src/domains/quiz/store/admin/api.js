import { API } from "@/infra/http/client.js";
import { ADMIN_QUIZ } from "@/domains/quiz/store/admin/endpoints.js";

// BE 는 모든 응답을 { success, code, data } 로 감싼다. 실제 payload 는 data.data.
export const fetchAdminQuizAll = async () => {
  const { data } = await API.get(ADMIN_QUIZ.GET_ALL);
  return data.data;
};

export const fetchAdminQuizCreate = async (body) => {
  const { data } = await API.post(ADMIN_QUIZ.CREATE, body);
  return data.data;
};

export const fetchAdminQuizUpdate = async (id, body) => {
  const { data } = await API.patch(ADMIN_QUIZ.UPDATE(id), body);
  return data.data;
};
