// domains/players/mobile/PlayerEncyclopediaScreen.jsx
// 진입 즉시 선수 리스트를 로드해 렌더한다(AdSense 심사 대응 — 게이트 제거, 2026-09-13).
// GuideView(최초 안내문)는 화면을 가리는 관문이 아니라, 상단 「도움말」 버튼으로 여는 모달로 강등됐다.
// 필터 파이프라인 순서는 design_handoff README 를 그대로 따른다:
// 범위(검색/팀필터/구단연도) → 모달 필터 AND → 재료만 → 탭 카운트 → 정렬.
import { useCallback, useMemo, useState } from "react";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useSearchTracking } from "@/infra/analytics/hooks/useSearchTracking.js";
import { usePlayerCards } from "./hooks/usePlayerCards";
import { usePlayerStats } from "./hooks/usePlayerStats";
import {
  TABS,
  ACTIVE_KINDS,
  getTeams,
  getYearsForTeam,
  getPosOrder,
} from "@/domains/players/config/playersLoader";
import {
  STAT_LABELS_B,
  STAT_LABELS_P,
  STAT_SHORT_B,
  STAT_SHORT_P,
  joinListRows,
  sortListRows,
  buildTable,
} from "@/domains/players/config/statsTable.js";
import { PITCH_LABELS, PITCH_SHORT } from "@/domains/players/store/statsAdapter.js";
import GuideAccordion from "@/global/ui/guideAccordion/GuideAccordion.jsx";
import { GUIDES_BY_SLUG } from "@/domains/guides/content/index.js";
import PlayerCard from "./components/playerCard/PlayerCard";
import FilterSheet from "./components/filterSheet/FilterSheet";
import StatsTable from "./components/statsTable/StatsTable";
import TableHelpModal from "./components/tableHelpModal/TableHelpModal";
import "./players.tokens.scss";
import styles from "./PlayerEncyclopediaScreen.module.scss";

const PE_VIEW_KEY = "pe_view";
const readSavedView = () => {
  try {
    return localStorage.getItem(PE_VIEW_KEY) === "list" ? "list" : "card";
  } catch {
    return "card";
  }
};
const saveView = (v) => {
  try {
    localStorage.setItem(PE_VIEW_KEY, v);
  } catch {
    // 저장 실패해도 화면 동작엔 지장 없다 — 이번 세션만 기억 안 될 뿐
  }
};

