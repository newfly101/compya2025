import React from "react";
import styles from "./OfficialNoticeList.module.scss";
import CafeLinkCard from "@/global/ui/cafeLinkCard/CafeLinkCard.jsx";

const OfficialNoticeList = ({data}) => {
  return (
    <section aria-labelledby="cafeNotice-list-title">
      <h3 id="cafeNotice-list-title">📢 컴프야 공식 카페 공지사항</h3>
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
    </section>

  );
};

export default OfficialNoticeList;
