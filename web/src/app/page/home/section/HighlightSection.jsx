import React from "react";
import styles from "@/app/page/home/Home.module.scss";
import { Link } from "react-router-dom";
import EventSwiper from "@/domains/events/feature/components/EventSwiper/EventSwiper.jsx";
import CouponSwiper from "@/domains/coupons/feature/components/couponSwiper/CouponSwiper.jsx";

const HighlightSection = ({title, link, type}) => {
  return (
    <section className={styles.highlightWrapper}>
      <div className={styles.highlightHeader}>
        <h2 className={styles.highlightTitle}>🎉 {title}</h2>

        <Link to={link} className={styles.highlightMore}>
          전체 보기 →
        </Link>
      </div>

      <div className={styles.highlightBody}>
        {type === "event" && <EventSwiper short />}
        {type === "coupon" && <CouponSwiper short />}
      </div>
    </section>
  );
};

export default HighlightSection;
