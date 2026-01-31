import React from "react";

/* =========================
   Filter Unit
========================= */
export const createVisibleFilterUnit = ({
  key = "visible",
  labels = {
    ALL: "전체 노출",
    VISIBLE: "노출",
    HIDDEN: "비노출"
  },
} = {}) => ({
  key,
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
      <option value="ALL">{labels.ALL}</option>
      <option value="VISIBLE">{labels.VISIBLE}</option>
      <option value="HIDDEN">{labels.HIDDEN}</option>
    </select>
  )
});
