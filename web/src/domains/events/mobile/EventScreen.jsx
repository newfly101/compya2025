import React from "react";
import SectionBlock from "@/global/ui/mobile/section/SectionBlock.jsx";
import EventListVertical from "@/domains/events/mobile/containers/public/EventListVertical.jsx";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import { useEventList } from "@/domains/events/mobile/hooks/useEventList.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import AdSlot from "@/infra/ads/AdSlot.jsx";
import { AD_SLOTS } from "@/infra/ads/adConfig.js";

// 실패를 "0건"과 구분해서 보여준다 — 조회 실패를 빈 목록처럼 보여주면 안 된다.
const renderSection = (list, isExpired, emptyMessage, { loading, error, retry }) => {
  if (loading) return <StateBox status="loading" compact />;
  if (error) return <StateBox status="error" onRetry={retry} compact />;
  if (list.length === 0) return <StateBox status="empty" message={emptyMessage} compact />;
  return <EventListVertical events={list} isExpired={isExpired} />;
};

const EventScreen = () => {
  useDomainTopBar("이벤트");
  const { activeEvents, expiredEvents, loading, error, retry } = useEventList();
  const state = { loading, error, retry };
  const hasContent = !loading && !error && (activeEvents.length > 0 || expiredEvents.length > 0);

  return (
    <>
      <SectionBlock title="진행중 이벤트">
        {renderSection(activeEvents, false, "진행 중인 이벤트가 없습니다", state)}
      </SectionBlock>

      <SectionBlock title="종료된 이벤트">
        {renderSection(expiredEvents, true, "종료된 이벤트가 없습니다", state)}
      </SectionBlock>

      {/* 목록 하단 광고 — 데이터가 1건 이상 렌더된 경우에만 */}
      {hasContent && <AdSlot slot={AD_SLOTS.EVENTS_LIST} />}
    </>
  );
};

export default EventScreen;
