import styles from "./HomeScreen.module.scss";
import HeroSection from "./components/hero/HeroSection.jsx";
import QuickSection from "./components/quick/QuickSection.jsx";
import NoticeSection from "./components/notice/NoticeSection.jsx";
import QuizSection from "./components/quiz/QuizSection.jsx";
import SupportSection from "./components/support/SupportSection.jsx";
import MyCollectionSection from "./components/myCollection/MyCollectionSection.jsx";
import HomeSchedule from "./HomeSchedule.jsx";
import { CouponRow, EventRow } from "./HomeCardRows.jsx";
import SectionBlock from "@/components/section/SectionBlock.jsx";
import StateBox from "@/components/stateBox/StateBox.jsx";
import { ROUTE_PATHS } from "@/lib/routePath.js";
import { formatNow } from "@/lib/utils/dateUtils.js";

// TODO(next-migration): AdSlot(HOME, 쿠폰 1건 이상일 때 쿠폰·이벤트 섹션 사이) · GA 로그 미이전

// 서버 컴포넌트 — 공개 4섹션(공지·퀴즈·쿠폰·이벤트)은 서버 렌더(ISR 5분), 바로가기·내 컬렉션·일정은 브라우저(CSR).
// 진행중/종료 판정(KST)은 여기서 한 번 계산한다 — 클라이언트에서 new Date() 로 다시 계산하지 않는다.
const HomeScreen = ({ coupons, events, notices, quiz }) => {
  const now = formatNow();
  const activeCoupons = coupons.filter((c) => c.expireAt >= now);
  const activeEvents = events.filter((e) => e.expireAt >= now);

  return (
    <div className={styles.homeWrapper}>
      <HeroSection />
      <QuickSection />

      <SectionBlock title="공지사항" to={ROUTE_PATHS.notices}>
        <NoticeSection notices={notices} />
      </SectionBlock>

      <MyCollectionSection />
      <HomeSchedule />

      <SupportSection />

      {/* 회차가 들어간 제목은 서버가 만들어 준다 — FE 는 재계산하지 않는다 */}
      <SectionBlock title={quiz?.title ?? "컴프야 퀴즈 정답"}>
        <QuizSection quiz={quiz} />
      </SectionBlock>

      <SectionBlock title="최신 쿠폰" to={activeCoupons.length > 0 ? ROUTE_PATHS.coupons : undefined}>
        {activeCoupons.length === 0 ? (
          <StateBox status="empty" message="진행 중인 쿠폰이 없습니다" compact />
        ) : (
          <CouponRow coupons={activeCoupons} />
        )}
      </SectionBlock>

      <SectionBlock title="진행 중인 이벤트" to={activeEvents.length > 0 ? ROUTE_PATHS.events : undefined}>
        {activeEvents.length === 0 ? (
          <StateBox status="empty" message="진행 중인 이벤트가 없습니다" compact />
        ) : (
          <EventRow events={activeEvents} />
        )}
      </SectionBlock>
    </div>
  );
};

export default HomeScreen;
