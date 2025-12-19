import React from "react";
import NoticeCard from "@/components/common/NoticeCard.jsx";
import funNotice from "@/data/FunNotice.js";

const FunNoticeList = () => {
  return (
    <div>📢 공지사항 리스트
      {funNotice.map((item) => (
        <NoticeCard id={item.id} title={item.title} date={item.updateDate} info={item.titleName} />
      ))}
    </div>
  );
};

export default FunNoticeList;
