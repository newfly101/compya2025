import React from "react";
import NoticeCard from "@/feature/notice/components/cards/NoticeCard.jsx";
import funNotice from "@/data/FunNotice.js";
import styles from "./FunNoticeList.module.scss";

const FunNoticeList = () => {
  return (
    <section aria-labelledby="compyafun-notice-list-title">
      <h3 id="compyafun-notice-list-title">📢 컴프야펀 공지사항</h3>
      <div className={styles.listGrid}>
        {funNotice.map((item) => (
          <NoticeCard key={item.id} id={item.id} title={item.title} date={item.updateDate} info={item.titleName} />
        ))}
      </div>
    </section>
  );
};

export default FunNoticeList;
