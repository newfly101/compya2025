import React from "react";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import EventListVertical from "@/domains/events/mobile/containers/EventListVertical.jsx";
import { useEventList } from "@/domains/events/mobile/hooks/useEventList.js";

const EventScreen = () => {
  const {activeEvents, expiredEvents} = useEventList();
  return (
    <>
      <SectionBlock title="진행중 이벤트">
        <EventListVertical
          events={activeEvents}
          isExpired={false}
        />
      </SectionBlock>

      <SectionBlock title="종료된 이벤트">
        <EventListVertical
          events={expiredEvents}
          isExpired={true}
        />
      </SectionBlock>
    </>
  );
};

export default EventScreen;
