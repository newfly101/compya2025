import React from "react";

/* =========================
   Filter Unit
========================= */
export const visibleFilterUnit = {
  key: "visible",
  initial: "ALL",

  /* =========================
   Filter Spec (규칙)
  ========================= */
  predicate: (value) => (item) => {
    if (value === "VISIBLE") return item.visible === true;
    if (value === "HIDDEN") return item.visible === false;
    return true; // ALL
  },

  /* =========================
   Filter UI
  ========================= */
  UI: ({value, onChange}) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="ALL">전체 노출</option>
      <option value="VISIBLE">노출</option>
      <option value="HIDDEN">비노출</option>
    </select>
  )
};
