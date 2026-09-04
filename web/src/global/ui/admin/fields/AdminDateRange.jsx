import styles from "./AdminDateRange.module.scss";

// 날짜 범위(시작~종료) 인풋 2개. 이벤트 등록 기간 등에서 재사용.
const AdminDateRange = ({ start, end, onStartChange, onEndChange, name }) => {
  return (
    <div className={styles.row}>
      <input
        type="date"
        className={styles.input}
        name={name ? `${name}Start` : undefined}
        value={start ?? ""}
        onChange={(e) => onStartChange?.(e.target.value)}
      />
      <span className={styles.sep}>~</span>
      <input
        type="date"
        className={styles.input}
        name={name ? `${name}End` : undefined}
        value={end ?? ""}
        onChange={(e) => onEndChange?.(e.target.value)}
      />
    </div>
  );
};

export default AdminDateRange;
