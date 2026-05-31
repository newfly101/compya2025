import { API } from "@/infra/http/client.js";
import { ADMIN_USERS } from "@/domains/users/store/admin/endpoints.js";

export const fetchAdminUserList   = async (params) => {
  const { data } = await API.get(ADMIN_USERS.GET_LIST, { params });
  return data;
};
export const fetchAdminUserDetail = async (id) => {
  const { data } = await API.get(ADMIN_USERS.GET_DETAIL(id));
  return data;
};
export const fetchAdminPatchRole  = async (id, userRole) => {
  const { data } = await API.patch(ADMIN_USERS.PATCH_ROLE(id), { userRole });
  return data;
};
export const fetchAdminPatchStatus = async (id, userStatus) => {
  const { data } = await API.patch(ADMIN_USERS.PATCH_STATUS(id), { userStatus });
  return data;
};
