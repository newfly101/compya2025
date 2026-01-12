import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { NOTICE_TABS } from "@/feature/notice/index.js";

export const useNoticePage = () => {
  const [params] = useSearchParams();
  const tabKey = params.get("tab") ?? "";
  const tab = NOTICE_TABS[tabKey] ?? NOTICE_TABS[""];

  useEffect(() => {
    document.title = tab.title;
  }, [tab.title]);

  const tabList = useMemo(() => Object.values(NOTICE_TABS).map(({ key, label }) => ({
    key,
    label,
  })), []);

  return {
    tab,
    tabList,
  }
}
