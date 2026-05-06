import styles from "./OfficialNoticeCard.module.scss";

const OfficialNoticeCard = ({ notice }) => {
  const handleClick = () => {
    if (notice.externalLink) window.open(notice.externalLink, "_blank");
  };

  return (
    <article className={styles.card} onClick={handleClick}>
      <div className={styles.cardTop}>
        <span className={styles.sourceBadge}>공식</span>
        <span className={styles.externalLabel}>외부 링크 →</span>
      </div>
      <p className={styles.title}>{notice.title}</p>
      {notice.summary && <p className={styles.summary}>{notice.summary}</p>}
      <span className={styles.date}>{notice.publishedAt?.slice(0, 10)}</span>
    </article>
  );
};

export default OfficialNoticeCard;
