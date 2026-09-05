import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { formatNoticeDate } from "@/domains/notices/mobile/noticeDate.js";
import styles from "./NoticeCard.module.scss";

const NoticeCard = ({ notice, isFeatured = false }) => {
  const to = ROUTE_PATHS.notice_details(notice.id);
  const dateText = formatNoticeDate(notice);

  if (isFeatured) {
    return (
      <Link to={to} className={styles.featuredCard}>
        <div className={styles.featuredThumb}>
          {notice.imageUrl
            ? <img src={notice.imageUrl} alt="" />
            : <div className={styles.thumbEmpty} />
          }
        </div>
        {/* 제목과 chevron 을 같은 행에 두어 세로 중심을 맞춘다 (일반 카드의 cardBottom 구조 참고) */}
        <div className={styles.featuredTitleRow}>
          <p className={styles.featuredTitle}>{notice.title}</p>
          <span className={styles.chevron}>›</span>
        </div>
        {dateText && <span className={styles.metaDate}>{dateText}</span>}
        {notice.summary && (
          <p className={styles.featuredSummary}>{notice.summary.split("\n")[0]}</p>
        )}
      </Link>
    );
  }

  return (
    <Link to={to} className={styles.card}>
      <div className={styles.cardRow}>
        <div className={styles.cardContent}>
          <p className={styles.title}>{notice.title}</p>
          {notice.summary && (
            <p className={styles.summary}>{notice.summary.split("\n")[0]}</p>
          )}
        </div>
        {notice.imageUrl && (
          <div className={styles.smallThumb}>
            <img src={notice.imageUrl} alt="" />
          </div>
        )}
      </div>
      <div className={styles.cardBottom}>
        {dateText && <span className={styles.date}>{dateText}</span>}
        <span className={styles.chevron}>›</span>
      </div>
    </Link>
  );
};

export default NoticeCard;
