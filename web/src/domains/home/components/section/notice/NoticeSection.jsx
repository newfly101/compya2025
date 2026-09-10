import { Link } from "react-router-dom";
import styles from "./NoticeSection.module.scss";
import { useNoticeList } from "@/domains/notices/mobile/hooks/useNoticeList.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";

const NoticeSection = () => {
  const { siteNotices, loading, error, loaded, retry } = useNoticeList();
  const notices = siteNotices.slice(0, 3);

  // 홈은 여러 섹션이 나란히 있다 — 이 섹션 하나가 실패해도 다른 섹션은 멀쩡해야 한다(compact).
  if (loading && !loaded) return <Skeleton count={3} height={40} />;
  if (error) return <StateBox status="error" onRetry={retry} compact />;
  if (notices.length === 0) return <StateBox status="empty" message="등록된 공지가 없습니다" compact />;

  return (
    <ul className={styles.noticeList}>
      {notices.map((notice) => (
        <li key={notice.id}>
          <Link to={ROUTE_PATHS.notice_details(notice)} className={styles.item}>
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
