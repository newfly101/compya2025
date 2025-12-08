import React from "react";
import styles from "@/styles/layout/EventCard.module.scss";

const EventCard = ({ title, dateRange, image, link }) => {
  return (
    <div className={styles.card}>
      <div className={styles.thumbnail}>
        <img src={image} alt={title} />
        <span className={styles.badge}>이벤트 기간</span>
      </div>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.date}>{dateRange}</p>
        <a href={link} className={styles.detail} target="_blank" rel="noreferrer">
          상세 정보 →
        </a>
      </div>
    </div>
  );
};


export default EventCard;
