import React from "react";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import styles from "./HomeScreen.module.scss";
import HeroSection from "@/domains/home/components/section/hero/HeroSection.jsx";
import QuickSection from "@/domains/home/components/section/quick/QuickSection.jsx";
import QuizSection from "@/domains/home/components/section/quiz/QuizSection.jsx";
import NoticeSection from "@/domains/home/components/section/notice/NoticeSection.jsx";
import EventSection from "@/domains/home/components/section/event/EventSection.jsx";
import { MOCK_QUIZ } from "@/domains/home/config/MOCK_QUIZ.js";
import { MOCK_TEAM_POSTS } from "@/domains/home/config/MOCK_TEAM_POSTS.js";
import PostSection from "@/domains/home/components/section/community/PostSection.jsx";
import { MOCK_POSTS } from "@/domains/home/config/MOCK_POSTS.js";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import CouponListHorizontal from "@/domains/coupons/mobile/containers/public/CouponListHorizontal.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
import { useCouponList } from "@/domains/coupons/mobile/hooks/useCouponList.js";

const HomeScreen = () => {
  useSetTopBar({ variant: "home" });
  const {activeCoupon} = useCouponList();

  return (
    <div className={styles.homeWrapper}>

      <HeroSection />
      <QuickSection />

      {/* ── 퀴즈 ── */}
      <SectionBlock
        title={`컴프야 퀴즈 ${MOCK_QUIZ.round}회 정답`}
        children={<QuizSection />}
      />

      {/* ── 최신 쿠폰 ── @@@작업 완료@@@*/}
      <SectionBlock
        title={`최신 쿠폰`}
        to={ROUTE_META.COUPONS.path}
      >
        <CouponListHorizontal coupons={activeCoupon} />
      </ SectionBlock>

      {/* ── 공지사항 ── */}
      <SectionBlock
        title={`공지사항`}
        to={"/notices"}
        children={<NoticeSection />}
      />

      {/* ── 진행 중인 이벤트 ── */}
      <SectionBlock
        title={`진행 중인 이벤트`}
        to={"/events"}
        children={<EventSection />}
      />

      {/* 커뮤니티 인기글 */}
      <SectionBlock
        title={`커뮤니티 인기글`}
        to={"/posts/hot"}
        children={<PostSection posts={MOCK_POSTS} />}
      />


      {/* 팀 게시글 */}
      <SectionBlock
        title={`팁 게시글`}
        to={"/posts/tip"}
        children={<PostSection posts={MOCK_TEAM_POSTS} />}
      />

    </div>
  );
};

export default HomeScreen;
