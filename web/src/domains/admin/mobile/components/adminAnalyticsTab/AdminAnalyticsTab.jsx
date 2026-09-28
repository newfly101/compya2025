import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import AdminSegmented from "@/global/ui/admin/fields/AdminSegmented.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import "@/global/ui/admin/admin.tokens.scss";
import {
  requestAdminAnalyticsSummary,
  requestAdminAnalyticsAggregate,
} from "@/domains/admin/store/admin/thunks.js";
import { setAdminAnalyticsRange } from "@/domains/admin/store/slices.js";
import { getYesterdayKst } from "@/global/utils/datetime/dateUtils.js";
import styles from "./AdminAnalyticsTab.module.scss";

const RANGE_OPTIONS = [
  { value: "TODAY", label: "오늘" },
  { value: "WEEK", label: "7일" },
  { value: "MONTH", label: "30일" },
];

// BE event_type 4종(AnalyticsRange 와 별개, 수집 이벤트 종류) 한글 라벨.
// 코드가 여기 없는 값도 그대로 노출 — BE 가 종류를 추가해도 화면이 죽지 않는다.
const EVENT_TYPE_LABEL = {
  PAGE_VIEW: "페이지 조회",
  OUTBOUND_CLICK: "외부 링크 클릭",
  CONTENT_CLICK: "콘텐츠 클릭",
  SEARCH: "검색",
};

// device_type 서버 파생값(AnalyticsEventGuard.detectDeviceType) 한글 라벨.
// unknown 은 실제로는 나오지 않지만(§ FN-19 COALESCE 방어) 스키마 계약상 대비해 둔다.
const DEVICE_TYPE_LABEL = {
  mobile: "모바일",
  tablet: "태블릿",
  pc: "PC",
  unknown: "알 수 없음",
};

// 기기 비율 막대 색 — 신규 토큰 없이 관리자 태그 팔레트 재사용(admin.tokens.scss).
const DEVICE_TYPE_COLOR = {
  mobile: "var(--color-admin-tag-purple-text)",
  tablet: "var(--color-admin-tag-green-text)",
  pc: "var(--color-admin-tag-amber-text)",
  unknown: "var(--color-admin-tag-neutral-text)",
};

// 어드민 셸의 "통계" 탭 패널. AdminCacheSyncTab 과 같은 상태분기 패턴(!loading && error,
// !loading && !error && 데이터 없음)을 따른다. range 는 캐시하지 않고 바뀔 때마다 새로 조회한다 —
// 탭을 옮겨 다시 돌아왔을 때는(재마운트) 이미 받은 summary 를 그대로 보여준다(재요청 없음).
export default function AdminAnalyticsTab() {
  const dispatch = useDispatch();
  const { summary, loading, error, range, mutateLoading, mutateError } = useSelector(
    (s) => s.adminAnalytics
  );
  const [aggregateDate, setAggregateDate] = useState(getYesterdayKst());

  useEffect(() => {
    if (!summary && !loading) dispatch(requestAdminAnalyticsSummary(range));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 마운트 시 1회만, range 변경은 handleRangeChange 가 직접 처리
  }, []);

  const handleRetry = () => dispatch(requestAdminAnalyticsSummary(range));

  const handleRangeChange = (value) => {
    dispatch(setAdminAnalyticsRange(value));
    dispatch(requestAdminAnalyticsSummary(value));
  };

  // dispatch(thunk) 는 unwrap() 없이는 reject 되지 않는다 — .catch 는 도달 불가라 제거.
  // 실패는 mutateError(슬라이스 상태)로 이미 화면에 노출된다.
  const handleAggregate = () => {
    dispatch(requestAdminAnalyticsAggregate(aggregateDate)).then((result) => {
      if (result.meta.requestStatus === "fulfilled") {
        dispatch(requestAdminAnalyticsSummary(range));
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

  const deviceRatioRows = summary
    ? Object.entries(summary.deviceRatio ?? {}).map(([type, count]) => ({
        type,
        label: DEVICE_TYPE_LABEL[type] ?? type,
        count,
      }))
    : [];
  const deviceTotal = deviceRatioRows.reduce((sum, row) => sum + row.count, 0);

  return (
    <div className={styles.tab}>
      <div className={styles.head}>
        <div className={styles.headText}>
          <b className={styles.title}>방문 · 이벤트 통계</b>
          <p className={styles.subtitle}>수집된 사용자 행동 데이터를 기간별로 봅니다.</p>
        </div>
        {/* 제목 줄과 나란히 두면 480 에서 세그먼트 3개가 눌려 글자가 세로로 쪼개진다 —
            아래 줄로 내려 전체 폭을 준다(AdminSegmented 자체는 수정하지 않음). */}
        <div className={styles.rangeRow}>
          <AdminSegmented
            options={RANGE_OPTIONS}
            value={range}
            onChange={handleRangeChange}
            name="통계 기간"
          />
        </div>
      </div>

      {loading && <StateBox status="loading" message="통계를 불러오는 중..." />}
      {!loading && error && <StateBox status="error" message={error} onRetry={handleRetry} />}
      {!loading && !error && isEmpty && (
        <StateBox status="empty" message="집계된 데이터가 없습니다." />
      )}

      {!loading && !error && summary && !isEmpty && (
        <>
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
            <b className={styles.sectionTitle}>상위 경로 Top 10</b>
            <AdminTable
              columns={[
                { key: "pagePath", label: "경로", align: "left" },
                {
                  key: "count",
                  label: "조회수",
                  width: 90,
                  render: (row) => row.count.toLocaleString(),
                },
              ]}
              rows={summary.topPages}
              rowKey={(row) => row.pagePath}
            />
          </div>

          <div className={styles.section}>
            <b className={styles.sectionTitle}>기기 비율</b>
            <div className={styles.deviceBars}>
              {deviceRatioRows.map((row) => (
                <div key={row.type} className={styles.deviceBarRow}>
                  <span className={styles.deviceBarLabel}>{row.label}</span>
                  <div className={styles.deviceBarTrack}>
                    <div
                      className={styles.deviceBarFill}
                      style={{
                        width: deviceTotal ? `${(row.count / deviceTotal) * 100}%` : 0,
                        background: DEVICE_TYPE_COLOR[row.type] ?? DEVICE_TYPE_COLOR.unknown,
                      }}
                    />
                  </div>
                  <span className={styles.deviceBarCount}>{row.count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.section}>
            <b className={styles.sectionTitle}>세션당 페이지뷰</b>
            <div className={styles.summaryCard}>
              <span className={styles.cardValue}>{summary.pageViewsPerSession ?? "-"}</span>
            </div>
          </div>

          <div className={styles.section}>
            <b className={styles.sectionTitle}>외부 유입 상위</b>
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
          </div>

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
        </>
      )}
    </div>
  );
}
