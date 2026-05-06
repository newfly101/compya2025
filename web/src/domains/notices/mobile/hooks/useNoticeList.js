import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetSiteNoticeList, requestGetOfficialNoticeList } from "@/domains/notices/store/public/thunks.js";

export const useNoticeList = () => {
  const dispatch = useDispatch();
  const siteNotices     = useSelector(state => state.notices.siteNotices);
  const officialNotices = useSelector(state => state.notices.officialNotices);

  useEffect(() => {
    dispatch(requestGetSiteNoticeList());
    dispatch(requestGetOfficialNoticeList());
  }, [dispatch]);

  const featuredNotice  = siteNotices.find(n => n.isPinned) ?? siteNotices[0] ?? null;
  const listedNotices   = siteNotices.filter(n => n !== featuredNotice).slice(0, 3);
  const listedOfficials = officialNotices.slice(0, 3);

  return { featuredNotice, listedNotices, listedOfficials, siteNotices };
};
