import React from "react";
import styles from "@/domains/notices/feature/components/user/cards/NoticeCard.module.scss";
import { useContentPageHeader } from "@/global/ui/contentPageHeader/index.js";

const NoticeCard = ({id, title, date, info}) => {
  const {moveTo} = useContentPageHeader();
  const titleValue = title === 0 ? "컴프야펀 공지사항" : "공식 공지사항";

  return (
    <article
      className={styles.card}
      onClick={() => moveTo(`/notice/${id}`)}
      aria-label={`${titleValue} 상세 페이지로 이동`}
      role="link"
    >
      <header className={styles.header}>
        {titleValue}
        <time>게시일: {date}</time>
      </header>
      <p className={styles.info}>{info}</p>
    </article>
  );
};

export default NoticeCard;
