import { API } from "@/app/store/APIConfig.js";
import { ADMIN_QUIZ } from "@/domains/quiz/store/admin/endpoints.js";

export const fetchAdminQuizAll = async () => {
  const { data } = await API.get(ADMIN_QUIZ.GET_ALL);
  return data;
};

export const fetchAdminQuizCreate = async (body) => {
  const { data } = await API.post(ADMIN_QUIZ.CREATE, body);
  return data;
};

export const fetchAdminQuizUpdate = async (id, body) => {
  const { data } = await API.patch(ADMIN_QUIZ.UPDATE(id), body);
  return data;
};

export const fetchAdminQuizUpdateVisible = async (id, visible) => {
  const { data } = await API.patch(ADMIN_QUIZ.UPDATE_VISIBLE(id), { visible });
  return data;
};
