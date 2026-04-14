// src/domains/mobile/components/EventCard/EventCard.jsx
import styles from "./EventCard.module.scss";

/**
 * C/EventCard — compact (홈 피드 2열)
 * variant: "compact" | "default"
 */
const EventCard = ({
                     title,
                     deadlineLabel,
                     thumbnailUrl,
                     status = "active",   // "active" | "expired" | "upcoming"
                     thumbBg = "#3c1e50",
                     onClick,
                   }) => {
  const statusLabel = { active: "진행중", expired: "종료", upcoming: "예정" }[status];

  return (
    <button className={styles.card} onClick={onClick}>
      {/* 썸네일 */}
      <div className={styles.thumb} style={{ backgroundColor: thumbBg }}>
        {thumbnailUrl
          ? <img src={thumbnailUrl} alt={title} className={styles.thumbImg} />
          : <span className={styles.thumbPlaceholder}>🏟</span>
        }
        <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>
          {statusLabel}
        </span>
      </div>

      {/* 텍스트 */}
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {deadlineLabel && (
          <p className={styles.deadline}>{deadlineLabel}</p>
        )}
      </div>
    </button>
  );
};

export default EventCard;
