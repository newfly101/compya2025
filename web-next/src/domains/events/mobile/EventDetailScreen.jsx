import Link from "next/link";
import EventBody from "@/domains/events/mobile/components/eventBody/EventBody.jsx";
import { remainLabel } from "@/domains/events/mobile/eventDate.js";
import { EVENT_LIST_PATH } from "@/config/routePath.js";
import styles from "./EventDetailScreen.module.scss";

// 서버 컴포넌트 — event 는 page 가 넘긴다(없으면 page 가 notFound()).
// TODO(next-migration): GA page_view(pushEvent) 미이전
const EventDetailScreen = ({ event }) => {
  const remain = remainLabel(event.expireAt);

  return (
    <div className={styles.screen}>
      {event.imageUrl && <img className={styles.banner} src={event.imageUrl} alt="" />}

      <div className={styles.metaHeader}>
        <h1 className={styles.title}>{event.title}</h1>
        <p className={styles.period}>
          {event.startAt?.slice(0, 16)} ~ {event.expireAt?.slice(0, 16)}
          {remain && <span className={styles.remain}>{remain}</span>}
        </p>
      </div>

      <div className={styles.content}>
        {event.contentHtml ? (
          <EventBody html={event.contentHtml} />
        ) : (
          <p className={styles.noBody}>이 이벤트의 본문은 원문에서 확인할 수 있습니다.</p>
        )}

        <p className={styles.source}>출처: 컴투스프로야구 공식 카페</p>
        {event.externalLink && (
          <a className={styles.origin} href={event.externalLink} target="_blank" rel="noopener noreferrer">
            {event.contentHtml ? "원문 보기" : "원문에서 확인"}
          </a>
        )}
      </div>

      <Link href={EVENT_LIST_PATH} className={styles.backLink}>이벤트 목록으로</Link>
    </div>
  );
};

export default EventDetailScreen;
