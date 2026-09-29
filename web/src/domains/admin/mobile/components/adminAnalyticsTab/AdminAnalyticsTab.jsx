import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import AdminSegmented from "@/global/ui/admin/fields/AdminSegmented.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import "@/global/ui/admin/admin.tokens.scss";
import {
  requestAdminAnalyticsSummary,
  requestAdminAnalyticsTrend,
  requestAdminAnalyticsAggregate,
} from "@/domains/admin/store/admin/thunks.js";
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
import { RatioBars } from "./AnalyticsCharts.jsx";
import AnalyticsSummaryCard from "./AnalyticsSummaryCard.jsx";
import AnalyticsTrendCard from "./AnalyticsTrendCard.jsx";
import { pathToTitle } from "./pathTitle.js";
import { deltaOf } from "./analyticsDelta.js";
import { previousPeriodOf, formatPeriodLabel } from "./periodMath.js";

// AnalyticsDateValidator(BE) 와 같은 값 — 이보다 이전으로는 직전 구간 비교를 요청하지 않는다.
const SERVICE_START_DATE = "2026-01-29";

const TOP_PATH_MODE_OPTIONS = [
  { value: "title", label: "제목" },
  { value: "path", label: "경로" },
];

const JUMP_TARGETS = [
  { id: "analytics-summary", label: "개요" },
  { id: "analytics-toppages", label: "상위 경로" },
  { id: "analytics-trend", label: "추이" },
  { id: "analytics-visitors", label: "방문자 구성" },
  { id: "analytics-referrers", label: "외부 유입" },
];

// mode(TODAY|DATE|RANGE) + 입력값 → 실제 조회 구간(from~to). 셀렉트 이벤트 핸들러가
// setState 직후 곧바로 새 값으로 조회해야 해서(리액트 state 는 비동기 반영) 컴포넌트
// state 를 읽지 않는 순수 함수로 뺐다.
const periodOf = (mode, dateValue, rangeFrom, rangeTo) => {
  if (mode === "TODAY") return { from: getTodayKst(), to: getTodayKst() };
  if (mode === "DATE") return { from: dateValue, to: dateValue };
  return { from: rangeFrom, to: rangeTo };
};

const summaryArgsOf = (mode, dateValue, rangeFrom, rangeTo) => {
  if (mode === "TODAY") return { range: "TODAY" };
  if (mode === "DATE") {
    return dateValue === getTodayKst()
      ? { range: "TODAY" }
      : { range: "CUSTOM", from: dateValue, to: dateValue };
  }
  return { range: "CUSTOM", from: rangeFrom, to: rangeTo };
};

