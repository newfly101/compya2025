import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetNoticeList } from "@/domains/notices/store/public/thunks.js";

export const useNoticeList = () => {
  const dispatch        = useDispatch();
  const siteNotices     = useSelector(state => state.notices.siteNotices);
  const officialNotices = useSelector(state => state.notices.officialNotices);
  const loading         = useSelector(state => state.notices.loading);
  const error           = useSelector(state => state.notices.error);
  const loaded          = useSelector(state => state.notices.loaded);

  useEffect(() => {
    dispatch(requestGetNoticeList());
  }, [dispatch]);

  const retry = () => dispatch(requestGetNoticeList());

  const featuredNotice  = siteNotices.find(n => n.isPinned) ?? siteNotices[0] ?? null;
  const listedNotices   = siteNotices.filter(n => n !== featuredNotice).slice(0, 3);
  const listedOfficials = officialNotices.slice(0, 3);

  return {
    featuredNotice, listedNotices, listedOfficials, siteNotices,
    loading, error, loaded, retry,
  };
};
