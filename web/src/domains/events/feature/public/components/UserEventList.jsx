import React from "react";
import styles from "./UserEventList.module.scss";
import CafeLinkCard from "@/global/ui/cafeLinkCard/CafeLinkCard.jsx";
import { useEventListUser } from "@/domains/events/feature/public/hooks/useEventListUser.js";

const UserEventList = ({ limit=null, short = false }) => {
  const { events, activeEvents, expireEvents, shortEvents } = useEventListUser();

  if (events.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="event-list-title">
      <h3 id="event-list-title">
        {!short && "🎉 이벤트 리스트"}
      </h3>
      <div className={`${short ? styles.shortGrid : styles.grid}`}>
        {activeEvents.map((e) => (
          <CafeLinkCard
            key={e.id}
            title={e.title}
            image={e.imageUrl}
            dateRange={`${e.startAt} ~ ${e.expireAt}`}
            link={e.externalLink}
            short={short}
          />
        ))}
      </div>

      {!short && (
        <section aria-labelledby="expired-event-list-title">
          <h3 id="expired-event-list-title">🎉 종료된 리스트</h3>
          <div className={styles.grid}>
            {expireEvents.map((e) => (
              <CafeLinkCard
                key={e.id}
                title={e.title}
                image={e.imageUrl}
                dateRange={`${e.startAt} ~ ${e.expireAt}`}
                link={e.externalLink}
                disabled
              />
            ))}
          </div>
        </section>
      )}
    </section>

  );
};

export default UserEventList;
