import styles from "./EventSection.module.scss";

const MOCK_EVENTS = [
  { id: 1, title: "리그 버닝 이벤트",   thumb: null, endsAt: "~04.05 23:59", status: "진행중" },
  { id: 2, title: "가위바위보 이벤트",   thumb: null, endsAt: "~04.15 23:59", status: "진행중" },
];

const EventSection = () => {
  return (
    <div className={styles.scroll}>
      {MOCK_EVENTS.map((event) => (
        <div key={event.id} className={styles.card}>
          <div className={styles.thumb}>
            {event.thumb
              ? <img src={event.thumb} alt={event.title} />
              : <span className={styles.thumbEmpty}>🎪</span>
            }
            <span className={styles.badge}>{event.status}</span>
          </div>
          <p className={styles.title}>{event.title}</p>
          <p className={styles.date}>{event.endsAt}</p>
        </div>
      ))}
    </div>
  );
};

export default EventSection;
