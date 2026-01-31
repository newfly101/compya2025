import React from "react";
import { dateUtils } from "@/global/utils/datetime/dateUtils.js";

/* =========================
   Filter Unit
========================= */
export const createStatusFilterUnit = ({
  key = "status",
  labels = {
    ALL: "전체 상태",
    ACTIVE: "진행중",
    EXPIRED: "종료"
  },
} = {}) => ({
  key,
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
      <option value="ALL">{labels.ALL}</option>
      <option value="ACTIVE">{labels.ACTIVE}</option>
      <option value="EXPIRED">{labels.EXPIRED}</option>
    </select>
  )
});