const toggle = (arr, value) => (arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

const PlayerEncyclopediaScreen = () => {
  useDomainTopBar("선수 백과사전");

  const [tableHelp, setTableHelp] = useState(false);

  // 게이트 없이 진입 즉시 로드 — 비로그인·크롤러 모두 리스트를 바로 본다.
  const { items: PLAYERS, error, loaded, retry } = usePlayerCards(true);

  const TEAMS = useMemo(() => getTeams(PLAYERS), [PLAYERS]);

  const [team, setTeam] = useState("");
  const [year, setYear] = useState("");
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [maxGrade, setMaxGrade] = useState(false);
  const [onlyL, setOnlyL] = useState(false);
  const [openL, setOpenL] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [fTeam, setFTeam] = useState([]);
  const [fPos, setFPos] = useState([]);
  const [fKind, setFKind] = useState([]);

  // 리스트형 — 타자/투수 탭에서만. 선택은 localStorage 로 기억한다(README pe_view).
  const [view, setView] = useState(readSavedView);
  const [sub, setSub] = useState("stat");
  const [sortKey, setSortKey] = useState(null);
  const [sortDir, setSortDir] = useState(1);

  // 데이터 로드 전엔 team/year 가 비어 있다 — 로드되면 TEAMS[0]/그 구단의 첫 연도로 자연히 채워진다.
  const effectiveTeam = team || TEAMS[0] || "";
  const years = useMemo(() => getYearsForTeam(PLAYERS, effectiveTeam), [PLAYERS, effectiveTeam]);
  const effectiveYear = years.includes(year) ? year : (years[0] ?? "");

  useSearchTracking(query);

  const trimmedQuery = query.trim();
  const hasQuery = trimmedQuery.length > 0;
  const teamFiltered = fTeam.length > 0;
  const selectorDisabled = hasQuery || teamFiltered; // README: 검색 중이거나 팀 필터가 있으면 구단·연도 select disabled
  const wide = hasQuery || teamFiltered; // 여러 구단이 섞여 보이는 상태 — 카드에 구단명을 함께 표기

  // 1) 범위 → 2) 모달 필터 AND → 3) 재료만
  const scopedRows = useMemo(() => {
    let base;
    if (hasQuery) {
      base = PLAYERS.filter((r) => r.n.includes(trimmedQuery));
    } else if (teamFiltered) {
      base = PLAYERS;
    } else {
      base = PLAYERS.filter((r) => r.tm === effectiveTeam && r.y === effectiveYear);
    }
    if (teamFiltered) base = base.filter((r) => fTeam.includes(r.tm));
    // 부포지션도 필터 대상 — DH 를 고르면 주포지션이 DH 인 카드뿐 아니라 겸업으로 DH 를
    // 가진 카드도 나와야 한다(요청 원문). 카드는 부포지션이 없는 게 대부분이라 단락 평가로 충분히 빠르다.
    if (fPos.length) base = base.filter((r) => fPos.includes(r.pos) || (r.subPos && fPos.includes(r.subPos)));
    if (fKind.length) base = base.filter((r) => r.kinds.some((k) => fKind.includes(k)));
    if (onlyL) base = base.filter((r) => r.L);
    return base;
  }, [PLAYERS, hasQuery, trimmedQuery, teamFiltered, fTeam, fPos, fKind, onlyL, effectiveTeam, effectiveYear]);

  // 4) 탭 카운트 — 0장이면 disabled, 현재 탭이 0장이 되면 "전체"로 자동 보정
  const tabCounts = useMemo(() => {
    const cnt = { all: scopedRows.length, H: 0, P: 0, C: 0 };
    scopedRows.forEach((r) => {
      cnt[r.t] += 1;
    });
    return cnt;
  }, [scopedRows]);

  const effectiveTab = tab !== "all" && tabCounts[tab] === 0 ? "all" : tab;
  const tabRows = effectiveTab === "all" ? scopedRows : scopedRows.filter((r) => r.t === effectiveTab);

  // 5) 정렬 — 검색 중 / 그 외 규칙이 다르다
  const sortedPlayers = useMemo(() => {
    const arr = [...tabRows];
    if (hasQuery) {
      arr.sort(
        (a, b) => a.n.localeCompare(b.n, "ko") || Number(a.y) - Number(b.y) || a.tm.localeCompare(b.tm, "ko")
      );
    } else {
      arr.sort((a, b) => {
        const legendDiff = (a.L ? 0 : 1) - (b.L ? 0 : 1);
        if (legendDiff !== 0) return legendDiff;
        const typeOrder = (t) => (t === "H" ? 0 : t === "P" ? 1 : 2);
        const typeDiff = typeOrder(a.t) - typeOrder(b.t);
        if (typeDiff !== 0) return typeDiff;
        const posDiff = getPosOrder(a.pos) - getPosOrder(b.pos);
        if (posDiff !== 0) return posDiff;
        return a.n.localeCompare(b.n, "ko");
      });
    }
    return arr;
  }, [tabRows, hasQuery]);

  const filterCount = (fTeam.length ? 1 : 0) + (fPos.length ? 1 : 0) + (fKind.length ? 1 : 0) + (onlyL ? 1 : 0);
  const filterActive = filterCount > 0;
  const teamAllLabel = teamFiltered && !hasQuery ? `${fTeam.length}개 구단` : "전체";
  const baseColor = maxGrade ? "var(--color-pe-gold)" : "var(--color-pe-normal)";
  const baseLabel = maxGrade ? "플래티넘" : "노말";

  // 리스트형은 타자/투수 탭에서만 켜진다 — 그 외 탭이면 카드형으로 강제.
  const listDisabled = !(effectiveTab === "H" || effectiveTab === "P");
  const isList = !listDisabled && view === "list";
  const listIsPitcher = effectiveTab === "P";
  const effectiveSub = listIsPitcher ? sub : "stat";
  const isPitch = listIsPitcher && effectiveSub === "pitch";

  // 스탯 API 는 구단 하나를 통째로 준다 — 리스트형으로 전환했을 때만, 그 구단만 받는다.
  const {
    items: statItems,
    error: statsError,
    loaded: statsLoaded,
    retry: retryStats,
  } = usePlayerStats(isList, effectiveTeam);

  const statsById = useMemo(() => new Map(statItems.map((s) => [s.id, s])), [statItems]);

  // 스탯은 effectiveTeam 하나만 있어 다른 구단이 섞인 결과(검색·팀필터)는 그 구단 몫만 표로 보여준다.
  const listCardRows = useMemo(() => tabRows.filter((r) => r.tm === effectiveTeam), [tabRows, effectiveTeam]);
  const joinedListRows = useMemo(() => joinListRows(listCardRows, statsById), [listCardRows, statsById]);
  const sortedListRows = useMemo(
    () => sortListRows(joinedListRows, sortKey, sortDir).slice(0, 400), // README: 최대 400행 렌더
    [joinedListRows, sortKey, sortDir],
  );

  const statLabels = useMemo(
    () => (listIsPitcher ? { full: STAT_LABELS_P, short: STAT_SHORT_P } : { full: STAT_LABELS_B, short: STAT_SHORT_B }),
    [listIsPitcher],
  );

  const handleSort = useCallback(
    (key) => {
      if (sortKey === key) {
        setSortDir((d) => -d);
      } else {
        setSortKey(key);
        // README: stat/pitch 키는 첫 클릭이 내림차순 — "OVR" 도 같은 지표 계열이라 동일하게 맞춘다.
        setSortDir(/^(stat|pitch):/.test(key) || key === "ovr" ? -1 : 1);
      }
    },
    [sortKey],
  );

  const listTable = useMemo(
    () =>
      buildTable({
        rows: sortedListRows,
        isPitch,
        statLabels,
        sortKey,
        sortDir,
        onSort: handleSort,
      }),
    [sortedListRows, isPitch, statLabels, sortKey, sortDir, handleSort],
  );

  // 정렬 해제 배지 — "보이지 않는 값으로 정렬 중"인 상태(능력치·OVR 열)일 때
  // 두 표(스탯/구종) 모두, 타자·투수 탭 모두에서 자리를 잡는다. 이름/구단/연도/포지션처럼
  // 눈에 보이는 열 정렬은 굳이 배지로 알릴 필요가 없어 대상에서 뺐다.
  const sortedByMetric = typeof sortKey === "string" && (sortKey.startsWith("stat:") || sortKey.startsWith("pitch:") || sortKey === "ovr");
  const sortBadgeLabel = !sortedByMetric
    ? ""
    : sortKey === "ovr"
      ? "OVR"
      : sortKey.startsWith("pitch:")
        ? PITCH_LABELS[Number(sortKey.slice(6))]
        : (listIsPitcher ? STAT_LABELS_P : STAT_LABELS_B)[Number(sortKey.slice(5))];

  // 표 도움말 모달 내용 — 지금 보는 표 종류에 맞춰 약어·사용법이 갈린다(README §4 + OVR 추가 설명).
  const tableHelpTitle = isPitch ? "구종 등급 표 도움말" : listIsPitcher ? "투수 스탯 표 도움말" : "타자 스탯 표 도움말";
  const tableHelpAbbr = isPitch
    ? PITCH_SHORT.map((k, i) => ({ k, v: PITCH_LABELS[i] }))
    : statLabels.short.map((k, i) => ({ k, v: statLabels.full[i] })).concat([{ k: "OVR", v: "스탯 5개 평균" }]);
  const tableHelpExtra = isPitch
    ? ['등급 S > A > B > C > D, "-"는 미보유 구종', "스탯 ↔ 구종 등급 전환 시 정렬 순서 유지"]
    : [
        "각 선수 최고 능력치(70+)는 민트색",
        "OVR = 스탯 5개 평균 (소수 한 자리)",
        ...(listIsPitcher ? ["스탯 ↔ 구종 등급 전환 시 정렬 순서 유지"] : []),
      ];

  const handleSetView = useCallback(
    (next) => {
      if (next === "list" && listDisabled) return;
      setView(next);
      setSortKey(null);
      setSortDir(1);
      saveView(next);
    },
    [listDisabled],
  );

  // 탭/구단이 바뀌면 이전 정렬은 의미가 없어진다(다른 선수 집합) — 기본 정렬로 되돌린다.
  // useEffect 대신 렌더 중 비교로 처리한다(React 권장: "prop 이 바뀌면 state 조정하기").
  const listScopeKey = `${effectiveTab}:${effectiveTeam}`;
  const [prevListScopeKey, setPrevListScopeKey] = useState(listScopeKey);
  if (listScopeKey !== prevListScopeKey) {
    setPrevListScopeKey(listScopeKey);
    setSortKey(null);
    setSortDir(1);
  }

  const handleOpenTableHelp = useCallback(() => {
    setTableHelp(true);
    setFilterOpen(false);
    setOpenL(null);
  }, []);

  const handleClearSort = useCallback(() => {
    setSortKey(null);
  }, []);

  // 새 구단의 연도 목록에 지금 연도가 없으면 effectiveYear 가 알아서 그 구단의 첫 연도로 바뀐다.
  const handleTeamChange = useCallback((nextTeam) => {
    setTeam(nextTeam);
  }, []);

  const handleToggleL = useCallback((id) => {
    setOpenL((prev) => (prev === id ? null : id));
  }, []);

  const handleCloseOpenCard = useCallback(() => {
    setOpenL((prev) => (prev ? null : prev));
  }, []);

  const handleResetAll = useCallback(() => {
    setQuery("");
    setFTeam([]);
    setFPos([]);
    setFKind([]);
    setOnlyL(false);
    setTab("all");
  }, []);

  const handleToggleKind = useCallback((kind) => {
    if (!ACTIVE_KINDS.has(kind)) return; // DB엔 일반·시그니처만 있어 나머지는 선택 불가
    setFKind((prev) => toggle(prev, kind));
  }, []);

  return (
    <div className={styles.screen}>
      <GuideAccordion guide={GUIDES_BY_SLUG["player-encyclopedia"]} />

      <div className={styles.searchFilterRow}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon} aria-hidden="true">
            🔍
          </span>
          <input
            className={styles.searchInput}
            placeholder="이름 검색 (전체 카드)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {hasQuery && (
            <button type="button" className={styles.clearBtn} aria-label="검색 지우기" onClick={() => setQuery("")}>
              ✕
            </button>
          )}
        </div>
        <button
          type="button"
          className={`${styles.filterBtn} ${filterActive ? styles.filterBtnActive : ""}`}
          onClick={() => setFilterOpen(true)}
        >
          필터
          {filterActive && <span className={styles.filterBadge}>{filterCount}</span>}
        </button>
      </div>

      <div className={styles.selectRow} style={{ opacity: selectorDisabled ? 0.45 : 1 }}>
        <select
          className={styles.select}
          value={selectorDisabled ? "__all" : effectiveTeam}
          disabled={selectorDisabled}
          onChange={(e) => handleTeamChange(e.target.value)}
        >
          {selectorDisabled && <option value="__all">{teamAllLabel}</option>}
          {TEAMS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <select
          className={styles.select}
          value={selectorDisabled ? "__all" : effectiveYear}
          disabled={selectorDisabled}
          onChange={(e) => setYear(e.target.value)}
        >
          {selectorDisabled && <option value="__all">전체</option>}
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.tabToggleRow}>
        <div className={styles.tabs}>
          {TABS.map(([id, label]) => {
            const count = tabCounts[id];
            return (
              <button
                key={id}
                type="button"
                className={`${styles.tab} ${effectiveTab === id ? styles.tabActive : ""}`}
                disabled={count === 0}
                onClick={() => setTab(id)}
              >
                <span>{label}</span>
                <span className={styles.tabCount}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className={styles.viewToggle}>
          <button
            type="button"
            className={`${styles.viewGrid} ${!isList ? styles.viewActive : ""}`}
            aria-label="카드형"
            onClick={() => handleSetView("card")}
          >
            <span />
            <span />
            <span />
            <span />
          </button>
          <button
            type="button"
            className={`${styles.viewList} ${isList ? styles.viewActive : ""}`}
            aria-label={listDisabled ? "리스트형 (타자 또는 투수 탭에서 사용할 수 있습니다)" : "리스트형"}
            title={listDisabled ? "타자 또는 투수 탭에서 사용할 수 있습니다" : undefined}
            disabled={listDisabled}
            onClick={() => handleSetView("list")}
          >
            <span />
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>

      <div className={styles.toggleRow}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${onlyL ? styles.toggleBtnMaterial : ""}`}
          onClick={() => setOnlyL((v) => !v)}
        >
          <span className={styles.checkbox}>{onlyL && "✓"}</span>
          재료만 보기
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${maxGrade ? styles.toggleBtnGold : ""}`}
          onClick={() => setMaxGrade((v) => !v)}
        >
          <span className={styles.checkbox}>{maxGrade && "✓"}</span>
          최고 등급 보기
        </button>
      </div>

      <div className={styles.legendRow}>
        <span className={styles.legendItem}>
          <span className={styles.lMarkSmall}>L</span>레전드 재료
        </span>
        <span className={styles.legendItem}>
          <span className={styles.gradeDot} style={{ backgroundColor: baseColor }} />
          {baseLabel}
        </span>
        <div className={styles.legendRight}>
          {isList && statsLoaded && !statsError && sortedListRows.length > 0 && (
            <button type="button" className={styles.tableHelpPill} onClick={handleOpenTableHelp}>
              <span className={styles.tableHelpMark}>?</span>
              {isPitch ? "구종 도움말" : "스탯 도움말"}
            </button>
          )}
          <span>
            <b>{sortedPlayers.length}</b>장
          </span>
        </div>
      </div>

      {error ? (
        <div className={styles.emptyWrap}>
          <p>카드를 불러오지 못했습니다. {error}</p>
          <button type="button" className={styles.resetAllBtn} onClick={retry}>
            다시 시도
          </button>
        </div>
      ) : !loaded ? (
        <div className={styles.skeletonGrid} aria-label="카드 불러오는 중">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard} />
          ))}
        </div>
      ) : isList ? (
        <div className={styles.listWrap}>
          {(listIsPitcher || sortedByMetric) && (
            <div className={styles.listTopRow}>
              {listIsPitcher && (
                <div className={styles.segment}>
                  <button
                    type="button"
                    className={`${styles.segmentBtn} ${effectiveSub === "stat" ? styles.segmentBtnActive : ""}`}
                    onClick={() => setSub("stat")}
                  >
                    스탯
                  </button>
                  <button
                    type="button"
                    className={`${styles.segmentBtn} ${effectiveSub === "pitch" ? styles.segmentBtnActive : ""}`}
                    onClick={() => setSub("pitch")}
                  >
                    구종 등급
                  </button>
                </div>
              )}
              {sortedByMetric && (
                <div className={styles.sortBadge}>
                  <span className={styles.sortBadgeText}>
                    정렬: <b>{sortBadgeLabel} {sortDir === 1 ? "▲" : "▼"}</b>
                  </span>
                  <button type="button" className={styles.sortBadgeClear} onClick={handleClearSort}>
                    해제
                  </button>
                </div>
              )}
            </div>
          )}

          {statsError ? (
            <div className={styles.emptyWrap}>
              <p>스탯을 불러오지 못했습니다. {statsError}</p>
              <button type="button" className={styles.resetAllBtn} onClick={retryStats}>
                다시 시도
              </button>
            </div>
          ) : !statsLoaded ? (
            <div className={styles.emptyWrap}>
              <p>스탯을 불러오는 중…</p>
            </div>
          ) : sortedListRows.length === 0 ? (
            <div className={styles.emptyWrap}>
              <p>조건에 맞는 카드가 없습니다.</p>
              <button type="button" className={styles.resetAllBtn} onClick={handleResetAll}>
                검색·필터 초기화
              </button>
            </div>
          ) : (
            <StatsTable {...listTable} />
          )}
        </div>
      ) : sortedPlayers.length === 0 ? (
        <div className={styles.emptyWrap}>
          <p>조건에 맞는 카드가 없습니다.</p>
          <button type="button" className={styles.resetAllBtn} onClick={handleResetAll}>
            검색·필터 초기화
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {sortedPlayers.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              maxGrade={maxGrade}
              wide={wide}
              isOpen={openL === p.id}
              onToggleL={handleToggleL}
              onClose={handleCloseOpenCard}
            />
          ))}
        </div>
      )}

      <FilterSheet
        open={filterOpen}
        teams={TEAMS}
        fTeam={fTeam}
        fPos={fPos}
        fKind={fKind}
        onlyL={onlyL}
        onToggleTeam={(t) => setFTeam((prev) => toggle(prev, t))}
        onTogglePos={(p) => setFPos((prev) => toggle(prev, p))}
        onToggleKind={handleToggleKind}
        onTeamAll={() => setFTeam([])}
        onPosAll={() => setFPos([])}
        onKindAll={() => setFKind([])}
        onToggleOnlyL={() => setOnlyL((v) => !v)}
        onReset={() => {
          setFTeam([]);
          setFPos([]);
          setFKind([]);
          setOnlyL(false);
        }}
        onClose={() => setFilterOpen(false)}
        shownCount={sortedPlayers.length}
      />

      <TableHelpModal
        open={tableHelp}
        title={tableHelpTitle}
        abbr={tableHelpAbbr}
        extra={tableHelpExtra}
        onClose={() => setTableHelp(false)}
      />
    </div>
  );
};

export default PlayerEncyclopediaScreen;
