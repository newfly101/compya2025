import { API } from "@/infra/http/client.js";
import { ADMIN_NOTICES } from "@/domains/notices/store/admin/endpoints.js";

export const fetchAdminGetNoticeList   = async ()       => { const { data } = await API.get(ADMIN_NOTICES.GET_LIST);               return data; };
export const fetchAdminInsertNotice    = async (notice) => { const { data } = await API.post(ADMIN_NOTICES.INSERT, notice);         return data; };
export const fetchAdminUpdateNotice    = async (notice) => { const { data } = await API.patch(ADMIN_NOTICES.UPDATE, notice);        return data; };
export const fetchAdminUpdateVisible   = async (payload)=> { const { data } = await API.patch(ADMIN_NOTICES.UPDATE_VISIBLE, payload); return data; };
