import React from "react";
import { Link } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import styles from "./HomeScreen.module.scss";
import HeroSection from "@/domains/home/components/section/hero/HeroSection.jsx";
import QuickSection from "@/domains/home/components/section/quick/QuickSection.jsx";
import QuizSection from "@/domains/home/components/section/quiz/QuizSection.jsx";
import CouponSection from "@/domains/home/components/section/coupon/CouponSection.jsx";
import NoticeSection from "@/domains/home/components/section/notice/NoticeSection.jsx";
import EventSection from "@/domains/home/components/section/event/EventSection.jsx";
import { MOCK_QUIZ } from "@/domains/home/config/MOCK_QUIZ.js";
import { MOCK_TEAM_POSTS } from "@/domains/home/config/MOCK_TEAM_POSTS.js";
import PostSection from "@/domains/home/components/section/community/PostSection.jsx";
import { MOCK_POSTS } from "@/domains/home/config/MOCK_POSTS.js";

const HomeScreen = () => {
  useSetTopBar({ variant: "home" });

  return (
    <div className={styles.homeWrapper}>

      <HeroSection />
      <QuickSection />

      {/* ── 퀴즈 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.accent}>|</span>
            컴프야 퀴즈 {MOCK_QUIZ.round}회 정답
          </h2>
        </div>
        <QuizSection />
      </section>


      {/* ── 최신 쿠폰 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.accent}>|</span>
            최신 쿠폰
          </h2>
          <Link to="/coupons" className={styles.more}>전체 보기 →</Link>
        </div>
        <CouponSection />
      </section>


      {/* ── 공지사항 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.accent}>|</span>
            공지사항
          </h2>
          <Link to="/notices" className={styles.more}>전체 보기 →</Link>
        </div>
        <NoticeSection />
      </section>


      {/* ── 진행 중인 이벤트 ── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.accent}>|</span>
            진행 중인 이벤트
          </h2>
          <Link to="/events" className={styles.more}>전체 보기 →</Link>
        </div>
        <EventSection />
      </section>


      {/* 커뮤니티 인기글 */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.accent}>|</span>커뮤니티 인기글
          </h2>
          <Link to="/posts/hot" className={styles.more}>전체 보기 →</Link>
        </div>
        <PostSection posts={MOCK_POSTS} />
      </section>


      {/* 팀 게시글 */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>
            <span className={styles.accent}>|</span>팀 게시글
          </h2>
          <Link to="/posts/team" className={styles.more}>전체 보기 →</Link>
        </div>
        <PostSection posts={MOCK_TEAM_POSTS} />
      </section>

    </div>
  );
};

export default HomeScreen;
