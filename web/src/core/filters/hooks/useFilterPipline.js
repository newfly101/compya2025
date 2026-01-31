import { useMemo, useState } from "react";
import { applyFilters, buildInitialFilters } from "@/core/filters/index.js";

export const useFilterPipline = (data, filterUnits) => {
  const [filters, setFilters] = useState(
    buildInitialFilters(filterUnits)
  );

  const filteredData = useMemo(() => {
    return applyFilters(data, filters, filterUnits);
  }, [data, filters, filterUnits]);

  return {
    filters,
    setFilters,
    filteredData,
    filterUnits
  };
};
