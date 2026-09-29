import { useState } from "react";
import styles from "./EventCard.module.scss";
import EventDetailModal from "@/domains/events/mobile/components/eventDetailModal/EventDetailModal.jsx";
import StatusBadge from "@/global/ui/badge/StatusBadge.jsx";
import { trackEventClick } from "@/infra/analytics/events/eventEvents.js";

const EventCard = ({ event, showDetail = false, isExpired = false }) => {
  const [detailOpen, setDetailOpen] = useState(false);
  const handleClick = () => trackEventClick(event.id, event.title, event.eventType, event.externalLink);

  const cardClassName = `${styles.eventCard} ${isExpired ? styles.expired : ""}`;

  // 클릭 우선순위: 본문(contentHtml) 있으면 상세 모달 → 없고 externalLink 있으면 새 탭 → 둘 다 없으면 비클릭.
  // 모달은 별도 주소가 없어 크롤러 404 우려가 없다. 링크 없는 카드는 <a> 로 감싸지 않는다.
  const hasBody = Boolean(event.contentHtml);
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
            📅 {event.startAt?.slice(0, 16)} ~ {event.expireAt?.slice(0, 16)}
          </p>
        }
        {isExpired
          ? <p className={styles.expiredText}>종료된 이벤트입니다</p>
          : (hasBody || hasLink) ? <p className={styles.more}>상세 보기 →</p> : null
        }
      </div>
    </>
  );

  if (hasBody) {
    return (
      <>
        <button
          type="button"
          className={cardClassName}
          onClick={() => { handleClick(); setDetailOpen(true); }}
          data-analytics-tracked="content-click"
        >
          {content}
        </button>
        {detailOpen && <EventDetailModal event={event} onClose={() => setDetailOpen(false)} />}
      </>
    );
  }

  if (hasLink) {
    return (
      <a
        href={event.externalLink}
        target="_blank"
        rel="noopener noreferrer"
        className={cardClassName}
        onClick={handleClick}
        data-analytics-tracked="content-click"
      >
        {content}
      </a>
    );
  }

  return <div className={cardClassName}>{content}</div>;
};

export default EventCard;
