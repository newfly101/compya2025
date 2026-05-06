import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetSiteNoticeList } from "@/domains/notices/store/public/thunks.js";

export const useNoticeDetail = (id) => {
  const dispatch = useDispatch();
  const siteNotices = useSelector(state => state.notices.siteNotices);

  useEffect(() => {
    if (siteNotices.length === 0) dispatch(requestGetSiteNoticeList());
  }, [dispatch, siteNotices.length]);

  const notice = siteNotices.find(n => Number(n.id) === Number(id)) ?? null;

  return { notice };
};
