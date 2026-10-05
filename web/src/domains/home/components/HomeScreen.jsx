import React from "react";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import styles from "./HomeScreen.module.scss";
import SupportSection from "@/domains/home/components/section/support/SupportSection.jsx";
import HeroSection from "@/domains/home/components/section/hero/HeroSection.jsx";
import QuickSection from "@/domains/home/components/section/quick/QuickSection.jsx";
import QuizSection from "@/domains/home/components/section/quiz/QuizSection.jsx";
import NoticeSection from "@/domains/home/components/section/notice/NoticeSection.jsx";
import { MOCK_TEAM_POSTS } from "@/domains/home/config/MOCK_TEAM_POSTS.js";
// community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조)
// import PostRow from "@/domains/community/mobile/components/postRow/PostRow.jsx";
// BoardTagBadge → PinnedBadge.neutral 치환 (D1=a, 2026-05-31). 재개 시 PinnedBadge 직접 사용.
import { MOCK_POSTS } from "@/domains/home/config/MOCK_POSTS.js";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import CouponListHorizontal from "@/domains/coupons/mobile/containers/public/CouponListHorizontal.jsx";
import { ROUTE_META } from "@/app/router/config/routeMeta.js";
import EventListHorizontal from "@/domains/events/mobile/containers/public/EventListHorizontal.jsx";
import { useHomeSections } from "@/domains/home/hooks/useHomeSections.js";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import MyCollectionSection from "@/domains/home/components/section/myCollection/MyCollectionSection.jsx";
import ScheduleCardSection from "@/domains/legendCollections/mobile/containers/public/ScheduleCardSection.jsx";
import { useMyCollectionSummary } from "@/domains/legendCollections/mobile/hooks/useMyCollectionSummary.js";
import { useMySkillSummary } from "@/domains/legendCollectionSkills/mobile/hooks/useMySkillSummary.js";
import AdSlot from "@/infra/ads/AdSlot.jsx";
import { AD_SLOTS } from "@/infra/ads/adConfig.js";

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
  // 홈 첫 진입 요청은 이것 하나다 — 쿠폰·이벤트·공지·퀴즈를 한 번에 받는다.
  // 섹션 하나가 서버에서 실패하면 그 섹션만 오류 표시되고 나머지는 그대로 렌더된다.
  const {
    activeCoupons, activeEvents, notices, quiz,
    loading, loaded, retry,
    couponError, eventError, noticeError, quizError,
  } = useHomeSections();

  // 내 컬렉션·주기 일정 카드가 나눠 쓰는 요약 — 로그인했을 때만 요청한다 (비로그인은 요청 0)
  const collection = useMyCollectionSummary();
  const skills = useMySkillSummary();

  // 재방문마다 스켈레톤이 깜빡이지 않게 "한 번도 못 받은 상태" 만 로딩으로 본다.
  const firstLoading = loading && !loaded;

  // 회차가 들어간 제목은 서버가 만들어 준다(QuizMapStruct.toResponse:title). FE 는 재계산하지 않고 그대로 쓴다.
  const quizSectionTitle = quiz?.title ?? "컴프야 퀴즈 정답";

  return (
    <div className={styles.homeWrapper}>

      <HeroSection />
      <QuickSection />

      {/* ── 공지사항 ── */}
      <SectionBlock
        title={`공지사항`}
        to={"/notices"}
        children={<NoticeSection notices={notices} loading={firstLoading} error={noticeError} retry={retry} />}
      />

      {/* ── 내 컬렉션 → 이번 주기 일정 — 요청 실패·해당 없음이면 각자 숨는다 ── */}
      <MyCollectionSection collection={collection} skills={skills} />
      <ScheduleCardSection summary={collection} />

      <SupportSection />

      {/* ── 퀴즈 ── */}
      <SectionBlock
        title={quizSectionTitle}
        children={<QuizSection quiz={quiz} loading={firstLoading} error={quizError} retry={retry} />}
      />

      {/* ── 최신 쿠폰 ── @@@작업 완료@@@*/}
      <SectionBlock
        title={`최신 쿠폰`}
        to={!firstLoading && !couponError && activeCoupons.length > 0 ? ROUTE_META.COUPONS.path : undefined}
      >
        {firstLoading ? (
          <Skeleton count={1} height={96} />
        ) : couponError ? (
          <StateBox status="error" onRetry={retry} compact />
        ) : activeCoupons.length === 0 ? (
          <StateBox status="empty" message="진행 중인 쿠폰이 없습니다" compact />
        ) : (
          <CouponListHorizontal coupons={activeCoupons} />
        )}
      </ SectionBlock>

      {/* ── 광고 슬롯 (쿠폰 섹션과 공지 섹션 사이) — 쿠폰이 1건 이상 렌더된 경우에만 ── */}
      {activeCoupons.length > 0 && <AdSlot slot={AD_SLOTS.HOME} />}

      {/* ── 진행 중인 이벤트 ── */}
      <SectionBlock
        title={`진행 중인 이벤트`}
        to={!firstLoading && !eventError && activeEvents.length > 0 ? ROUTE_META.EVENTS.path : undefined}
      >
        {firstLoading ? (
          <Skeleton count={1} height={96} />
        ) : eventError ? (
          <StateBox status="error" onRetry={retry} compact />
        ) : activeEvents.length === 0 ? (
          <StateBox status="empty" message="진행 중인 이벤트가 없습니다" compact />
        ) : (
          <EventListHorizontal events={activeEvents} />
        )}
      </SectionBlock>

      {/* community 도메인 정리 보류 — 2026-05-09 (기획 IA 작업 후 재개. docs/prd/domains/community.md TODO 참조) */}
      {/* 커뮤니티 인기글 */}
      {/*
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
      */}


      {/* 자유게시판 — 첫 tag 라벨을 PinnedBadge.neutral 로 title 앞에 prepend */}
      {/*
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
                tagBadge={tag && <PinnedBadge variant="neutral" label={tag.name} />}
              />
            );
          })}
        </div>
      </SectionBlock>
      */}

    </div>
  );
};

export default HomeScreen;
