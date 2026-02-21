import { useMemo, useState } from "react";
import { dateUtils } from "@/global/utils/datetime/dateUtils.js";

export const useAdminEventFilter = (events = []) => {
  const [filters, setFilters] = useState({
    keyword: "",
    status: "ALL",
    visible: "ALL",
  });

  const filteredData = useMemo(() => {
    return events.filter((event) => {

      /* ================= 검색 ================= */
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const match =
          event.title?.toLowerCase().includes(keyword);

        if (!match) return false;
      }

      /* ================= 상태 ================= */
      if (
        filters.status === "ACTIVE" &&
        dateUtils.expired(event.expireAt)
      ) {
        return false;
      }

      if (
        filters.status === "EXPIRED" &&
        !dateUtils.expired(event.expireAt)
      ) {
        return false;
      }

      /* ================= 노출 ================= */
      if (filters.visible !== "ALL") {
        const isVisible = event.visible;

        if (
          (filters.visible === "VISIBLE" && !isVisible) ||
          (filters.visible === "HIDDEN" && isVisible)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [events, filters]);

  return {
    filters,
    setFilters,
    filteredData,
  };
};
