import React from "react";
import styles from "@/app/page/home/Home.module.scss";
import HeroSection from "@/app/page/home/section/HeroSection.jsx";
import QuickNavSection from "@/app/page/home/section/QuickNavSection.jsx";
import SpotlightSection from "@/app/page/home/section/SpotlightSection.jsx";
import HighlightSection from "@/app/page/home/section/HighlightSection.jsx";
import { useHomeData } from "@/app/page/home/hooks/useHomeData.js";

const Home = () => {
  const {reservationImg, quizImg } = useHomeData();

  return (
    <div className={styles.homeWrapper}>

      <HeroSection />

      <QuickNavSection />

      <SpotlightSection
        title="🎉 컴프야2026 사전 예약"
        image={reservationImg}
        link="https://event.withhive.com/ci/minisite/main/cpb2026pre/ko?r=p1&fcode=ST27METIdG"
        clickable
      />

      <SpotlightSection
        title="🎉 컴프야 퀴즈 이벤트 877회 정답"
        image={quizImg}
      />

      <HighlightSection
        title="최신 이벤트"
        link="/notice?tab=event"
        // items={events}
        type="event"
      />

      <HighlightSection
        title="최신 쿠폰"
        link="/notice?tab=coupons"
        // items={coupons}
        type="coupon"
      />

    </div>
  );
};

export default Home;
