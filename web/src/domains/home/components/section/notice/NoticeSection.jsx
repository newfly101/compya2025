import styles from "./NoticeSection.module.scss";
import { MOCK_NOTICES } from "@/domains/home/config/MOCK_NOTICES.js";

const NoticeSection = () => {
  return (
    <ul className={styles.noticeList}>
      {MOCK_NOTICES.map((notice) => (
        <li key={notice.id} className={styles.item}>
          <span className={styles.dot} />
          <div className={styles.content}>
            <span className={styles.title}>{notice.title}</span>
            <span className={styles.sub}>{notice.sub}</span>
          </div>
          <span className={styles.date}>{notice.date}</span>
        </li>
      ))}
    </ul>
  );
};

export default NoticeSection;
