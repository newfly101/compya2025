// src/domains/mobile/components/NoticeItem/NoticeItem.jsx
import styles from "./NoticeItem.module.scss";

/**
 * C/NoticeItem — 공지사항 목록 행
 * isNew: 보라색 dot (신규) / 기본: 흰색 dot
 */
const NoticeItem = ({ title, summary, date, isNew = false, onClick }) => {
  return (
    <button className={styles.item} onClick={onClick}>
      <span className={`${styles.dot} ${isNew ? styles.dotNew : ""}`} />
      <div className={styles.content}>
        <div className={styles.top}>
          <p className={styles.title}>{title}</p>
          <span className={styles.date}>{date}</span>
        </div>
        {summary && <p className={styles.summary}>{summary}</p>}
      </div>
      <div className={styles.divider} />
    </button>
  );
};

export default NoticeItem;
