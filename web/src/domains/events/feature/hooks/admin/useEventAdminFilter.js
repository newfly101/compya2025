import { useMemo } from "react";
import { createSearchFilterUnit, createStatusFilterUnit, createVisibleFilterUnit } from "@/core/filters/index.js";
import { useFilterPipline } from "@/core/filters/hooks/useFilterPipline.js";

export const useEventAdminFilter = (events) => {
  const filterUnits = useMemo(() => [
    createSearchFilterUnit({
      placeholder: "이벤트명 검색",
      fields: ["title"]
    }),
    createStatusFilterUnit(),
    createVisibleFilterUnit()
  ], []);

  return useFilterPipline(events, filterUnits);
}
