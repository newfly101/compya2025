import React from "react";

/* =========================
   Filter Unit
========================= */
export const createSearchFilterUnit = ({
   key = "keyword",

   /** 검색 대상 필드 */
   fields = ["title"],

   /** placeholder 텍스트 */
   placeholder = "검색",
} = {}) => ({
  key,
  initial: "",

  /* =========================
   Filter Spec (규칙)
  ========================= */
  predicate: (value) => (item) => {
    if (!value) return true;

    const lower = value.toLowerCase();

    return fields.some(
      (field) =>
        item[field] &&
        String(item[field]).toLowerCase().includes(lower)
    );
  },

  /* =========================
   Filter UI
  ========================= */
  UI: ({value, onChange, title}) => (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
});
