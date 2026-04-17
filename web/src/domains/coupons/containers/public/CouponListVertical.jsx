import React from "react";
import styles from "./CouponList.module.scss";
import CouponCard from "@/domains/coupons/components/couponCard/CouponCard.jsx";

const CouponListVertical = ({ coupons = [], isExpired = false }) => {
  return (
    <div className={styles.couponList}>
      {coupons.map((coupon) => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          children={coupon.rewards}
          isExpired={isExpired}
        />
      ))}
    </div>
  );
};

export default CouponListVertical;
