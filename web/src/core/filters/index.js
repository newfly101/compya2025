// @/core/filters/index.js

import { searchFilterUnit } from "@/core/filters/CoreSearchFilter.jsx";
import { visibleFilterUnit } from "@/core/filters/CoreVisibleFilter.jsx";
import { statusFilterUnit } from "@/core/filters/CoreStatusFilter.jsx";

/* =========================
   Filter Units (Named Export)
========================= */
export {
  searchFilterUnit,
  visibleFilterUnit,
  statusFilterUnit,
};

/* =========================
   Utilities
========================= */
export const applyFilters = (data, filters, specs) => {
  return Object.values(specs).reduce(
    (acc, spec) => acc.filter(spec.predicate(filters[spec.key])),
    data
  );
};

export const buildInitialFilters = (units) =>
  Object.fromEntries(units.map(u => [u.key, u.initial]));
