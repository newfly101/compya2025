import { API } from "@/infra/http/client.js";
import { QUIZ } from "@/domains/quiz/store/public/endpoints.js";

export const fetchLatestQuizAnswer = async () => {
  const { data } = await API.get(QUIZ.GET_LATEST);
  return data;
};
