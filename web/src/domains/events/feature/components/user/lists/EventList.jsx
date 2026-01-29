import React, { useMemo } from "react";
import styles from "./EventList.module.scss";
import { parseDate } from "@/global/utils/parseDate.js";
import { sortCoupons } from "@/global/utils/sortCoupons.js";
import CafeLinkCard from "@/global/ui/cafeLinkCard/CafeLinkCard.jsx";

const EventList = ({ data, limit, short = false }) => {
  const now = new Date();

  const { activeEvents, expiredEvents } = useMemo(() => {
    const sorted = sortCoupons(data);

    const active = [];
    const expired = [];

    sorted.forEach((item) => {
      if (parseDate(item.expireDate) < now) {
        expired.push(item);
      } else {
        active.push(item);
      }
    });

    return {
      activeEvents: limit ? active.slice(0, limit) : active,
      expiredEvents: expired,
    };
  }, [data, limit, now]);

  return (
    <section aria-labelledby="event-list-title">
      <h3 id="event-list-title">
        {!short && "🎉 이벤트 리스트"}
      </h3>
      <div className={`${short ? styles.shortGrid : styles.grid}`}>
        {activeEvents.map((item) => (
          <CafeLinkCard
            key={item.id}
            title={item.title}
            image={item.image}
            dateRange={item.dateRange}
            link={item.link}
            short={short}
          />
        ))}
      </div>

      {!short && expiredEvents.length > 0 && (
        <section aria-labelledby="expired-event-list-title">
          <h3 id="expired-event-list-title">🎉 종료된 리스트</h3>
          <div className={styles.grid}>
            {expiredEvents.map((item) => (
              <CafeLinkCard
                key={item.id}
                title={item.title}
                image={item.image}
                dateRange={item.dateRange}
                link={item.link}
                disabled
              />
            ))}
          </div>
        </section>
      )}
    </section>

  );
};

export default EventList;
