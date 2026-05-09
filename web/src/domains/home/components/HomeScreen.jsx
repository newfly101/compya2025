import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import styles from "./HomeScreen.module.scss";
import HeroSection from "@/domains/home/components/section/hero/HeroSection.jsx";
import QuickSection from "@/domains/home/components/section/quick/QuickSection.jsx";
import QuizSection from "@/domains/home/components/section/quiz/QuizSection.jsx";
import NoticeSection from "@/domains/home/components/section/notice/NoticeSection.jsx";
import { MOCK_TEAM_POSTS } from "@/domains/home/config/MOCK_TEAM_POSTS.js";
import PostRow from "@/domains/community/mobile/components/postRow/PostRow.jsx";
import BoardTagBadge from "@/domains/community/mobile/components/boardTagBadge/BoardTagBadge.jsx";
import { MOCK_POSTS } from "@/domains/home/config/MOCK_POSTS.js";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import CouponListHorizontal from "@/domains/coupons/mobile/containers/public/CouponListHorizontal.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
import { useCouponList } from "@/domains/coupons/mobile/hooks/useCouponList.js";
import EventListHorizontal from "@/domains/events/mobile/containers/public/EventListHorizontal.jsx";
import { useEventList } from "@/domains/events/mobile/hooks/useEventList.js";
import { requestLatestQuizAnswer } from "@/domains/quiz/store/public/thunks.js";

const HOME_PREVIEW_LIMIT = 3;

// home의 mock post → community PostRow shape 변환 (badge 데이터는 그대로 통과)
const toPostRowItem = (post) => ({
  id: post.id,
  title: post.title,
  badge: post.tags?.[0]?.code ?? null,
  author: post.authorName,
  timeText: post.createdAt,
  views: post.viewCount,
  comments: post.commentCount,
  thumbnail: null,
});

const HomeScreen = () => {
  useSetTopBar({ variant: "home" });
  const dispatch = useDispatch();
  const { activeCoupon } = useCouponList();
  const { activeEvents } = useEventList();
  const latestQuiz = useSelector((state) => state.quiz?.latest) ?? null;

  useEffect(() => {
    dispatch(requestLatestQuizAnswer());
  }, [dispatch]);

  const quizSectionTitle =
    latestQuiz?.title ??
    (latestQuiz?.round
      ? `🎉컴프야 퀴즈 이벤트 ${latestQuiz.round}회 정답`
      : "컴프야 퀴즈 정답");

  return (
    <div className={styles.homeWrapper}>

      <HeroSection />
      <QuickSection />

      {/* ── 퀴즈 ── */}
      <SectionBlock
        title={quizSectionTitle}
        children={<QuizSection quiz={latestQuiz} />}
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
        to={ROUTE_META.EVENTS.path}
      >
        <EventListHorizontal events={activeEvents} />
      </SectionBlock>

      {/* 커뮤니티 인기글 */}
      <SectionBlock
        title="커뮤니티 인기글"
        to="/community?category=trending"
      >
        <div className={styles.postRowList}>
          {MOCK_POSTS.slice(0, HOME_PREVIEW_LIMIT).map((p) => (
            <PostRow key={p.id} post={toPostRowItem(p)} />
          ))}
        </div>
      </SectionBlock>


      {/* 자유게시판 — 첫 tag 라벨을 BoardTagBadge로 title 앞에 prepend */}
      <SectionBlock
        title="자유게시판"
        to="/community?category=free"
      >
        <div className={styles.postRowList}>
          {MOCK_TEAM_POSTS.slice(0, HOME_PREVIEW_LIMIT).map((p) => {
            const tag = p.tags?.[0];
            return (
              <PostRow
                key={p.id}
                post={{ ...toPostRowItem(p), badge: null }}
                tagBadge={tag && <BoardTagBadge label={tag.name} />}
              />
            );
          })}
        </div>
      </SectionBlock>

    </div>
  );
};

export default HomeScreen;
