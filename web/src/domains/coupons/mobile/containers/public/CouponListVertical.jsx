import React from "react";
import styles from "./CouponList.module.scss";
import CouponCard from "@/domains/coupons/mobile/components/couponCard/CouponCard.jsx";

const CouponListVertical = ({ coupons = [], isExpired = false }) => {
  return (
    <div className={styles.couponList}>
      {coupons.map((coupon) => (
        <CouponCard
          key={coupon.id}
          coupon={coupon}
          showDetail={true}
          isExpired={isExpired}
        />
      ))}
    </div>
  );
};

export default CouponListVertical;
