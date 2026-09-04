import { API } from "@/infra/http/client.js";
import { ADMIN_NOTICES } from "@/domains/notices/store/admin/endpoints.js";

// BE 는 모든 응답을 { success, code, data } 로 감싼다. 실제 payload 는 data.data.
// 수정(UPDATE) 은 BE 가 PUT 매핑이고, UPDATE/UPDATE_VISIBLE 는 id 를 받는 함수형 endpoint.
export const fetchAdminGetNoticeList   = async ()            => { const { data } = await API.get(ADMIN_NOTICES.GET_LIST);                      return data.data; };
export const fetchAdminInsertNotice    = async (notice)      => { const { data } = await API.post(ADMIN_NOTICES.INSERT, notice);                return data.data; };
export const fetchAdminUpdateNotice    = async (id, notice)  => { const { data } = await API.put(ADMIN_NOTICES.UPDATE(id), notice);             return data.data; };
export const fetchAdminUpdateVisible   = async (id, visible) => { const { data } = await API.patch(ADMIN_NOTICES.UPDATE_VISIBLE(id), { isVisible: visible }); return data.data; };
export const fetchAdminUpdatePinned    = async (id, pinned)  => { const { data } = await API.patch(ADMIN_NOTICES.UPDATE_PINNED(id), { isPinned: pinned }); return data.data; };
export const fetchAdminDeleteNotice    = async (id)           => { const { data } = await API.delete(ADMIN_NOTICES.DELETE(id));                 return data.data; };
