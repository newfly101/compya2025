import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import AdminSegmented from "@/global/ui/admin/fields/AdminSegmented.jsx";
import { TrendBars, HourlyList } from "./AnalyticsCharts.jsx";
import { fillDayRange } from "./periodMath.js";
import styles from "./AdminAnalyticsTab.module.scss";

const TREND_GRANULARITY_OPTIONS = [
  { value: "day", label: "일별" },
  { value: "hour", label: "시간대별" },
];

// 추이 카드 — 일별은 직전 같은 길이 구간과 겹쳐 그리고(dayOverlayAvailable 일 때만),
// 시간대별은 24행 목록(HourlyList)으로 그린다. 날짜 범위는 상단 공용 기간 선택을 그대로 쓴다
// (카드 자체 날짜 입력 없음).
const AnalyticsTrendCard = ({
  periodLabel,
  granularity,
  onGranularityChange,
  loading,
  error,
  onRetry,
  points,
  period,
  prevPeriod,
  previousPoints,
  dayOverlayAvailable,
}) => (
  <section id="analytics-trend" className={styles.box}>
    <div className={styles.boxHead}>
      <b className={styles.boxTitle}>추이</b>
      <span className={styles.periodLabel}>{periodLabel}</span>
    </div>
    <div className={styles.rangeRow}>
      <AdminSegmented
        options={TREND_GRANULARITY_OPTIONS}
        value={granularity}
        onChange={onGranularityChange}
        name="추이 단위"
      />
    </div>

    {loading && <StateBox status="loading" message="추이를 불러오는 중..." />}
    {!loading && error && <StateBox status="error" message={error} onRetry={onRetry} />}
    {!loading && !error && points.length === 0 && (
      <StateBox status="empty" message="집계된 추이가 없습니다." />
    )}
    {!loading && !error && points.length > 0 && granularity === "day" && (
      <TrendBars
        points={fillDayRange(points, period.from, period.to)}
        previousPoints={
          dayOverlayAvailable ? fillDayRange(previousPoints, prevPeriod.from, prevPeriod.to) : null
        }
      />
    )}
    {!loading && !error && points.length > 0 && granularity === "hour" && <HourlyList points={points} />}
  </section>
);

export default AnalyticsTrendCard;
