import React from "react";
import styles from "./CouponCard.module.scss";

const CouponCardBase = ({ code, disabled, children}) => {
  const openCoupon = () => {
    const url = `http://withhive.me/399/${code}`;
    window.open(url, "_blank");
  };

  return (
    <article className={styles.couponCard} aria-disabled={disabled}>
      <header className={styles.couponCardHeader}>
        <code className={styles.couponCardCode}>{code}</code>

        <button
          type="button"
          data-gtm="coupon_click"
          data-coupon-code={code}
          aria-label={`쿠폰 ${code} 바로가기`}
          className={`${styles.couponCardAction} ${disabled ? styles.isDisabled : ""}`}
          onClick={openCoupon}
          disabled={disabled}
        >
          바로가기
        </button>
      </header>

      {children}
    </article>
  );
};

export default CouponCardBase;
