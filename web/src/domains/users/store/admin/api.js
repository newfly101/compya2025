import { API } from "@/infra/http/client.js";
import { ADMIN_USERS } from "@/domains/users/store/admin/endpoints.js";

// BE 는 모든 응답을 { success, code, data } 로 감싼다. 실제 payload 는 data.data.
export const fetchAdminUserList   = async (params) => {
  const { data } = await API.get(ADMIN_USERS.GET_LIST, { params });
  return data.data;
};
export const fetchAdminUserDetail = async (id) => {
  const { data } = await API.get(ADMIN_USERS.GET_DETAIL(id));
  return data.data;
};
export const fetchAdminPatchRole  = async (id, userRole) => {
  const { data } = await API.patch(ADMIN_USERS.PATCH_ROLE(id), { userRole });
  return data.data;
};
export const fetchAdminPatchStatus = async (id, userStatus) => {
  const { data } = await API.patch(ADMIN_USERS.PATCH_STATUS(id), { userStatus });
  return data.data;
};
