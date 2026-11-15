import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import GuideAccordion from "@/global/ui/guideAccordion/GuideAccordion.jsx";
import { GUIDES_BY_SLUG } from "@/domains/guides/content/index.js";
import EventListVertical from "@/domains/events/mobile/containers/public/EventListVertical.jsx";
import { formatNow } from "@/global/utils/dateUtils.js";

// 서버 컴포넌트 — 로딩·오류는 Next(loading/error)가 맡고 여기선 빈 상태만 본다.
// TODO(next-migration): AdSlot(EVENTS_LIST) 미이전 · 자정 경과 재분류(useKstDayTick) 대신 revalidate 300 에 의존
const renderSection = (list, isExpired, emptyMessage) =>
  list.length === 0
    ? <StateBox status="empty" message={emptyMessage} compact />
    : <EventListVertical events={list} isExpired={isExpired} />;

const EventScreen = ({ events }) => {
  const now = formatNow();
  return (
    <>
      <GuideAccordion guide={GUIDES_BY_SLUG["event-guide"]} />
      <SectionBlock title="진행중 이벤트">
        {renderSection(events.filter((e) => e.expireAt >= now), false, "진행 중인 이벤트가 없습니다")}
      </SectionBlock>
      <SectionBlock title="종료된 이벤트">
        {renderSection(events.filter((e) => e.expireAt < now), true, "종료된 이벤트가 없습니다")}
      </SectionBlock>
    </>
  );
};

export default EventScreen;
