import styles from "./EventCard.module.scss";
import StatusBadge from "@/global/ui/badge/StatusBadge.jsx";
import { trackEventClick } from "@/infra/analytics/events/eventEvents.js";

const EventCard = ({ event, showDetail = false, isExpired = false }) => {
  const handleClick = () => trackEventClick(event.id, event.title, event.eventType);

  const cardClassName = `${styles.eventCard} ${isExpired ? styles.expired : ""}`;

  // external_link 는 nullable 이라 링크 없는 이벤트가 등록될 수 있다.
  // 그 경우 이동할 상세 화면이 아직 없으므로 링크로 감싸지 않는다 —
  // <a> 로 두면 크롤러가 따라가 404 를 만난다.
  const hasLink = Boolean(event.externalLink);

  const content = (
    <>
      <div className={styles.thumb}>
        {event.imageUrl
          ? <img src={event.imageUrl} alt="" />
          : <div className={styles.thumbEmpty}><span>이미지 준비 중</span></div>
        }
        <span className={styles.badgeSlot}>
          {isExpired
            ? <StatusBadge variant="expired" label="종료" />
            : <StatusBadge variant="active" label="진행중" />
          }
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
          : hasLink ? <p className={styles.more}>상세 보기 →</p> : null
        }
      </div>
    </>
  );

  if (hasLink) {
    return (
      <a
        href={event.externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClassName}
        onClick={handleClick}
      >
        {content}
      </a>
    );
  }

  return <div className={cardClassName}>{content}</div>;
};

export default EventCard;
