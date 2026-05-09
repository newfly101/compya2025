import { COUPON_TABLE } from "@/domains/coupons/config/couponTable.config.js";

const CouponTableHead = () => (
  <tr>
    {COUPON_TABLE.map((col) => <th key={col}>{col}</th>)}
  </tr>
);

export default CouponTableHead;
