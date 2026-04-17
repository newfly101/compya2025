// domains/coupon/components/CouponCard.jsx
import styles from "./CouponCard.module.scss";

const CouponCard = ({ coupon, showDetail = false, isExpired = false }) => {
  const details = coupon.detail?.split("\n") ?? [];

  const handleGoCoupon = () => {
    if (isExpired) return;
    window.open(`http://withhive.me/399/${coupon.couponCode}`, "_blank");
  };

  return (
    <article className={`${styles.couponCard} ${isExpired ? styles.expired : ""}`}>
      <div className={styles.couponTop}>
        <span className={styles.couponCode}>{coupon.couponCode}</span>
        <button className={`${styles.couponGoBtn} ${isExpired ? styles.expiredBtn : ""}`}
                onClick={handleGoCoupon}>바로가기
        </button>
      </div>
      <p className={styles.couponTitle}>{coupon.title}</p>

      {showDetail && coupon?.detail.length > 0 && (
        <div className={styles.couponBody}>
          {details.map((item, idx) => (
            <p key={idx}>{item}</p>
          ))}
        </div>
      )}

      <p className={styles.couponExpire}>
        <span className={styles.expireDot}>⏱</span>
        유효기간 {coupon.expireAt}
      </p>
      {showDetail && (
        <p className={styles.couponExplain}>
          바로가기 버튼을 누르면 게임이 실행되며 쿠폰을 수령합니다.
        </p>
      )}
    </article>
  );
};

export default CouponCard;
