import React from "react";

const STATUS_OPTIONS = [
  { value: "ALL",     label: "전체 상태" },
  { value: "ACTIVE",  label: "사용 가능" },
  { value: "EXPIRED", label: "만료" },
];

const VISIBLE_OPTIONS = [
  { value: "ALL",     label: "전체 노출" },
  { value: "VISIBLE", label: "노출" },
  { value: "HIDDEN",  label: "숨김" },
];

/**
 * keyword / status / visible 구조의 공통 Admin 필터 컨트롤.
 * AdminFilterBar의 children으로 사용.
 */
const AdminDefaultFilterControls = ({ filters, setFilters, searchPlaceholder = "키워드 검색" }) => {
  const update = (key, value) => setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <input
        type="text"
        placeholder={searchPlaceholder}
        value={filters.keyword}
        onChange={(e) => update("keyword", e.target.value)}
      />

      <select value={filters.status} onChange={(e) => update("status", e.target.value)}>
        {STATUS_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <select value={filters.visible} onChange={(e) => update("visible", e.target.value)}>
        {VISIBLE_OPTIONS.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    </>
  );
};

export default AdminDefaultFilterControls;
