import React from "react";
import styles from "./CouponSection.module.scss";
import { MOCK_COUPONS2 } from "@/domains/home/config/MOCK_COUPONS.js";
import CouponCard from "@/domains/coupons/components/couponCard/CouponCard.jsx";

const CouponSection = () => {
  return (
    <div className={styles.couponScroll}>

      {MOCK_COUPONS2.map((coupon) => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          // children={coupon.rewards}
          isExpired={false}
        />
      ))}
    </div>
  );
};

export default CouponSection;
