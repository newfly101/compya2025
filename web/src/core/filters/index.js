// @/core/filters/index.js

import { createSearchFilterUnit } from "@/core/filters/CoreSearchFilter.jsx";
import { createVisibleFilterUnit } from "@/core/filters/CoreVisibleFilter.jsx";
import { createStatusFilterUnit } from "@/core/filters/CoreStatusFilter.jsx";

/* =========================
   Filter Units (Named Export)
========================= */
export {
  createSearchFilterUnit,
  createVisibleFilterUnit,
  createStatusFilterUnit,
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


export const createFilterPipeline = (...factories) =>
  factories.map(f => (typeof f === "function" ? f() : f));
