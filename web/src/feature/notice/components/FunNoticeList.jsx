import React from "react";
import NoticeCard from "@/feature/notice/components/cards/NoticeCard.jsx";
import funNotice from "@/data/FunNotice.js";
import styles from "@/styles/layout/CouponCard.module.scss";

const FunNoticeList = () => {
  return (
    <>
      📢 공지사항 리스트
      <div className={styles.listGrid}>
        {funNotice.map((item) => (
          <NoticeCard key={item.id} id={item.id} title={item.title} date={item.updateDate} info={item.titleName} />
        ))}
      </div>
    </>
  );
};

export default FunNoticeList;
