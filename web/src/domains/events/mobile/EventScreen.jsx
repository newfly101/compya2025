import React from "react";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import EventListVertical from "@/domains/events/mobile/containers/public/EventListVertical.jsx";
import { useEventList } from "@/domains/events/mobile/hooks/useEventList.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";

const EventScreen = () => {
  useDomainTopBar("이벤트");
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
