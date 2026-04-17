import { useLocation, useMatches } from "react-router-dom";
import { useEffect } from "react";
import { pushEvent } from "@/app/analytics/ga.js";

export const useGA4PageView = () => {
  const location = useLocation();
  const matches = useMatches();

  useEffect(() => {
    const current = matches[matches.length - 1];
    if (current?.handle?.title) {
      document.title = current.handle.title;
    }

    pushEvent({
      event: "page_view",
      page_path: location.pathname,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [location.pathname, matches]);
}
