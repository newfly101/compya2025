import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import AdminSegmented from "@/global/ui/admin/fields/AdminSegmented.jsx";
import AdminDateRange from "@/global/ui/admin/fields/AdminDateRange.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import "@/global/ui/admin/admin.tokens.scss";
import {
  requestAdminAnalyticsSummary,
  requestAdminAnalyticsTrend,
  requestAdminAnalyticsAggregate,
} from "@/domains/admin/store/admin/thunks.js";
import { setAdminAnalyticsRange } from "@/domains/admin/store/slices.js";
import {
  getYesterdayKst,
  getTodayKst,
  getKstDateOffset,
  getKstMonthsAgo,
} from "@/global/utils/datetime/dateUtils.js";
import styles from "./AdminAnalyticsTab.module.scss";
import {
  EVENT_TYPE_LABEL,
  DEVICE_TYPE_LABEL,
  DEVICE_TYPE_COLOR,
  VISITOR_TYPE_LABEL,
  VISITOR_TYPE_COLOR,
  SIGNUP_LABEL,
  SIGNUP_COLOR,
  countRows,
} from "./analyticsChartConfig.js";
import { RatioBars, TrendBars } from "./AnalyticsCharts.jsx";

const RANGE_OPTIONS = [
  { value: "TODAY", label: "오늘" },
  { value: "WEEK", label: "7일" },
  { value: "MONTH", label: "30일" },
  { value: "CUSTOM", label: "기간" },
];

const TREND_GRANULARITY_OPTIONS = [
  { value: "day", label: "일별" },
  { value: "hour", label: "시간대별" },
];

