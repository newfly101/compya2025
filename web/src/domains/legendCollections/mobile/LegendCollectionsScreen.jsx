import { useCallback, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { ALL, teamColor, teamOptions } from "@/domains/legendStats/config/legendStats.js";
import { useHistoryBadge } from "@/domains/legendStats/mobile/hooks/useHistoryBadge.js";
import { useMileageBadge } from "@/domains/legendStats/mobile/hooks/useMileageBadge.js";
import {
  DEFAULT_SORT,
  PREF_SORT,
  displayAcquiredDate,
  EMPTY_DRAFT,
  FRAME_FILTERS,
  PREF_FILTER,
  legendStatus,
  matchFrameFilter,
  ownedCount,
  nextSort,
  sortLegends,
  sortText,
  summarize,
} from "@/domains/legendCollections/config/legendCollections.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useLoginRequiredModal } from "@/domains/authentication/hooks/useLoginRequiredModal.jsx";
import LegendTabs from "@/global/ui/mobile/legendTabs/LegendTabs.jsx";
import { collectionsGuide } from "@/domains/legendCollections/config/collectionsGuide.js";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import PreferenceModal from "./components/modals/PreferenceModal.jsx";
import CollectionFilters from "./components/collectionFilters/CollectionFilters.jsx";
import LegendTable from "./components/legendTable/LegendTable.jsx";
import { useLegendCollections } from "./hooks/useLegendCollections";
import "./legendCollections.tokens.scss";
import styles from "./LegendCollectionsScreen.module.scss";

/**
 * 내 재료 보유 현황 — 조회 전용. 편집은 /legend-collections/manage, 선호 고르기는 검색 줄의 '선호' 버튼(모달).
 * 선호 보기는 필터 칩(전체 / 내 선호). `?tab=mine` 링크는 그 칩이 켜진 채로, `?prefs=1` 은 선호 모달이 열린 채로 열린다.
 */
const LegendCollectionsScreen = () => {
  useDomainTopBar("레전드 재료");
  const navigate = useNavigate();
  const { askLogin, loginModal } = useLoginRequiredModal(); // 공용 로그인 안내 (REQ-AUTH-13)

  const c = useLegendCollections();
  const { legends, server, draft, isAuthenticated } = c;
  const historyCards = useHistoryBadge();
  const mileageBadge = useMileageBadge();

  const [params, setParams] = useSearchParams();
  const prefs = server.preferences;

  const [team, setTeam] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [frameFilter, setFrameFilter] = useState(params.get("tab") === "mine" ? PREF_FILTER : FRAME_FILTERS[0]);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [prefOpen, setPrefOpen] = useState(params.get("prefs") === "1");
  const [sortState, setSortState] = useState(null); // null = 머리를 아직 안 눌렀다 → 기본 (전체: 보유 많은 순 · 내 선호: 선호 순위)

  const byId = useMemo(() => new Map(legends.map((l) => [l.id, l])), [legends]);
  const prefLegends = useMemo(() => prefs.map((id) => byId.get(id)).filter(Boolean), [prefs, byId]);
  const mine = frameFilter === PREF_FILTER && isAuthenticated;
  const pool = mine ? prefLegends : legends;

  const teams = useMemo(
    () => teamOptions(pool).map((t) => ({ value: t, dot: t === ALL ? undefined : teamColor(t) })),
    [pool],
  );
  const summary = useMemo(() => summarize(pool, server, draft), [pool, server, draft]);
  const statusOf = useCallback((l) => legendStatus(l.id, server, draft), [server, draft]);
  const sort = sortState ?? (mine ? PREF_SORT : DEFAULT_SORT);

  const rows = useMemo(() => {
    const q = query.trim();
    const filtered = pool.filter(
      (l) =>
        (!q || l.name.includes(q)) &&
        (team === ALL || l.team === team) &&
        (type === ALL || l.type === type) &&
        matchFrameFilter(statusOf(l), frameFilter),
    );
    return sortLegends(
      filtered,
      sort,
      (l) => ownedCount(l.id, server, EMPTY_DRAFT),
      (l) => legendStatus(l.id, server, EMPTY_DRAFT),
      (l) => displayAcquiredDate(l.id, server),
      (l) => prefs.indexOf(l.id) + 1,
    );
  }, [pool, query, team, type, frameFilter, statusOf, sort, server, prefs]);

  const toggleSort = (key) => {
    setSortState(nextSort(sort, key));
    setOpenId(null);
  };

  const toggleRow = (id) => {
    const next = openId === id ? null : id;
    if (next) c.loadSlots(next);
    setOpenId(next);
  };

  const resetFilter = (fn) => (v) => {
    fn(v);
    setOpenId(null);
  };

  // 관리는 로그인한 이용자만 — 비로그인은 공용 로그인 모달
  const goTo = (path) => () => (isAuthenticated ? navigate(path) : askLogin("edit"));

  const openPrefs = () => (isAuthenticated ? setPrefOpen(true) : askLogin("edit"));
  const closePrefs = (saved) => {
    setPrefOpen(false);
    if (params.has("prefs")) {
      params.delete("prefs");
      setParams(params, { replace: true });
    }
    if (saved === true) {
      setFrameFilter(PREF_FILTER);
      setOpenId(null);
    }
  };

  const listLoading = !c.stats.loaded && c.stats.loading;
  const listError = !c.stats.loaded && !c.stats.loading && c.stats.error;

  return (
    <div className={styles.screen}>
      <LegendTabs guide={collectionsGuide} />
      <div className={styles.controls}>
        {isAuthenticated && c.meError && !c.me.loaded && (
          <StateBox status="error" message="내 기록을 불러오지 못했습니다." onRetry={c.retryMe} compact />
        )}

        <CollectionFilters
          query={query}
          onQuery={resetFilter(setQuery)}
          teams={teams}
          team={team}
          onTeam={resetFilter(setTeam)}
          type={type}
          onType={resetFilter(setType)}
          frame={frameFilter}
          onFrame={resetFilter(setFrameFilter)}
          prefCount={isAuthenticated ? prefs.length : undefined}
          summary={summary}
          sortLabel={sortText(sort)}
          actions={
            <>
              <button type="button" className={styles.action} onClick={openPrefs}>
                선호
              </button>
              <button type="button" className={styles.action} onClick={goTo(ROUTE_PATHS.legend_collection_manage)}>
                관리
              </button>
            </>
          }
        />
      </div>

      {listLoading && (
        <div className={styles.skeleton}>
          <Skeleton count={8} height={48} />
        </div>
      )}
      {listError && <StateBox status="error" onRetry={c.stats.retry} />}
      {c.stats.loaded && rows.length > 0 && (
        <LegendTable
          rows={rows}
          sort={sort}
          onSort={toggleSort}
          openId={openId}
          onToggle={toggleRow}
          c={c}
          historyCards={historyCards}
          mileageBadge={mileageBadge}
        />
      )}
      {c.stats.loaded && rows.length === 0 && (
        <StateBox
          status="empty"
          message={
            mine && prefs.length === 0
              ? "선호 레전드가 없어요. 검색 줄의 '선호' 버튼에서 모으고 싶은 레전드를 골라 주세요."
              : "조건에 맞는 레전드가 없습니다. 필터를 하나 풀어보세요."
          }
          compact
        />
      )}

      {prefOpen && isAuthenticated && c.me.loaded && c.stats.loaded && (
        <PreferenceModal
          legends={legends}
          server={server}
          countOf={(id) => ownedCount(id, server, draft)}
          onSave={c.savePreferences}
          onClose={closePrefs}
        />
      )}
      {loginModal}
    </div>
  );
};

export default LegendCollectionsScreen;
