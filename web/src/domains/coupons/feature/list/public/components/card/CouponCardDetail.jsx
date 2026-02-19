import React from "react";
import styles from "./CouponCard.module.scss";
import CouponCardBase from "@/domains/coupons/feature/list/public/components/card/CouponCardBase.jsx";

const CouponCardDetail = ({ code, rewardTitle, rewardDetail, expireDate, disabled }) => {
  return (
    <CouponCardBase code={code} disabled={disabled}>
      <section className={styles.couponCardBody}>
        <h3 className={styles.couponCardTitle}>
          {rewardTitle}
        </h3>

        <p className={styles.couponCardDetail}>
          {rewardDetail.split("\n").map((line, idx) => (
            <span key={idx}>
        {line}
              <br />
      </span>
          ))}
        </p>
      </section>

      <footer className={styles.couponCardExpire}>
        ⏱ <time>유효기간 {expireDate}</time>
      </footer>

      <p className={styles.couponCardNotice}>
        바로가기 버튼을 누르면 게임이 실행되며 쿠폰을 수령합니다.
      </p>
    </CouponCardBase>
  );
};

export default CouponCardDetail;
