import { useLocation, useMatches } from "react-router-dom";
import { useEffect } from "react";
import { useSelector } from "react-redux";

export const useGA4PageView = () => {
  const location = useLocation();
  const matches = useMatches();
  const {role} = useSelector(state => state.auth);

  useEffect(() => {
    const hostname = window.location.hostname;

    const isLocalhost =
      hostname === "localhost" || hostname === "127.0.0.1";

    // 🚫 GA 차단 조건
    if (isLocalhost && role?.role === "ADMIN") {
      return;
    }

    // title 설정
    const current = matches[matches.length - 1];
    if (current?.handle?.title) {
      document.title = current.handle.title;
    }

    // GA4 page_view
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: "page_view",
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, matches]);
}
