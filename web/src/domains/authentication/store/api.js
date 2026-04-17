import { API } from "@/app/store/APIConfig.js";
import { AUTH } from "@/domains/authentication/store/endpoints.js";

/**
 * User Health Check API
 */
export const fetchHealthCheck = async () => {
  try {
    const { data } = await API.get(`${AUTH.HEALTH}`);

    return data;
  } catch (error) {
    if (error.response?.status === 401) {
      return null;
    }
    throw error;
  }
};

export const fetchLogout = async () => {
  await API.post(`${AUTH.LOGOUT}`);
}
