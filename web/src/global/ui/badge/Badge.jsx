import styles from "./Badge.module.scss";

/**
 * Global Badge Component
 *
 * @param {string} label   - 표시할 텍스트
 * @param {string} variant - brand | source | statusActive | statusExpired | new | hot
 */
const Badge = ({ label, variant = "brand" }) => {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>{label}</span>
  );
};

export default Badge;
