import styles from "./EventSection.module.scss";

export const MOCK_EVENTS = [
  {
    id: 1,
    eventType: "INTERNAL",
    title: "리그 버닝 이벤트",
    startAt: "2026-03-18 00:00",
    expireAt: "2026-04-05 23:59",
    imageUrl: null,
    externalLink: null,
    visible: true,
  },
  {
    id: 2,
    eventType: "INTERNAL",
    title: "추억의 가위바위보 이벤트",
    startAt: "2026-03-23 00:00",
    expireAt: "2026-04-15 23:59",
    imageUrl: null,
    externalLink: null,
    visible: true,
  },
  {
    id: 3,
    eventType: "OFFICIAL",
    title: "대굴대굴 주사위 이벤트",
    startAt: "2026-03-02 00:00",
    expireAt: "2026-03-22 23:59",
    imageUrl: null,
    externalLink: "https://cafe.naver.com/...",
    visible: true,
  },
]

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
