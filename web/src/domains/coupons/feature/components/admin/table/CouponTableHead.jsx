import React from "react";
import { COUPON_TABLE } from "@/domains/coupons/config/couponTable.config.js";

const CouponTableHead = () => {
  return (
    <tr>
      {COUPON_TABLE.map(col => (
        <th key={col.key}>{col.label}</th>
      ))}
    </tr>
  );
};

export default CouponTableHead;
