import styles from "./NavRow.module.scss";

// 마이페이지 이동 행 — 제목은 행동 문구, 보조 문구는 카드와 겹치지 않게. 높이 56px 이상.
export default function NavRow({ title, sub, onClick }) {
  return (
    <button type="button" className={styles.row} onClick={onClick}>
      <span className={styles.text}>
        <strong className={styles.title}>{title}</strong>
        {sub && <span className={styles.sub}>{sub}</span>}
      </span>
      <span className={styles.chevron} aria-hidden="true">›</span>
    </button>
  );
}
