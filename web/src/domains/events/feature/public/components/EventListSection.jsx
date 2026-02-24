import React from "react";
import styles from "./EventListSection.module.scss";
import CafeLinkCard from "@/global/ui/cafeLinkCard/CafeLinkCard.jsx";
import { useEventListUser } from "@/domains/events/feature/public/hooks/useEventListUser.js";

const EventListSection = ({ short = false }) => {
  const { events, activeEvents, expireEvents } = useEventListUser();

  if (!events?.length) return null;

  return (
    <div className={styles.eventListSectionWrapper}>
      <section className={styles.eventListSection}>
        {!short && (
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🎉 이벤트 리스트</h2>
          </header>
        )}

        <div className={`${styles.eventListGrid} ${short ? styles.short : ""}`}>
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
      </section>

      {!short && expireEvents.length > 0 && (
        <section className={styles.eventListSection}>
          <header className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>🎉 종료된 이벤트</h2>
          </header>

          <div className={styles.eventListGrid}>
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
    </div>
  );
};

export default EventListSection;
