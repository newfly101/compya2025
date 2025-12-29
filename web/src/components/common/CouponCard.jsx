import React from "react";
import styles from "@/styles/layout/CouponCard.module.scss";

const CouponCard = ({ code, rewardTitle, rewardDetail, expireDate, disabled, short=false }) => {
  const copy = () => {
    const url = `http://withhive.me/399/${code}`;
    window.open(url, "_blank");
  };

  return (
    <div className={styles.card}>

      <div className={styles.header}>
        <span className={styles.code}>{code}</span>
        <button data-gtm={"coupon_click"} data-coupon-code={code} className={`${styles.copyBtn} ${disabled ? styles.disabled : ""}`}
                onClick={copy} disabled={disabled}>
          바로가기
        </button>
      </div>

      <div className={styles.reward}>
        <div className={styles.title}>{rewardTitle}</div>
        {short === false &&
          <div className={styles.detail}>{rewardDetail}</div>
        }
      </div>

      <div className={styles.expire}>
        ⏱ <span>유효기간 {expireDate}</span>
      </div>

      {short === false &&
        <div className={styles.infoText}>
          바로가기 버튼을 누르면 게임이 실행되며 쿠폰을 수령합니다.
        </div>
      }
    </div>
  );
};

export default CouponCard;
