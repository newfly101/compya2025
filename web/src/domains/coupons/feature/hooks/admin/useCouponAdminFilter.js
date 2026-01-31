import { useMemo } from "react";
import { createSearchFilterUnit, createStatusFilterUnit, createVisibleFilterUnit } from "@/core/filters/index.js";
import { useFilterPipline } from "@/core/filters/hooks/useFilterPipline.js";

export const useCouponAdminFilter = (coupons) => {
  const filterUnits = useMemo(() => [
    createSearchFilterUnit({
      placeholder: "쿠폰 코드 검색",
      fields: ["couponCode"],
    }),
    createStatusFilterUnit({
      labels: {
        ALL: "전체 상태",
        ACTIVE: "사용 가능",
        EXPIRED: "만료",
      },
    }),
    createVisibleFilterUnit(),
  ], []);

  return useFilterPipline(coupons, filterUnits);
};
