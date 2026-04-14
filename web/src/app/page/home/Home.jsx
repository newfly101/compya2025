// src/app/page/home/Home.jsx
import React from "react";
import { useHomeData } from "@/app/page/home/hooks/useHomeData.js";

import TopBar        from "@/domains/mobile/components/topBar/TopBar.jsx";
import PageLayout    from "@/domains/mobile/components/pageLayout/PageLayout.jsx";
import SectionHeader from "@/domains/mobile/components/sectionHeader/SectionHeader.jsx";

import HeroSection      from "@/app/page/home/section/HeroSection.jsx";
import QuickNav         from "@/domains/mobile/components/quickNav/QuickNav.jsx";
import SpotlightSection from "@/app/page/home/section/SpotlightSection.jsx";
import CouponCard       from "@/domains/mobile/components/couponCard/CouponCard.jsx";
import NoticeItem       from "@/domains/mobile/components/noticeItem/NoticeItem.jsx";
import EventCard        from "@/domains/mobile/components/eventCard/EventCard.jsx";
import FullEventCard    from "@/domains/mobile/components/fulleventcard/Fulleventcard.jsx";
import CommunityItem    from "@/domains/mobile/components/communityItem/CommunityItem.jsx";
import TipCard          from "@/domains/mobile/components/tipCard/TipCard.jsx";

const Home = () => {
  const {
    quizImg,
    quizTitle,
    coupons,
    notices,
    events,
    fullEvents,
    communityPosts,
    tips,
  } = useHomeData();

  return (
    <>
      <TopBar />
      <PageLayout>

        <HeroSection />

        <QuickNav />

        {quizImg && (
          <SpotlightSection
            title={quizTitle ?? "컴프야 퀴즈 정답"}
            image={quizImg}
          />
        )}

        {/* 최신 쿠폰 */}
        <SectionHeader title="최신 쿠폰" link="/notice/coupons" />
        {coupons?.map((coupon) => (
          <CouponCard key={coupon.id} {...coupon} />
        ))}

        {/* 공지사항 */}
        <SectionHeader title="공지사항" link="/notice" />
        {notices?.map((notice) => (
          <NoticeItem key={notice.id} {...notice} />
        ))}

        {/* 진행 중인 이벤트 */}
        <SectionHeader title="진행 중인 이벤트" link="/notice/events" />
        {fullEvents?.map((event) => (
          <FullEventCard key={event.id} {...event} />
        ))}
        {events?.map((event) => (
          <EventCard key={event.id} {...event} />
        ))}

        {/* 커뮤니티 인기글 */}
        <SectionHeader title="커뮤니티 인기글" link="/community" />
        {communityPosts?.map((post) => (
          <CommunityItem key={post.id} {...post} />
        ))}

        {/* 팁 게시글 */}
        <SectionHeader title="팁 게시글" link="/tips" />
        {tips?.map((tip) => (
          <TipCard key={tip.id} {...tip} />
        ))}

      </PageLayout>
    </>
  );
};

export default Home;
