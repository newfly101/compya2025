"use client";
import ScheduleCardSection from "@/features/legendCollections/components/ScheduleCardSection.jsx";
import { useMyCollectionSummary } from "@/features/legendCollections/hooks/useMyCollectionSummary.js";

// 이번 주기 일정 — 로그인 + 선호 레전드가 있을 때만 나타난다(없으면 null). 서버 렌더 시점에는 비어 있어 밀림도 없다.
const HomeSchedule = () => <ScheduleCardSection summary={useMyCollectionSummary()} />;

export default HomeSchedule;
