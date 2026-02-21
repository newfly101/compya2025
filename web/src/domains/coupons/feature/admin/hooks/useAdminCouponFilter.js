import { useMemo, useState } from "react";
import { dateUtils } from "@/global/utils/datetime/dateUtils.js";

export const useAdminCouponFilter = (coupons = []) => {
  const [filters, setFilters] = useState({
    keyword: "",
    status: "ALL",
    visible: "ALL",
  });

  const filteredData = useMemo(() => {
    return coupons.filter((coupon) => {

      /* ================= 검색 ================= */
      if (filters.keyword) {
        const keyword = filters.keyword.toLowerCase();
        const match =
          coupon.couponCode?.toLowerCase().includes(keyword) ||
          coupon.title?.toLowerCase().includes(keyword);

        if (!match) return false;
      }

      /* ================= 상태 ================= */
      if (filters.status === "ACTIVE" &&
        dateUtils.expired(coupon.expireAt)) {
        return false;
      }

      if (filters.status === "EXPIRED" &&
        !dateUtils.expired(coupon.expireAt)) {
        return false;
      }

      /* ================= 노출 ================= */
      if (filters.visible !== "ALL") {
        const isVisible = coupon.visible;
        if (
          (filters.visible === "VISIBLE" && !isVisible) ||
          (filters.visible === "HIDDEN" && isVisible)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [coupons, filters]);

  return {
    filters,
    setFilters,
    filteredData,
  };
};
