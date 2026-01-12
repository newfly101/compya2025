import React from "react";
import styles from "@/styles/layout/EventCard.module.scss";
import EventCard from "@/components/common/EventCard.jsx";

const OfficialNoticeList = ({data}) => {
  return (
    <div>
      <h3>📢 컴프야 공식 카페 공지사항</h3>
      <div className={styles.grid}>
        {data.map((item) => (
          <EventCard
            key={item.id}
            title={item.title}
            image={item.image}
            link={item.link}
          />
        ))}
      </div>
    </div>

  );
};

export default OfficialNoticeList;
