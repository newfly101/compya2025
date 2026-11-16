import RichContent from "@/components/richContent/RichContent.jsx";
import NoticeHero from "@/features/notices/components/NoticeHero.jsx";
import { formatNoticeDate } from "@/features/notices/noticeDate.js";
import styles from "./NoticeDetailScreen.module.scss";

// 서버 컴포넌트 — notice 는 page 가 목록+상세 API 로 합쳐 넘긴다(없으면 page 가 notFound()).
// page_view 는 루트 GoogleAnalytics 가 경로 변경마다 보낸다.
const NoticeDetailScreen = ({ notice }) => {
  const dateText = formatNoticeDate(notice);

  return (
    <div className={styles.screen}>
      <NoticeHero imageUrl={notice.imageUrl} title={notice.title} />

      <div className={styles.metaHeader}>
        {dateText && (
          <div className={styles.metaRow}>
            <span className={styles.metaDate}>{dateText}</span>
          </div>
        )}
        <h1 className={styles.title}>{notice.title}</h1>
      </div>

      {notice.summary && (
        <div className={styles.summary}>
          <p className={styles.summaryLabel}>요약</p>
          <p className={styles.summaryText}>{notice.summary}</p>
        </div>
      )}

      {notice.content && (
        <div className={styles.body}>
          <RichContent html={notice.content} />
        </div>
      )}
    </div>
  );
};

export default NoticeDetailScreen;
