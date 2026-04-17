import React from "react";
import styles from "./EventList.module.scss";
import EventCard from "@/domains/events/mobile/components/eventCard/EventCard.jsx";

const EventListHorizontal = ({ events = [] }) => {
  return (
    <div className={styles.eventListScroll}>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};

export default EventListHorizontal;
