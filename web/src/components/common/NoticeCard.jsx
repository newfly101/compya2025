import React from "react";
import styles from "@/styles/layout/NoticeCard.module.scss";

const NoticeCard = ({title, date, info}) => {
  const titleValue = title === 0 ? "메키펀 공지사항" : "공식 공지사항";
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        {titleValue}
        <span>게시일: {date}</span>
      </div>
      <div className={styles.info}>{info}</div>
    </div>
  );
};

export default NoticeCard;
