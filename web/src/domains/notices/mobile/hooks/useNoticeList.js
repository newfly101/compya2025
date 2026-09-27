import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestGetNoticeList } from "@/domains/notices/store/public/thunks.js";

const PAGE_SIZE = 3; // 「더보기」 한 번에 늘어나는 개수

export const useNoticeList = () => {
  const dispatch        = useDispatch();
  // 공개 전용 상태만 읽는다 — siteNotices/loading/error 는 어드민 목록(숨긴 공지 포함) 필드다.
  const siteNotices     = useSelector(state => state.notices.publicSiteNotices);
  const officialNotices = useSelector(state => state.notices.officialNotices);
  const loading         = useSelector(state => state.notices.publicLoading);
  const error           = useSelector(state => state.notices.publicError);
  const loaded          = useSelector(state => state.notices.publicLoaded);

  // 섹션별로 노출 개수를 따로 관리 — 「더보기」를 누를 때마다 PAGE_SIZE 씩 늘어난다.
  const [siteVisible, setSiteVisible] = useState(PAGE_SIZE);
  const [officialVisible, setOfficialVisible] = useState(PAGE_SIZE);

  useEffect(() => {
    dispatch(requestGetNoticeList());
  }, [dispatch]);

  const retry = () => dispatch(requestGetNoticeList());

  const featuredNotice = siteNotices.find(n => n.isPinned) ?? siteNotices[0] ?? null;
  const restNotices     = siteNotices.filter(n => n !== featuredNotice);

  const listedNotices   = restNotices.slice(0, siteVisible);
  const listedOfficials = officialNotices.slice(0, officialVisible);

  const remainingNotices   = restNotices.length - listedNotices.length;
  const remainingOfficials = officialNotices.length - listedOfficials.length;

  const showMoreNotices   = () => setSiteVisible(v => v + PAGE_SIZE);
  const showMoreOfficials = () => setOfficialVisible(v => v + PAGE_SIZE);

  return {
    featuredNotice, listedNotices, listedOfficials, siteNotices,
    remainingNotices, remainingOfficials, showMoreNotices, showMoreOfficials,
    loading, error, loaded, retry,
  };
};
