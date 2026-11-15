import ScheduleCard from "@/domains/legendCollections/mobile/components/scheduleCard/ScheduleCard.jsx";
import styles from "./ScheduleCardSection.module.scss";

const NO_LEGENDS = new Map(); // 홈은 레전드 목록을 안 받는다 — 구단 색 점은 기본색

/**
 * 홈 전용 "이번 주기 일정" 섹션 — 보유 현황 화면에는 일정 카드가 없다.
 * 로그인 + 선호 레전드가 있을 때만 보이고, 일정을 못 받았으면 통째로 숨긴다.
 * props: summary = useMyCollectionSummary() 결과
 */
const ScheduleCardSection = ({ summary }) => {
  const { schedule, preferences, meLoaded } = summary;
  if (!meLoaded || preferences.length === 0 || !schedule.loaded || schedule.error) return null;
  return (
    <div className={styles.wrap}>
      <ScheduleCard schedule={schedule} preferences={preferences} legendsById={NO_LEGENDS} />
    </div>
  );
};

export default ScheduleCardSection;
