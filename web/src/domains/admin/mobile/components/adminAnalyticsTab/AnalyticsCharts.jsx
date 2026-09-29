// domains/admin/mobile/components/adminAnalyticsTab/AnalyticsCharts.jsx
// AdminAnalyticsTab 전용 막대/목록 렌더러 3종. "라벨/막대/카운트" 모양이 기기 비율·신규/재방문·
// 가입 전환·추이 4곳에서 반복돼(같은 모양 반복) 여기 묶는다. 라벨/색 상수는 analyticsChartConfig.js
// (컴포넌트 아닌 값만) 로 분리 — react-refresh 규칙.
import { HOURS } from "./analyticsChartConfig.js";
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

// 일별 추이 막대 — 순방문자 기준(범례로 명시). previousPoints 를 주면(직전 같은 길이 구간이
// 서비스 시작일 이후일 때만) 같은 인덱스(1일차..N일차)로 정렬해 옅은 색으로 겹쳐 그린다 —
// 두 구간의 달력 날짜가 다르므로 실제 날짜가 아니라 "며칠째"로 맞춘다.
export const TrendBars = ({ points, previousPoints }) => {
  const hasPrev = Array.isArray(previousPoints) && previousPoints.length > 0;
  const max = Math.max(
    1,
    ...points.map((p) => p.uniqueVisitors),
    ...(hasPrev ? previousPoints.map((p) => p.uniqueVisitors) : []),
  );
  return (
    <div className={styles.trendWrap}>
      <p className={styles.chartLegendText}>
        막대 기준: 순방문자
        {hasPrev && " · 진하게 이번 구간 / 옅게 직전 구간"}
      </p>
      <div className={styles.trendBars}>
        {points.map((p, i) => {
          const prev = hasPrev ? previousPoints[i] : null;
          return (
            <div key={p.bucket} className={styles.trendBarCol}>
              <span className={styles.trendBarValue}>{p.uniqueVisitors.toLocaleString()}</span>
              <div className={styles.trendBarPair}>
                <div className={styles.trendBarTrack}>
                  <div
                    className={styles.trendBarFill}
                    style={{ height: `${(p.uniqueVisitors / max) * 100}%` }}
                  />
                </div>
                {hasPrev && (
                  <div className={styles.trendBarTrack}>
                    <div
                      className={`${styles.trendBarFill} ${styles.trendBarFillPrev}`}
                      style={{ height: `${(prev.uniqueVisitors / max) * 100}%` }}
                    />
                  </div>
                )}
              </div>
              <span className={styles.trendBarLabel}>{hasPrev ? `${i + 1}일차` : dayBucketLabel(p.bucket)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// 시간대별(0~23시) 분포 — 가로 막대 그래프 대신 세로 24행 목록. 막대는 페이지뷰 기준(방문자
// 수와 별도로 숫자 열도 보여준다), 색은 기기 비율 막대의 모바일 색과 같은 토큰을 재사용한다.
// 활동이 없던 시각도 0건 행으로 남긴다(원본 API 는 활동 있는 시각만 반환).
export const HourlyList = ({ points }) => {
  const byHour = new Map(points.map((p) => [p.bucket, p]));
  const max = Math.max(1, ...points.map((p) => p.pageViews));
  return (
    <div className={styles.hourlyList}>
      <p className={styles.chartLegendText}>막대 기준: 페이지뷰</p>
      <div className={styles.hourlyHead}>
        <span className={styles.hourlyHeadHour}>시각</span>
        <span className={styles.hourlyHeadBar} aria-hidden="true" />
        <span className={styles.hourlyHeadVisitors}>방문자</span>
        <span className={styles.hourlyHeadViews}>페이지뷰</span>
      </div>
      {HOURS.map((hour) => {
        const p = byHour.get(hour);
        const visitors = p?.uniqueVisitors ?? 0;
        const views = p?.pageViews ?? 0;
        return (
          <div key={hour} className={styles.hourlyRow}>
            <span className={styles.hourlyHourLabel}>{hour}시</span>
            <div className={styles.hourlyTrack}>
              <div className={styles.hourlyFill} style={{ width: `${(views / max) * 100}%` }} />
            </div>
            <span className={styles.hourlyVisitors}>{visitors.toLocaleString()}</span>
            <span className={styles.hourlyViews}>{views.toLocaleString()}</span>
          </div>
        );
      })}
    </div>
  );
};

// 일별 bucket("yyyy-MM-dd") 은 좁은 box 폭에 맞춰 "MM.DD" 로 다듬는다(직전 구간 비교 없이
// 단독으로 볼 때만 쓰인다 — 비교가 있으면 "N일차" 표기로 대체).
const dayBucketLabel = (bucket) => {
  const [, m, d] = (bucket ?? "").split("-");
  return m && d ? `${m}.${d}` : bucket;
};
