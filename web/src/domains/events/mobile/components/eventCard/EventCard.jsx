import { useNavigate } from "react-router-dom";
import styles from "./EventCard.module.scss";
import { trackEventClick } from "@/app/analytics/events/eventEvents.js";

const EventCard = ({ event, showDetail = false, isExpired = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    trackEventClick(event.id, event.title, event.eventType);
    if (event.externalLink) {
      window.open(event.externalLink, "_blank");
    } else {
      navigate(`/events/${event.id}`);
    }
  };

  return (
    <article
      className={`${styles.eventCard} ${isExpired ? styles.expired : ""}`}
      onClick={handleClick}
    >
      <div className={styles.thumb}>
        {event.imageUrl
          ? <img src={event.imageUrl} alt="" />
          : <div className={styles.thumbEmpty}><span>이미지 준비 중</span></div>
        }
        <span className={`${styles.badge} ${isExpired ? styles.badgeExpired : styles.badgeActive}`}>
          {isExpired ? "종료" : "진행중"}
        </span>
      </div>

      <div className={styles.info}>
        <p className={styles.title}>{event.title}</p>
        {showDetail &&
          <p className={styles.date}>
            📅 {event.startAt} ~ {event.expireAt}
          </p>
        }
        {isExpired
          ? <p className={styles.expiredText}>종료된 이벤트입니다</p>
          : <p className={styles.more}>상세 보기 →</p>
        }
      </div>
    </article>
  );
};

export default EventCard;
