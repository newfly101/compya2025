import React from "react";
import styles from "./CouponList.module.scss";
import CouponCard from "@/domains/coupons/components/couponCard/CouponCard.jsx";

const CouponListHorizontal = ({ coupons = [] }) => {
  return (
    <div className={styles.couponListScroll}>
      {coupons.map((coupon) => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          showDetail={false}
          isExpired={false}
        />
      ))}
    </div>
  );
};

export default CouponListHorizontal;
