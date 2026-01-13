import { BATTING_ORDER_MAP, GRADE_PRIORITY } from "@/feature/dictionary/config/cardConfig.js";

export const sortCombos = (combos = []) => {
  return [...combos].sort((a, b) => {
    if (b.totalPoint !== a.totalPoint) {
      return b.totalPoint - a.totalPoint;
    }
    return (GRADE_PRIORITY[b.grade] ?? 0) - (GRADE_PRIORITY[a.grade] ?? 0);
  });
};

export const getHittingOrderLabel = (selected = []) => {
  const orders = selected
    .map((skill) => BATTING_ORDER_MAP[skill])
    .filter(Boolean); // undefined 제거

  if (orders.length === 0) return "";

  return ` (${orders.join(", ")})`;
};
