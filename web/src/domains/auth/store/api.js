import { API } from "@/app/store/APIConfig.js";
import { AUTH } from "@/domains/auth/store/endpoints.js";

/**
 * User Health Check API
 */
export const fetchHealthCheck = async () => {
  const { data } = await API.get(`${AUTH.HEALTH}`);
  return data;
};

export const fetchLogout = async () => {
  await API.post(`${AUTH.LOGOUT}`);
}
