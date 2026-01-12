import React from "react";
import styles from "@/shared/ui/cafeLinkCard/CafeLinkCard.module.scss";
import CafeLinkCard from "@/shared/ui/cafeLinkCard/CafeLinkCard.jsx";

const OfficialNoticeList = ({data}) => {
  return (
    <div>
      <h3>📢 컴프야 공식 카페 공지사항</h3>
      <div className={styles.grid}>
        {data.map((item) => (
          <CafeLinkCard
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
