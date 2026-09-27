import { API } from "@/infra/http/client.js";
import { NOTICES } from "@/domains/notices/store/public/endpoints.js";

export const fetchGetNotices = async () => {
  const { data } = await API.get(NOTICES.GET_NOTICES);
  return data;
};

// 목록 응답에는 본문(content)이 없다 — 상세 화면에서 이 API 로 한 건만 더 받아온다.
export const fetchGetNoticeDetail = async (id) => {
  const { data } = await API.get(NOTICES.GET_NOTICE_DETAIL(id));
  return data;
};
