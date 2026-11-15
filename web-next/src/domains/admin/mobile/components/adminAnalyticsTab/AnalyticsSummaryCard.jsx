import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AnalyticsRangePicker from "./AnalyticsRangePicker.jsx";
import DeltaBadge from "./DeltaBadge.jsx";
import { deltaOf } from "./analyticsDelta.js";
import styles from "./AdminAnalyticsTab.module.scss";

// 개요 카드 — 기간 선택기(3버튼) + 순방문자·페이지뷰·이벤트별 건수·세션당 페이지뷰,
// 전부 직전 같은 길이 구간 대비 증감 배지를 동반한다(comparisonAvailable=false 면 배지는 항상 "-").
const AnalyticsSummaryCard = ({
  periodLabel,
  summary,
  previousSummary,
  comparisonAvailable,
  eventRows,
  rangeMode,
  dateValue,
  rangeFrom,
  rangeTo,
  onModeChange,
  onDateChange,
  onRangeFromChange,
  onRangeToChange,
  onApplyRange,
  onQuickRange,
}) => {
  const delta = (current, previous) => (comparisonAvailable ? deltaOf(current, previous) : null);

  return (
    <section id="analytics-summary" className={styles.box}>
      <div className={styles.boxHead}>
        <b className={styles.boxTitle}>개요</b>
        <span className={styles.periodLabel}>{periodLabel}</span>
      </div>
      <AnalyticsRangePicker
        mode={rangeMode}
        dateValue={dateValue}
        rangeFrom={rangeFrom}
        rangeTo={rangeTo}
        onModeChange={onModeChange}
        onDateChange={onDateChange}
        onRangeFromChange={onRangeFromChange}
        onRangeToChange={onRangeToChange}
        onApplyRange={onApplyRange}
        onQuickRange={onQuickRange}
      />

      <div className={styles.summaryCards}>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>순방문자</span>
          <span className={styles.cardValue}>{summary.uniqueVisitors.toLocaleString()}</span>
          <DeltaBadge delta={delta(summary.uniqueVisitors, previousSummary?.uniqueVisitors)} />
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.cardLabel}>페이지뷰</span>
          <span className={styles.cardValue}>{summary.pageViews.toLocaleString()}</span>
          <DeltaBadge delta={delta(summary.pageViews, previousSummary?.pageViews)} />
        </div>
      </div>

      <div className={styles.section}>
        <b className={styles.sectionTitle}>이벤트 종류별 건수</b>
        <AdminTable
          columns={[
            { key: "label", label: "이벤트", align: "left" },
            { key: "count", label: "건수", width: 72, render: (row) => row.count.toLocaleString() },
            { key: "delta", label: "증감", width: 64, render: (row) => <DeltaBadge delta={row.delta} /> },
          ]}
          rows={eventRows}
          rowKey={(row) => row.type}
        />
      </div>

      <div className={styles.section}>
        <b className={styles.sectionTitle}>세션당 페이지뷰</b>
        <div className={styles.summaryCard}>
          <span className={styles.cardValue}>{summary.pageViewsPerSession ?? "-"}</span>
          <DeltaBadge delta={delta(summary.pageViewsPerSession, previousSummary?.pageViewsPerSession)} />
        </div>
      </div>
    </section>
  );
};

export default AnalyticsSummaryCard;
