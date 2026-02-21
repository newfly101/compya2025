import React from "react";
import styles from "./CouponCard.module.scss";
import CouponCardBase from "@/domains/coupons/feature/public/components/card/CouponCardBase.jsx";

const CouponCardSummary = ({ code, rewardTitle, expireDate, disabled}) => {
  return (
    <CouponCardBase code={code} disabled={disabled}>
      <section className={styles.couponCardBody}>
        <h3 className={styles.couponCardTitle}>
          {rewardTitle}
        </h3>
      </section>

      <footer className={styles.couponCardExpire}>
        ⏱ <time>유효기간 {expireDate}</time>
      </footer>
    </CouponCardBase>
  );
};

export default CouponCardSummary;
