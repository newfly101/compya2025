// src/domains/mobile/components/CouponCard/CouponCard.jsx
import styles from "./CouponCard.module.scss";

/**
 * C/CouponCard
 * variant: "default" | "action-focused" | "expired"
 *   default       → 코드 뱃지 + 바로가기 + 제목 + 보상 목록 + 유효기간
 *   action-focused → default + 바로가기 버튼 강조
 *   expired        → 어두운 배경 + 버튼 비활성
 */
const CouponCard = ({
                      variant = "default",
                      code,
                      title,
                      rewards = [],
                      expiry,
                      hint,
                      onGo,
                    }) => {
  const isExpired = variant === "expired";

  return (
    <div className={`${styles.card} ${isExpired ? styles.expired : ""}`}>
      {/* Header: 코드 배지 + 바로가기 */}
      <div className={styles.topRow}>
        <span className={styles.codeBadge}>{code}</span>
        <button
          className={`${styles.goBtn} ${isExpired ? styles.goBtnDisabled : ""}`}
          onClick={!isExpired ? onGo : undefined}
          disabled={isExpired}
        >
          바로가기
        </button>
      </div>

      <div className={styles.divider} />

      {/* 제목 */}
      <p className={`${styles.title} ${isExpired ? styles.titleExpired : ""}`}>
        {title}
      </p>

      {/* 보상 목록 */}
      <div className={styles.rewards}>
        {rewards.map((r, i) => (
          <span key={i} className={styles.reward}>{r}</span>
        ))}
      </div>

      <div className={styles.divider} />

      {/* 유효기간 */}
      {expiry && (
        <div className={styles.expiryRow}>
          <span className={styles.expiryIcon}>⏱</span>
          <span className={styles.expiry}>{expiry}</span>
        </div>
      )}

      {/* 안내 문구 */}
      {hint && <p className={styles.hint}>{hint}</p>}
    </div>
  );
};

export default CouponCard;
