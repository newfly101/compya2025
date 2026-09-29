// domains/admin/mobile/components/adminAnalyticsTab/AnalyticsCharts.jsx
// AdminAnalyticsTab 전용 막대 렌더러 2종. 재사용처는 AdminAnalyticsTab 하나뿐이지만 "라벨/막대/
// 카운트" 모양이 기기 비율·신규/재방문·가입 전환·추이 4곳에서 반복돼(같은 모양 반복) 여기 묶는다.
// 라벨/색 상수는 analyticsChartConfig.js(컴포넌트 아닌 값만) 로 분리 — react-refresh 규칙.
import { dayBucketLabel } from "./analyticsChartConfig.js";
import styles from "./AdminAnalyticsTab.module.scss";

export const RatioBars = ({ rows }) => {
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  return (
    <div className={styles.deviceBars}>
      {rows.map((row) => (
        <div key={row.key} className={styles.deviceBarRow}>
          <span className={styles.deviceBarLabel}>{row.label}</span>
          <div className={styles.deviceBarTrack}>
            <div
              className={styles.deviceBarFill}
              style={{ width: total ? `${(row.count / total) * 100}%` : 0, background: row.color }}
            />
          </div>
          <span className={styles.deviceBarCount}>{row.count.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
};

// 추이(FN-5/6) 막대 — 일별/시간대별 공통. uniqueVisitors 기준으로 높이를 맞춘다.
export const TrendBars = ({ points, granularity }) => {
  const max = Math.max(1, ...points.map((p) => p.uniqueVisitors));
  return (
    <div className={styles.trendBars}>
      {points.map((p) => (
        <div key={p.bucket} className={styles.trendBarCol}>
          <span className={styles.trendBarValue}>{p.uniqueVisitors.toLocaleString()}</span>
          <div className={styles.trendBarTrack}>
            <div className={styles.trendBarFill} style={{ height: `${(p.uniqueVisitors / max) * 100}%` }} />
          </div>
          <span className={styles.trendBarLabel}>
            {granularity === "day" ? dayBucketLabel(p.bucket) : p.bucket}
          </span>
        </div>
      ))}
    </div>
  );
};
