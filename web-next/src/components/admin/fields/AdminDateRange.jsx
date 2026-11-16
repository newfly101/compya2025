import styles from "./AdminDateRange.module.scss";

// 날짜 범위(시작~종료) 인풋 2개. 이벤트 등록 기간 등에서 재사용.
// min/max 는 선택 — 통계 탭의 시간대별 분포처럼 선택 가능 구간을 클램프해야 할 때만 넘긴다.
const AdminDateRange = ({ start, end, onStartChange, onEndChange, name, min, max }) => {
  return (
    <div className={styles.row}>
      <input
        type="date"
        className={styles.input}
        name={name ? `${name}Start` : undefined}
        value={start ?? ""}
        min={min}
        max={max}
        onChange={(e) => onStartChange?.(e.target.value)}
      />
      <span className={styles.sep}>~</span>
      <input
        type="date"
        className={styles.input}
        name={name ? `${name}End` : undefined}
        value={end ?? ""}
        min={min}
        max={max}
        onChange={(e) => onEndChange?.(e.target.value)}
      />
    </div>
  );
};

export default AdminDateRange;
