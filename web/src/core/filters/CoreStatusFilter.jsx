import React from "react";
import { dateUtils } from "@/global/utils/datetime/dateUtils.js";

/* =========================
   Filter Unit
========================= */
export const statusFilterUnit = {
  key: "status",
  initial: "ALL",

  /* =========================
   Filter Spec (규칙)
  ========================= */
  predicate: (value) => (item) => {
    if (value === "ACTIVE") return !dateUtils.expired(item.expireAt);
    if (value === "EXPIRED") return dateUtils.expired(item.expireAt);
    return true;
  },

  /* =========================
   Filter UI
  ========================= */
  UI: ({ value, onChange }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="ALL">전체 상태</option>
      <option value="ACTIVE">진행중</option>
      <option value="EXPIRED">종료</option>
    </select>
  )
};
