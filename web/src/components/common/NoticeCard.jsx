import React from "react";
import styles from "@/styles/layout/NoticeCard.module.scss";
import { useNavigate } from "react-router-dom";

const NoticeCard = ({id, title, date, info}) => {
  const navigate = useNavigate();

  const titleValue = title === 0 ? "메키펀 공지사항" : "공식 공지사항";

  const handleClick = () => {
    navigate(`/notice/${id}`);
  }

  return (
    <div className={styles.card} onClick={handleClick}>
      <div className={styles.header}>
        {titleValue}
        <span>게시일: {date}</span>
      </div>
      <div className={styles.info}>{info}</div>
    </div>
  );
};

export default NoticeCard;
