import styles from "@/styles/pages/Home.module.scss";
import coupons from "@/data/Coupon.js";
import CouponList from "@/pages/notice/CouponList.jsx";
import { Link, useNavigate } from "react-router-dom";
import EventList from "@/pages/notice/EventList.jsx";
import events from "@/data/Events.js";
import React from "react";

const Home = () => {
  const navigate = useNavigate();

  const handleClick = (url) => {
    navigate(`/${url}`);
  }
  return (
    <div className={styles.homePage}>

      {/* Hero Section (상단 그래디언트 영역) */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>컴프야펀</h1>
          <p>컴투스프로야구2025 유저를 위한 종합 정보 사이트</p>
        </div>
      </section>

      {/* 기능 섹션 */}
      <section className={styles.features}>
        <div className={styles.grid}>
          {/*<div className={styles.card}>데미지 계산기</div>*/}
          {/*<div className={styles.card}>성장 가이드</div>*/}
          {/*<div className={styles.card}>덱 구성 가이드</div>*/}
          {/*<div className={styles.card}>플레이 가이드</div>*/}
          {/*<div className={styles.card}>선수 카드 도감</div>*/}
          <div className={styles.card} onClick={() => handleClick("simulate")}>고스변 시뮬레이터</div>
        </div>
      </section>

      {/* 최신 이벤트 */}
      <section className={styles.homeSection}>
        <div className={styles.subTitle}>
          <h2>🎉 최신 이벤트</h2>
          <span><Link to="/notice?tab=event">전체 보기 →</Link></span>
        </div>
        <EventList data={events} limit={3} short={true}/>
      </section>

      {/* 최신 쿠폰 */}
      <section className={styles.homeSection}>
        <div className={styles.subTitle}>
          <h2>🎁 최신 쿠폰</h2>
          <span><Link to="/notice?tab=coupons">전체 보기 →</Link></span>
        </div>
        <CouponList data={coupons} limit={3} short={true}/>
      </section>

    </div>
  );
}

export default Home;
