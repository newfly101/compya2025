import styles from "./EventList.module.scss";
import EventCard from "@/features/events/components/eventCard/EventCard.jsx";

const EventListVertical = ({ events = [], isExpired = false }) => (
  <div className={styles.eventList}>
    {events.map((event) => (
      <EventCard key={event.id} event={event} showDetail isExpired={isExpired} />
    ))}
  </div>
);

export default EventListVertical;
