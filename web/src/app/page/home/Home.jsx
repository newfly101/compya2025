import React from "react";
import styles from "@/app/page/home/Home.module.scss";
import HeroSection from "@/app/page/home/section/HeroSection.jsx";
import QuickNavSection from "@/app/page/home/section/QuickNavSection.jsx";
import SpotlightSection from "@/app/page/home/section/SpotlightSection.jsx";
import HighlightSection from "@/app/page/home/section/HighlightSection.jsx";
import { useHomeData } from "@/app/page/home/hooks/useHomeData.js";

const Home = () => {
  const { quizImg, quizTitle } = useHomeData();

  return (
    <div className={styles.homeWrapper}>

      <HeroSection />

      <QuickNavSection />

      {quizImg && (
        <SpotlightSection
          title={quizTitle ?? "🎉 컴프야 퀴즈 이벤트 정답"}
          image={quizImg}
        />
      )}

      <HighlightSection
        title="최신 이벤트"
        link="/notice/events"
        // items={events}
        type="event"
      />

      <HighlightSection
        title="최신 쿠폰"
        link="/notice/coupons"
        // items={coupons}
        type="coupon"
      />

    </div>
  );
};

export default Home;