// 어드민 셸의 "통계" 탭 패널. AdminCacheSyncTab 과 같은 상태분기 패턴(!loading && error,
// !loading && !error && 데이터 없음)을 따른다.
// 5개 카드(개요·상위경로·추이·방문자구성·외부유입)는 상단에서 고른 기간 하나를 그대로 따른다 —
// 개요/상위경로/방문자구성/외부유입은 summary 응답 하나를 같이 쓰니 이미 같은 기간이고, 추이만
// 예전엔 별도 날짜를 가졌던 것을 이번에 없앴다. 직전 같은 길이 구간과 비교(previousSummary·
// previousTrendDay)는 별도 API 없이 같은 thunk 를 from/to 만 바꿔 한 번 더 호출한다
// (ponytail: 요청이 2배가 되지만 어드민 전용 화면이라 허용, slices.js 참고).
export default function AdminAnalyticsTab() {
  const dispatch = useDispatch();
  const {
    summary,
    previousSummary,
    loading,
    error,
    trend,
    previousTrendDay,
    trendLoading,
    trendError,
    mutateLoading,
    mutateError,
  } = useSelector((s) => s.adminAnalytics);

  const [rangeMode, setRangeMode] = useState("TODAY");
  const [dateValue, setDateValue] = useState(getYesterdayKst());
  const [rangeFrom, setRangeFrom] = useState(getKstDateOffset(-7));
  const [rangeTo, setRangeTo] = useState(getYesterdayKst());
  const [trendGranularity, setTrendGranularity] = useState("day");
  const [topPathMode, setTopPathMode] = useState("title");
  const [aggregateDate, setAggregateDate] = useState(getYesterdayKst());

  const fetchTrendCurrent = (from, to, granularity) => {
    // 시간대별은 원본 보관 경계(오늘-3개월) 밖을 조회하면 400 — 화면 값은 그대로 두고
    // 서버에 보낼 from 만 클램프한다.
    let effectiveFrom = from;
    if (granularity === "hour") {
      const minDate = getKstMonthsAgo(3);
      if (effectiveFrom < minDate) effectiveFrom = minDate;
    }
    dispatch(requestAdminAnalyticsTrend({ from: effectiveFrom, to, granularity }));
  };

  const fetchPrevious = (from, to, includeTrend) => {
    const prev = previousPeriodOf({ from, to });
    if (prev.from < SERVICE_START_DATE) return; // 서비스 시작일 이전 — 비교 자체를 요청하지 않는다
    dispatch(
      requestAdminAnalyticsSummary({ range: "CUSTOM", from: prev.from, to: prev.to, isPrevious: true }),
    );
    if (includeTrend) {
      dispatch(
        requestAdminAnalyticsTrend({
          from: prev.from,
          to: prev.to,
          granularity: "day",
          isPrevious: true,
        }),
      );
    }
  };

  const fetchForSelection = (mode, date, from, to, granularity) => {
    dispatch(requestAdminAnalyticsSummary(summaryArgsOf(mode, date, from, to)));
    const period = periodOf(mode, date, from, to);
    fetchTrendCurrent(period.from, period.to, granularity);
    fetchPrevious(period.from, period.to, granularity === "day");
  };

  useEffect(() => {
    if (!summary && !loading) fetchForSelection(rangeMode, dateValue, rangeFrom, rangeTo, trendGranularity);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 시 1회만, 이후는 각 핸들러가 처리
  }, []);

  const handleModeChange = (value) => {
    setRangeMode(value);
    fetchForSelection(value, dateValue, rangeFrom, rangeTo, trendGranularity);
  };

  const handleDateChange = (value) => {
    setDateValue(value);
    fetchForSelection("DATE", value, rangeFrom, rangeTo, trendGranularity);
  };

  const handleApplyRange = () => fetchForSelection("RANGE", dateValue, rangeFrom, rangeTo, trendGranularity);

  const handleQuickRange = (days) => {
    const to = getYesterdayKst();
    const from = getKstDateOffset(-days);
    setRangeFrom(from);
    setRangeTo(to);
    fetchForSelection("RANGE", dateValue, from, to, trendGranularity);
  };

  const handleGranularityChange = (value) => {
    setTrendGranularity(value);
    const period = periodOf(rangeMode, dateValue, rangeFrom, rangeTo);
    fetchTrendCurrent(period.from, period.to, value);
    if (value === "day") fetchPrevious(period.from, period.to, true);
  };

  const handleRetry = () => fetchForSelection(rangeMode, dateValue, rangeFrom, rangeTo, trendGranularity);

  // dispatch(thunk) 는 unwrap() 없이는 reject 되지 않는다 — .catch 는 도달 불가라 제거.
  // 실패는 mutateError(슬라이스 상태)로 이미 화면에 노출된다.
  const handleAggregate = () => {
    dispatch(requestAdminAnalyticsAggregate(aggregateDate)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        fetchForSelection(rangeMode, dateValue, rangeFrom, rangeTo, trendGranularity);
      }
    });
  };

  const handleJump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const eventRowsRaw = summary ? Object.entries(summary.eventCounts ?? {}) : [];
  const isEmpty =
    !summary ||
    (summary.pageViews === 0 &&
      (summary.topPages?.length ?? 0) === 0 &&
      Object.values(summary.eventCounts ?? {}).every((v) => v === 0));

  const period = periodOf(rangeMode, dateValue, rangeFrom, rangeTo);
  const periodLabel = formatPeriodLabel(period.from, period.to);
  const prevPeriod = previousPeriodOf(period);
  const comparisonAvailable = prevPeriod.from >= SERVICE_START_DATE;

  const eventRows = eventRowsRaw.map(([type, count]) => ({
    type,
    label: EVENT_TYPE_LABEL[type] ?? type,
    count,
    delta: comparisonAvailable ? deltaOf(count, previousSummary?.eventCounts?.[type]) : null,
  }));

  const trendPoints = trend[trendGranularity] ?? [];
  const dayOverlayAvailable = comparisonAvailable && previousTrendDay.length > 0;

  return (
    <div className={styles.tab}>
      <div className={styles.head}>
        <b className={styles.title}>방문 · 이벤트 통계</b>
        <p className={styles.subtitle}>수집된 사용자 행동 데이터를 기간별로 봅니다.</p>
      </div>

      <div className={styles.jumpRow}>
        {JUMP_TARGETS.map((t) => (
          <button key={t.id} type="button" className={styles.jumpChip} onClick={() => handleJump(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading && <StateBox status="loading" message="통계를 불러오는 중..." />}
      {!loading && error && <StateBox status="error" message={error} onRetry={handleRetry} />}
      {!loading && !error && isEmpty && (
        <StateBox status="empty" message="집계된 데이터가 없습니다." />
      )}

      {!loading && !error && summary && !isEmpty && (
        <div className={styles.cardList}>
          {/* 개요 */}
          <AnalyticsSummaryCard
            periodLabel={periodLabel}
            summary={summary}
            previousSummary={previousSummary}
            comparisonAvailable={comparisonAvailable}
            eventRows={eventRows}
            rangeMode={rangeMode}
            dateValue={dateValue}
            rangeFrom={rangeFrom}
            rangeTo={rangeTo}
            onModeChange={handleModeChange}
            onDateChange={handleDateChange}
            onRangeFromChange={setRangeFrom}
            onRangeToChange={setRangeTo}
            onApplyRange={handleApplyRange}
            onQuickRange={handleQuickRange}
          />

          {/* 상위 경로 */}
          <section id="analytics-toppages" className={styles.box}>
            <div className={styles.boxHead}>
              <b className={styles.boxTitle}>상위 경로 Top 10</b>
              <span className={styles.periodLabel}>{periodLabel}</span>
            </div>
            <div className={styles.rangeRow}>
              <AdminSegmented
                options={TOP_PATH_MODE_OPTIONS}
                value={topPathMode}
                onChange={setTopPathMode}
                name="상위 경로 표시"
              />
            </div>
            <AdminTable
              columns={[
                {
                  key: "pagePath",
                  label: topPathMode === "path" ? "경로" : "제목",
                  align: "left",
                  render: (row) => (topPathMode === "path" ? row.pagePath : pathToTitle(row.pagePath)),
                },
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
              rows={summary.topPages ?? []}
              rowKey={(row) => row.pagePath}
            />
          </section>

          {/* 추이 */}
          <AnalyticsTrendCard
            periodLabel={periodLabel}
            granularity={trendGranularity}
            onGranularityChange={handleGranularityChange}
            loading={trendLoading}
            error={trendError}
            onRetry={() => handleGranularityChange(trendGranularity)}
            points={trendPoints}
            period={period}
            prevPeriod={prevPeriod}
            previousPoints={previousTrendDay}
            dayOverlayAvailable={dayOverlayAvailable}
          />

          {/* 방문자 구성 */}
          <section id="analytics-visitors" className={styles.box}>
            <div className={styles.boxHead}>
              <b className={styles.boxTitle}>방문자 구성</b>
              <span className={styles.periodLabel}>{periodLabel}</span>
            </div>
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
          <section id="analytics-referrers" className={styles.box}>
            <div className={styles.boxHead}>
              <b className={styles.boxTitle}>외부 유입 상위</b>
              <span className={styles.periodLabel}>{periodLabel}</span>
            </div>
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

      {/* 수동 재집계 — 카드 목록 밖(맨 아래) 고정 위치 유지 */}
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
