// src/domains/mobile/components/FullEventCard/FullEventCard.jsx
import styles from "./FullEventCard.module.scss";

/**
 * C/FullEventCard — 이벤트 목록 페이지용 (343×228)
 * variant: "default" | "expired"
 */
const FullEventCard = ({
                         variant = "default",
                         title,
                         dateRange,
                         thumbnailUrl,
                         thumbBg = "#3c1e50",
                         status = "active",
                         detailUrl,
                         onClick,
                       }) => {
  const isExpired = variant === "expired";
  const statusLabel = { active: "진행중", expired: "종료", upcoming: "예정" }[status];

  return (
    <button
      className={`${styles.card} ${isExpired ? styles.expired : ""}`}
      onClick={onClick}
    >
      {/* 썸네일 */}
      <div className={styles.thumb} style={{ backgroundColor: thumbBg }}>
        {thumbnailUrl
          ? <img src={thumbnailUrl} alt={title} className={styles.thumbImg} />
          : <span className={styles.thumbEmpty}>이미지 배너 영역</span>
        }
        <span className={`${styles.badge} ${styles[`badge_${status}`]}`}>
          {statusLabel}
        </span>
      </div>

      {/* 본문 */}
      <div className={styles.body}>
        <p className={`${styles.title} ${isExpired ? styles.titleExpired : ""}`}>
          {title}
        </p>

        <div className={styles.metaRow}>
          <span className={styles.cal}>📅</span>
          <span className={styles.date}>{dateRange}</span>
        </div>

        <div className={styles.divider} />

        {isExpired
          ? <span className={styles.expiredNote}>종료된 이벤트입니다</span>
          : <span className={styles.detailLink}>상세 보기 →</span>
        }
      </div>
    </button>
  );
};

export default FullEventCard;
