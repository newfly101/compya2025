import PinnedBadge from "@/global/ui/badge/PinnedBadge.jsx";
import { formatNoticeDate } from "@/domains/notices/mobile/noticeDate.js";
import styles from "./OfficialNoticeCard.module.scss";

const OfficialNoticeCard = ({ notice }) => {
  const handleClick = () => {
    if (notice.externalLink) window.open(notice.externalLink, "_blank");
  };
  const dateText = formatNoticeDate(notice);

  return (
    <article className={styles.card} onClick={handleClick}>
      <div className={styles.cardTop}>
        <PinnedBadge variant="cafe" />
        <span className={styles.externalLabel}>외부 링크 →</span>
      </div>
      <p className={styles.title}>{notice.title}</p>
      {notice.summary && <p className={styles.summary}>{notice.summary}</p>}
      {dateText && <span className={styles.date}>{dateText}</span>}
    </article>
  );
};

export default OfficialNoticeCard;
