import React from "react";
import styles from "@/app/page/v1/home/Home.module.scss";
import { Link } from "react-router-dom";
import EventSwiper from "@/domains/events/feature/components/EventSwiper/EventSwiper.jsx";
import CouponSwiper from "@/domains/coupons/feature/components/couponSwiper/CouponSwiper.jsx";

const HighlightSection = ({title, link, type, items=null}) => {
  return (
    <section className={styles.homeSection}>
      <div className={styles.subTitle}>
        <h2>🎉 {title}</h2>
        <span><Link to={link}>전체 보기 →</Link></span>
      </div>
      {type === "event" && <EventSwiper short={true} /> }
      {type === "coupon" && <CouponSwiper short={true} /> }

    </section>
  );
};

export default HighlightSection;
