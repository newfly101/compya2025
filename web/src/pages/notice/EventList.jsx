import React from "react";
import EventCard from "@/components/common/EventCard.jsx";
import styles from "@/styles/layout/EventCard.module.scss";

const EventList = ({data, short=false}) => {
  return (
    <div>{!short && "🎉 이벤트 리스트"}
      <div className={`${short ? styles.shortGrid : styles.grid}`}>
        {data.map(ev => (
          <EventCard
            key={ev.id}
            title={ev.title}
            image={ev.image}
            dateRange={ev.dateRange}
            link={ev.link}
            short={short}
          />
        ))}
      </div>
    </div>

  );
};

export default EventList;
