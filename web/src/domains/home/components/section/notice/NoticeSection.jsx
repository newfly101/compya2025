import { Link } from "react-router-dom";
import styles from "./NoticeSection.module.scss";
import { useNoticeList } from "@/domains/notices/mobile/hooks/useNoticeList.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";

const NoticeSection = () => {
  const { siteNotices } = useNoticeList();
  const notices = siteNotices.slice(0, 3);

  return (
    <ul className={styles.noticeList}>
      {notices.map((notice) => (
        <li key={notice.id}>
          <Link to={ROUTE_PATHS.notice_details(notice.id)} className={styles.item}>
            <span className={styles.dot} />
            <div className={styles.content}>
              <span className={styles.title}>{notice.title}</span>
              <span className={styles.sub}>{notice.summary}</span>
            </div>
            <span className={styles.date}>{notice?.publishedAt?.slice(0, 10)}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default NoticeSection;
