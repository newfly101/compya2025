import React from "react";
import styles from "./EventList.module.scss";
import EventCard from "@/domains/events/mobile/components/eventCard/EventCard.jsx";

const EventListVertical = ({ events = [], isExpired = false }) => {
  return (
    <div className={styles.eventList}>
      {events.map(event => (
        <EventCard key={event.id} event={event} showDetail={true} isExpired={isExpired}/>
      ))}
    </div>
  );
};

export default EventListVertical;
