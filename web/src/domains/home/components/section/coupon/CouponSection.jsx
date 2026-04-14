import React from "react";
import styles from "./CouponSection.module.scss";
import { MOCK_COUPONS } from "@/domains/home/config/MOCK_COUPONS.js";

const CouponSection = () => {
  return (
    <div className={styles.couponScroll}>
      {MOCK_COUPONS.map((coupon) => (
        <div key={coupon.id} className={styles.couponCard}>
          <div className={styles.couponTop}>
            <span className={styles.couponCode}>{coupon.code}</span>
            <button className={styles.couponGoBtn}>바로가기</button>
          </div>
          <p className={styles.couponTitle}>{coupon.title}</p>
          <p className={styles.couponExpire}>
            {/*<span className={styles.expireDot}>●</span>*/}
            유효기간 {coupon.expiredAt}
          </p>
        </div>
      ))}
    </div>
  );
};

export default CouponSection;
