import React from "react";
import styles from "./CouponCard.module.scss";

const CouponCard = ({ code, rewardTitle, rewardDetail, expireDate, disabled, short = false }) => {
  const openCoupon = () => {
    const url = `http://withhive.me/399/${code}`;
    window.open(url, "_blank");
  };

  return (
    <article className={styles.card} aria-disabled={disabled}>
      <header className={styles.header}>
        <code className={styles.code}>{code}</code>
        <button
          type="button"
          data-gtm={"coupon_click"}
          data-coupon-code={code}
          aria-label={`쿠폰 ${code} 바로가기`}
          className={`${styles.copyBtn} ${disabled ? styles.disabled : ""}`}
          onClick={openCoupon}
          disabled={disabled}>
          바로가기
        </button>
      </header>

      <section className={styles.reward}>
        <h3 className={styles.title}>
            {rewardTitle}
        </h3>
        {short === false &&
          <p className={styles.detail}>
            {rewardDetail.split("\n").map((line, idx) => (
              <span key={idx}>
                {line}
                <br />
              </span>
            ))}
          </p>
        }
      </section>

      <footer className={styles.expire}>
        ⏱ <time>유효기간 {expireDate}</time>
      </footer>

      {short === false &&
        <p className={styles.infoText}>
          바로가기 버튼을 누르면 게임이 실행되며 쿠폰을 수령합니다.
        </p>
      }
    </article>
  );
};

export default CouponCard;
