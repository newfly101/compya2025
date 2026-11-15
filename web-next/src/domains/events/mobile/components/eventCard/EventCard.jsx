import Link from "next/link";
import styles from "./EventCard.module.scss";
import { eventDetailPath } from "@/config/routePath.js";
import StatusBadge from "@/global/ui/badge/StatusBadge.jsx";

// TODO(next-migration): 클릭 추적(trackEventClick, data-analytics-tracked) 미이전 — 서버 컴포넌트라 onClick 없음
const EventCard = ({ event, showDetail = false, isExpired = false }) => {
  const cardClassName = `${styles.eventCard} ${isExpired ? styles.expired : ""}`;

  // 클릭 우선순위: 본문 있음(hasContent) → 상세 페이지 → 없고 externalLink 있으면 새 탭 → 둘 다 없으면 비클릭.
  const hasBody = Boolean(event.hasContent);
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
    return <Link href={eventDetailPath(event.id)} className={cardClassName}>{content}</Link>;
  }
  if (hasLink) {
    return (
      <a href={event.externalLink} target="_blank" rel="noopener noreferrer" className={cardClassName}>
        {content}
      </a>
    );
  }
  return <div className={cardClassName}>{content}</div>;
};

export default EventCard;
