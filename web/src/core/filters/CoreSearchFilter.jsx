import React from "react";

/* =========================
   Filter Unit
========================= */
export const searchFilterUnit = {
  key: "keyword",
  initial: "",

  /* =========================
   Filter Spec (규칙)
  ========================= */
  predicate: (value) => (item) => {
    if (!value) return true;

    // 기본은 title 기준 (필요하면 확장)
    return (
      item.title &&
      item.title.toLowerCase().includes(value.toLowerCase())
    );
  },

  /* =========================
   Filter UI
  ========================= */
  UI: ({value, onChange, title}) => (
    <input
      type="text"
      placeholder={`${title}명 검색`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
};
