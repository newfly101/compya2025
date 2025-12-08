import React from "react";
import EventCard from "@/components/common/EventCard.jsx";
import styles from "@/styles/layout/EventCard.module.scss";

const EventList = ({data}) => {
  return (
    <div>🎉 이벤트 리스트
      <div className={styles.grid}>
        {data.map(ev => (
          <EventCard
            key={ev.id}
            title={ev.title}
            image={ev.image}
            dateRange={ev.dateRange}
            link={ev.link}
          />
        ))}
      </div>
    </div>

  );
};

export default EventList;
