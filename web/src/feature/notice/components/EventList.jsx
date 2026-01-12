import React, { useMemo } from "react";
import EventCard from "@/components/common/EventCard.jsx";
import styles from "@/styles/layout/EventCard.module.scss";
import { parseDate } from "@/utils/parseDate.js";
import { sortCoupons } from "@/utils/sortCoupons.js";

const EventList = ({ data, limit, short = false }) => {
  const sorted = sortCoupons(data);
  const now = new Date();

  const finalList = limit ? sorted.slice(0, limit) : sorted;

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
  }, [data, limit]);

  return (
    <div className={styles.eventSection}>
      <h3>{!short && "🎉 이벤트 리스트"}</h3>
      <div className={`${short ? styles.shortGrid : styles.grid}`}>
        {activeEvents.map((item) => (
          <EventCard
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
        <>
          <h3>🎉 종료된 리스트</h3>
          <div className={styles.grid}>
            {expiredEvents.map((item) => (
              <EventCard
                key={item.id}
                title={item.title}
                image={item.image}
                dateRange={item.dateRange}
                link={item.link}
                disabled
              />
            ))}
          </div>
        </>
      )}
    </div>

  );
};

export default EventList;
