import { API } from "@/infra/http/client.js";
import { AUTH } from "@/domains/authentication/store/endpoints.js";

/**
 * User Health Check API
 */
export const fetchHealthCheck = async () => {
  const { data } = await API.get(`${AUTH.HEALTH}`);
  return data;
};

export const fetchLogout = async () => {
  await API.post(`${AUTH.LOGOUT}`);
};
