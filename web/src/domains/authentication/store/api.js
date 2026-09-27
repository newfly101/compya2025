import { API } from "@/infra/http/client.js";
import { AUTH } from "@/domains/authentication/store/endpoints.js";
// BE 는 모든 응답을 { success, code, data } 로 감싼다. api 함수는 내용물(data.data)만 반환한다.

/**
 * User Health Check API
 */
export const fetchHealthCheck = async () => {
  const { data } = await API.get(`${AUTH.HEALTH}`);
  return data.data;
};

export const fetchLogout = async () => {
  await API.post(`${AUTH.LOGOUT}`);
};