// 어드민 셸의 "통계" 탭 패널. AdminCacheSyncTab 과 같은 상태분기 패턴(!loading && error,
// !loading && !error && 데이터 없음)을 따른다. range 는 캐시하지 않고 바뀔 때마다 새로 조회한다 —
// 탭을 옮겨 다시 돌아왔을 때는(재마운트) 이미 받은 summary 를 그대로 보여준다(재요청 없음).
// FN-7: 개요/상위경로/추이/방문자구성/외부유입 5개 box 를 가로 스크롤로 배치, 수동 재집계 CTA 만
// 스크롤 밖(맨 아래)에 남긴다.
export default function AdminAnalyticsTab() {
  const dispatch = useDispatch();
  const {
    summary,
    loading,
    error,
    range,
    trend,
    trendLoading,
    trendError,
    mutateLoading,
    mutateError,
  } = useSelector((s) => s.adminAnalytics);

  const [aggregateDate, setAggregateDate] = useState(getYesterdayKst());
  const [customFrom, setCustomFrom] = useState(getKstDateOffset(-6));
  const [customTo, setCustomTo] = useState(getTodayKst());
  const [trendGranularity, setTrendGranularity] = useState("day");
  const [trendFrom, setTrendFrom] = useState(getKstDateOffset(-6));
  const [trendTo, setTrendTo] = useState(getTodayKst());

  useEffect(() => {
    if (!summary && !loading) dispatch(requestAdminAnalyticsSummary({ range }));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 시 1회만, range 변경은 handleRangeChange 가 직접 처리
  }, []);

  useEffect(() => {
    if (trend.day.length === 0 && !trendLoading) {
      dispatch(requestAdminAnalyticsTrend({ from: trendFrom, to: trendTo, granularity: "day" }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 시 1회만, 이후는 트렌드 핸들러가 직접 처리
  }, []);

  const handleRetry = () =>
    dispatch(
      requestAdminAnalyticsSummary(
        range === "CUSTOM" ? { range, from: customFrom, to: customTo } : { range },
      ),
    );

  const handleRangeChange = (value) => {
    dispatch(setAdminAnalyticsRange(value));
    if (value === "CUSTOM") return; // 기간 확정("조회" 클릭) 전까지는 요청하지 않는다
    dispatch(requestAdminAnalyticsSummary({ range: value }));
  };

  const handleCustomApply = () => {
    if (!customFrom || !customTo) return;
    dispatch(requestAdminAnalyticsSummary({ range: "CUSTOM", from: customFrom, to: customTo }));
  };

  const fetchTrend = (from = trendFrom, to = trendTo, granularity = trendGranularity) =>
    dispatch(requestAdminAnalyticsTrend({ from, to, granularity }));

  const handleTrendGranularityChange = (value) => {
    setTrendGranularity(value);
    let from = trendFrom;
    if (value === "hour") {
      const minDate = getKstMonthsAgo(3);
      if (from < minDate) {
        from = minDate;
        setTrendFrom(from);
      }
    }
    fetchTrend(from, trendTo, value);
  };

  // dispatch(thunk) 는 unwrap() 없이는 reject 되지 않는다 — .catch 는 도달 불가라 제거.
  // 실패는 mutateError(슬라이스 상태)로 이미 화면에 노출된다.
  const handleAggregate = () => {
    dispatch(requestAdminAnalyticsAggregate(aggregateDate)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        dispatch(
          requestAdminAnalyticsSummary(
            range === "CUSTOM" ? { range, from: customFrom, to: customTo } : { range },
          ),
        );
      }
    });
  };

  const eventRows = summary
    ? Object.entries(summary.eventCounts).map(([type, count]) => ({
        type,
        label: EVENT_TYPE_LABEL[type] ?? type,
        count,
      }))
    : [];

  // should 5: pageViews=0 이라도 이벤트 건수가 하나라도 있으면(SEARCH 등) 표를 계속 보여준다.
  const isEmpty =
    !summary ||
    (summary.pageViews === 0 &&
      (summary.topPages?.length ?? 0) === 0 &&
      Object.values(summary.eventCounts).every((v) => v === 0));

  const trendPoints = trend[trendGranularity] ?? [];
  const trendMinDate = trendGranularity === "hour" ? getKstMonthsAgo(3) : undefined;

  return (
    <div className={styles.tab}>
      <div className={styles.head}>
        <b className={styles.title}>방문 · 이벤트 통계</b>
        <p className={styles.subtitle}>수집된 사용자 행동 데이터를 기간별로 봅니다.</p>
      </div>

      {loading && <StateBox status="loading" message="통계를 불러오는 중..." />}
      {!loading && error && <StateBox status="error" message={error} onRetry={handleRetry} />}
      {!loading && !error && isEmpty && (
        <StateBox status="empty" message="집계된 데이터가 없습니다." />
      )}

      {!loading && !error && summary && !isEmpty && (
        <div className={styles.articleScroll}>
          {/* 개요 */}
          <section className={styles.box}>
            <b className={styles.boxTitle}>개요</b>
            {/* 제목과 나란히 두면 480 에서 세그먼트 4개가 눌려 글자가 세로로 쪼개진다 — 아래 줄로 내림. */}
            <div className={styles.rangeRow}>
              <AdminSegmented
                options={RANGE_OPTIONS}
                value={range}
                onChange={handleRangeChange}
                name="통계 기간"
              />
            </div>
            {range === "CUSTOM" && (
              <div className={styles.customRow}>
                <AdminDateRange
                  start={customFrom}
                  end={customTo}
                  onStartChange={setCustomFrom}
                  onEndChange={setCustomTo}
                  max={getTodayKst()}
                  name="customRange"
                />
                <button type="button" className={styles.applyButton} onClick={handleCustomApply}>
                  조회
                </button>
              </div>
            )}

            <div className={styles.summaryCards}>
              <div className={styles.summaryCard}>
                <span className={styles.cardLabel}>순방문자</span>
                <span className={styles.cardValue}>{summary.uniqueVisitors.toLocaleString()}</span>
              </div>
              <div className={styles.summaryCard}>
                <span className={styles.cardLabel}>페이지뷰</span>
                <span className={styles.cardValue}>{summary.pageViews.toLocaleString()}</span>
              </div>
            </div>

            <div className={styles.section}>
              <b className={styles.sectionTitle}>이벤트 종류별 건수</b>
              <AdminTable
                columns={[
                  { key: "label", label: "이벤트", align: "left" },
                  {
                    key: "count",
                    label: "건수",
                    width: 90,
                    render: (row) => row.count.toLocaleString(),
                  },
                ]}
                rows={eventRows}
                rowKey={(row) => row.type}
              />
            </div>

            <div className={styles.section}>
              <b className={styles.sectionTitle}>세션당 페이지뷰</b>
              <div className={styles.summaryCard}>
                <span className={styles.cardValue}>{summary.pageViewsPerSession ?? "-"}</span>
              </div>
            </div>
          </section>

          {/* 상위 경로 */}
          <section className={styles.box}>
            <b className={styles.boxTitle}>상위 경로 Top 10</b>
            <AdminTable
              columns={[
                { key: "pagePath", label: "경로", align: "left" },
                {
                  key: "count",
                  label: "조회수",
                  width: 64,
                  render: (row) => row.count.toLocaleString(),
                },
                {
                  key: "uniqueVisitors",
                  label: "순방문",
                  width: 64,
                  render: (row) => row.uniqueVisitors.toLocaleString(),
                },
                {
                  key: "returningRate",
                  label: "재방문율",
                  width: 64,
                  render: (row) => (row.returningRate == null ? "-" : `${row.returningRate}%`),
                },
              ]}
              rows={summary.topPages}
              rowKey={(row) => row.pagePath}
            />
          </section>

          {/* 추이 */}
          <section className={styles.box}>
            <b className={styles.boxTitle}>추이</b>
            <div className={styles.rangeRow}>
              <AdminSegmented
                options={TREND_GRANULARITY_OPTIONS}
                value={trendGranularity}
                onChange={handleTrendGranularityChange}
                name="추이 단위"
              />
            </div>
            <div className={styles.customRow}>
              <AdminDateRange
                start={trendFrom}
                end={trendTo}
                onStartChange={setTrendFrom}
                onEndChange={setTrendTo}
                min={trendMinDate}
                max={getTodayKst()}
                name="trendRange"
              />
              <button type="button" className={styles.applyButton} onClick={() => fetchTrend()}>
                조회
              </button>
            </div>

            {trendLoading && <StateBox status="loading" message="추이를 불러오는 중..." />}
            {!trendLoading && trendError && (
              <StateBox status="error" message={trendError} onRetry={() => fetchTrend()} />
            )}
            {!trendLoading && !trendError && trendPoints.length === 0 && (
              <StateBox status="empty" message="집계된 추이가 없습니다." />
            )}
            {!trendLoading && !trendError && trendPoints.length > 0 && (
              <TrendBars points={trendPoints} granularity={trendGranularity} />
            )}
          </section>

          {/* 방문자 구성 */}
          <section className={styles.box}>
            <b className={styles.boxTitle}>방문자 구성</b>
            <div className={styles.section}>
              <span className={styles.sectionTitle}>기기 비율</span>
              <RatioBars rows={countRows(summary.deviceRatio, DEVICE_TYPE_LABEL, DEVICE_TYPE_COLOR)} />
            </div>
            <div className={styles.section}>
              <span className={styles.sectionTitle}>신규 · 재방문</span>
              <RatioBars
                rows={countRows(summary.visitorComposition, VISITOR_TYPE_LABEL, VISITOR_TYPE_COLOR)}
              />
            </div>
            <div className={styles.section}>
              <span className={styles.sectionTitle}>가입 전환</span>
              <RatioBars rows={countRows(summary.signupConversion, SIGNUP_LABEL, SIGNUP_COLOR)} />
            </div>
          </section>

          {/* 외부 유입 */}
          <section className={styles.box}>
            <b className={styles.boxTitle}>외부 유입 상위</b>
            <AdminTable
              columns={[
                { key: "referrerHost", label: "유입 경로", align: "left" },
                {
                  key: "count",
                  label: "건수",
                  width: 90,
                  render: (row) => row.count.toLocaleString(),
                },
              ]}
              rows={summary.topReferrers ?? []}
              rowKey={(row) => row.referrerHost}
            />
          </section>
        </div>
      )}

      {/* 수동 재집계 — 가로 스크롤 밖(맨 아래) 고정 위치 유지 */}
      {!loading && !error && summary && !isEmpty && (
        <div className={styles.section}>
          <b className={styles.sectionTitle}>수동 재집계</b>
          <p className={styles.subtitle}>날짜를 골라 그날의 일별 집계를 다시 계산합니다.</p>
          <div className={styles.aggregateRow}>
            <input
              type="date"
              className={styles.aggregateInput}
              value={aggregateDate}
              onChange={(e) => setAggregateDate(e.target.value)}
            />
            <button
              type="button"
              className={styles.aggregateButton}
              disabled={mutateLoading}
              onClick={handleAggregate}
            >
              {mutateLoading ? "집계 중..." : "재집계"}
            </button>
          </div>
          {mutateError && <p className={styles.aggregateError}>{mutateError}</p>}
        </div>
      )}
    </div>
  );
}
