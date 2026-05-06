import { useNavigate } from "react-router-dom";
import styles from "./NoticeSection.module.scss";
import { useNoticeList } from "@/domains/notices/mobile/hooks/useNoticeList.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";

const NoticeSection = () => {
  const { siteNotices } = useNoticeList();
  const navigate = useNavigate();
  const notices = siteNotices.slice(0, 3);

  return (
    <ul className={styles.noticeList}>
      {notices.map((notice) => (
        <li key={notice.id} className={styles.item} onClick={() => navigate(ROUTE_PATHS.notice_details(notice.id))}>
          <span className={styles.dot} />
          <div className={styles.content}>
            <span className={styles.title}>{notice.title}</span>
            <span className={styles.sub}>{notice.summary}</span>
          </div>
          <span className={styles.date}>{notice?.publishedAt?.slice(0, 10)}</span>
        </li>
      ))}
    </ul>
  );
};

export default NoticeSection;
