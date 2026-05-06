import { useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import LabelBadge from "@/global/ui/badge/LabelBadge.jsx";
import styles from "./NoticeCard.module.scss";

const NoticeCard = ({ notice, isFeatured = false }) => {
  const navigate = useNavigate();

  const handleClick = () => navigate(ROUTE_PATHS.notice_details(notice.id));

  if (isFeatured) {
    return (
      <article className={styles.featuredCard} onClick={handleClick}>
        <div className={styles.featuredThumb}>
          {notice.imageUrl
            ? <img src={notice.imageUrl} alt="" />
            : <div className={styles.thumbEmpty} />
          }
        </div>
        <div className={styles.featuredMeta}>
          {notice.category && <LabelBadge variant="update" label={notice.category} />}
          <span className={styles.metaDate}>{notice.publishedAt?.slice(0, 10)}</span>
          <span className={styles.chevron}>›</span>
        </div>
        <p className={styles.featuredTitle}>{notice.title}</p>
        {notice.summary && (
          <p className={styles.featuredSummary}>{notice.summary.split("\n")[0]}</p>
        )}
      </article>
    );
  }

  return (
    <article className={styles.card} onClick={handleClick}>
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
        <span className={styles.date}>{notice.publishedAt?.slice(0, 10)}</span>
        <span className={styles.chevron}>›</span>
      </div>
    </article>
  );
};

export default NoticeCard;
