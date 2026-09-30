import AdminSegmented from "@/global/ui/admin/fields/AdminSegmented.jsx";
import AdminDateRange from "@/global/ui/admin/fields/AdminDateRange.jsx";
import { getTodayKst } from "@/global/utils/datetime/dateUtils.js";
import styles from "./AdminAnalyticsTab.module.scss";

const MODE_OPTIONS = [
  { value: "TODAY", label: "오늘" },
  { value: "DATE", label: "특정 일자" },
  { value: "RANGE", label: "기간" },
];

// 통계 탭 전체가 따르는 단일 기간 선택 — 개요·상위 경로·추이·방문자 구성·외부 유입 5개 카드가
// 전부 이 선택을 그대로 쓴다(카드별 별도 날짜 상태 없음). "특정 일자"는 고른 즉시 조회하고,
// "기간"은 빠른 선택(7일·30일) 은 즉시, 직접 입력은 "조회" 버튼으로 확정한다.
const AnalyticsRangePicker = ({
  mode,
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
  return (
    <div className={styles.rangePicker}>
      <div className={styles.rangeRow}>
        <AdminSegmented options={MODE_OPTIONS} value={mode} onChange={onModeChange} name="통계 기간" />
      </div>

      {mode === "DATE" && (
        <div className={styles.customRow}>
          <input
            type="date"
            className={styles.aggregateInput}
            value={dateValue}
            max={getTodayKst()}
            onChange={(e) => onDateChange(e.target.value)}
          />
        </div>
      )}

      {mode === "RANGE" && (
        <div className={styles.customRow}>
          <div className={styles.quickRow}>
            <button type="button" className={styles.quickButton} onClick={() => onQuickRange(7)}>
              7일
            </button>
            <button type="button" className={styles.quickButton} onClick={() => onQuickRange(30)}>
              30일
            </button>
          </div>
          <AdminDateRange
            start={rangeFrom}
            end={rangeTo}
            onStartChange={onRangeFromChange}
            onEndChange={onRangeToChange}
            max={getTodayKst()}
            name="analyticsRange"
          />
          <button type="button" className={styles.applyButton} onClick={onApplyRange}>
            조회
          </button>
        </div>
      )}
    </div>
  );
};

export default AnalyticsRangePicker;
