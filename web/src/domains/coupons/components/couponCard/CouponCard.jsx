// domains/coupon/components/CouponCard.jsx
import styles from "./CouponCard.module.scss";

const CouponCard = ({ coupon, children, isExpired = false }) => {
  return (
    <article className={`${styles.couponCard} ${isExpired ? styles.expired : ''}`}>
      <div className={styles.couponTop}>
        <span className={styles.couponCode}>{coupon.code}</span>
        <button className={`${styles.couponGoBtn} ${isExpired ? styles.expiredBtn : ""}`}>바로가기</button>
      </div>
      <p className={styles.couponTitle}>{coupon.title}</p>

      {children && (
        <div className={styles.couponBody}>
          {children.map((item, idx) => (
            <p key={idx}>{item}</p>
          ))}
        </div>
      )}

      <p className={styles.couponExpire}>
        <span className={styles.expireDot}>⏱</span>
        유효기간 {coupon.expiredAt}
      </p>
      {children && (
        <p className={styles.couponExplain}>
          바로가기 버튼을 누르면 게임이 실행되며 쿠폰을 수령합니다.
        </p>
      )}
    </article>
  );
};

export default CouponCard;
