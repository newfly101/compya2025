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
  getYearDecades,
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
import AdSlot from "@/infra/ads/AdSlot.jsx";
import { AD_SLOTS, ADS_ENABLED } from "@/infra/ads/adConfig.js";
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

// 카드 그리드(고정 5열)는 표와 달리 배열 렌더라 세그먼트로 쪼개 사이에 광고를 끼울 수 있다.
// 10번째 뒤 1개, 이후 30개 간격 — 화면당 최대 2개(세그먼트 3개)로 캡을 둔다.
const CARD_AD_BREAKPOINTS = [10, 40];
const buildCardSegments = (players) => {
  const segments = [];
  let start = 0;
  for (const bp of CARD_AD_BREAKPOINTS) {
    if (players.length <= bp) break; // 리스트가 이 지점까지 못 미치면 광고 없이 종료
    segments.push(players.slice(start, bp));
    start = bp;
  }
  segments.push(players.slice(start));
  return segments;
};

// 리스트형(표) — StatsTable 은 좌(식별 열)·우(능력치) 두 <table> 을 grid 로 나란히 붙인
// 구조라 legendStats 처럼 한 표 안에 colSpan 광고 행을 끼울 수 없다(좌우 두 표의 행이
// 동시에 어긋난다). 대신 카드 그리드와 같은 세그먼트 방식으로 StatsTable 자체를 쪼개
// 사이에 전체 폭 광고를 끼운다 — StatsTable.jsx 는 손대지 않고 그대로 재사용, 두 번째
// 세그먼트부터는 hideHead 로 열 머리글만 반복 렌더를 막는다.
// 20번째 행 뒤부터 20행 간격, 화면당 최대 3개(세그먼트 4개)로 캡을 둔다 — 표가 최대 400행
// 까지 갈 수 있어(README) 캡 없이 20행마다 넣으면 광고가 콘텐츠보다 많아질 수 있다.
const STATS_TABLE_AD_BREAKPOINTS = [20, 40, 60];
const buildStatsTableSegments = (rows) => {
  const segments = [];
  let start = 0;
  for (const bp of STATS_TABLE_AD_BREAKPOINTS) {
    if (rows.length <= bp) break;
    segments.push(rows.slice(start, bp));
    start = bp;
  }
  segments.push(rows.slice(start));
  return segments;
};

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
  const [fYear, setFYear] = useState([]);
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
  const teamFilterActive = fTeam.length > 0;
  const yearFilterActive = fYear.length > 0;
  // README: fTeam 또는 fYear 가 있으면 범위가 "전체"로 넓어진다 — 팀·연도 select 는 그 동안 잠긴다.
  const modalScopeActive = teamFilterActive || yearFilterActive;
  const selectorDisabled = hasQuery || modalScopeActive;
  const wide = hasQuery || modalScopeActive; // 여러 구단이 섞여 보이는 상태 — 카드에 구단명을 함께 표기

  const yearDecades = useMemo(() => getYearDecades(PLAYERS), [PLAYERS]);

  // 1) 범위 → 2) 모달 필터 AND → 3) 재료만
  const scopedRows = useMemo(() => {
    let base;
    if (hasQuery) {
      base = PLAYERS.filter((r) => r.n.includes(trimmedQuery));
    } else if (modalScopeActive) {
      base = PLAYERS;
    } else {
      base = PLAYERS.filter((r) => r.tm === effectiveTeam && r.y === effectiveYear);
    }
    if (teamFilterActive) base = base.filter((r) => fTeam.includes(r.tm));
    if (yearFilterActive) base = base.filter((r) => fYear.includes(r.y));
    // 부포지션도 필터 대상 — DH 를 고르면 주포지션이 DH 인 카드뿐 아니라 겸업으로 DH 를
    // 가진 카드도 나와야 한다(요청 원문). 카드는 부포지션이 없는 게 대부분이라 단락 평가로 충분히 빠르다.
    if (fPos.length) base = base.filter((r) => fPos.includes(r.pos) || (r.subPos && fPos.includes(r.subPos)));
    if (fKind.length) base = base.filter((r) => r.kinds.some((k) => fKind.includes(k)));
    if (onlyL) base = base.filter((r) => r.L);
    return base;
  }, [
    PLAYERS,
    hasQuery,
    trimmedQuery,
    modalScopeActive,
    teamFilterActive,
    yearFilterActive,
    fTeam,
    fYear,
    fPos,
    fKind,
    onlyL,
    effectiveTeam,
    effectiveYear,
  ]);

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

  const filterCount =
    (fTeam.length ? 1 : 0) + (fYear.length ? 1 : 0) + (fPos.length ? 1 : 0) + (fKind.length ? 1 : 0) + (onlyL ? 1 : 0);
  const filterActive = filterCount > 0;
  const teamAllLabel = teamFilterActive && !hasQuery ? `${fTeam.length}개 구단` : "전체";
  const yearAllLabel = yearFilterActive && !hasQuery ? `${fYear.length}개 연도` : "전체";
  const baseColor = maxGrade ? "var(--color-pe-gold)" : "var(--color-pe-normal)";
  const baseLabel = maxGrade ? "플래티넘" : "노말";

  // 리스트형은 타자/투수 탭에서만 켜진다 — 그 외 탭이면 카드형으로 강제.
  const listDisabled = !(effectiveTab === "H" || effectiveTab === "P");
  const isList = !listDisabled && view === "list";
  const listIsPitcher = effectiveTab === "P";
  const effectiveSub = listIsPitcher ? sub : "stat";
  const isPitch = listIsPitcher && effectiveSub === "pitch";

  // 스탯 API 는 구단 하나를 통째로 준다 — 리스트형으로 전환했을 때만, 그 구단만 받는다.
  // 필터 모달에서 구단을 골랐다면(fTeam) 그 조건이 상단 select box(effectiveTeam) 보다
  // 우선한다 — select box 는 필터가 걸리면 비활성화되지만 마지막 값을 그대로 들고 있어,
  // 그 값을 그냥 쓰면 "필터로 고른 구단과 다른 구단" 을 조회해 리스트가 비어버리는 문제가
  // 있었다(버그 리포트: "필터 선택이 API 호출로 이어지지 않는다"). effectiveTeam 이 필터
  // 조건 안에 이미 포함돼 있으면 그대로 두고(불필요한 재조회 방지), 아니면 필터의 첫 구단으로 맞춘다.
  const statsTeam = teamFilterActive ? (fTeam.includes(effectiveTeam) ? effectiveTeam : fTeam[0]) : effectiveTeam;
  const {
    items: statItems,
    error: statsError,
    loaded: statsLoaded,
    retry: retryStats,
  } = usePlayerStats(isList, statsTeam);

  const statsById = useMemo(() => new Map(statItems.map((s) => [s.id, s])), [statItems]);

  // 스탯은 statsTeam 하나만 있어 다른 구단이 섞인 결과(검색·필터)는 그 구단 몫만 표로 보여준다.
  const listCardRows = useMemo(() => tabRows.filter((r) => r.tm === statsTeam), [tabRows, statsTeam]);
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
  const listScopeKey = `${effectiveTab}:${statsTeam}`;
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
    setFYear([]);
    setFPos([]);
    setFKind([]);
    setOnlyL(false);
    setTab("all");
  }, []);

  // 연대 버튼 — 해당 연대 연도가 전부 선택돼 있으면 전부 해제, 아니면 전부 선택(합집합).
  const handleToggleDecade = useCallback((years) => {
    setFYear((prev) => {
      const allOn = years.every((y) => prev.includes(y));
      return allOn ? prev.filter((y) => !years.includes(y)) : [...new Set([...prev, ...years])];
    });
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
          {selectorDisabled && <option value="__all">{yearAllLabel}</option>}
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
            // 승인 전(ADS_ENABLED=false)엔 세그먼트로 쪼개지 않는다 — 단일 세그먼트(표 전체)라
            // AdSlot 도, hideHead 도 나오지 않아 컬럼 정렬이 어긋나는 원인 자체가 없어진다.
            (ADS_ENABLED ? buildStatsTableSegments(listTable.rows) : [listTable.rows]).flatMap((segment, i) => [
              // 세그먼트 사이(첫 세그먼트 뒤부터)에만 광고 — 카드 그리드와 같은 규칙
              i > 0 && (
                <div key={`stats-ad-${i}`} className={styles.feedAd}>
                  <AdSlot slot={AD_SLOTS.PLAYERS_TABLE} />
                </div>
              ),
              <StatsTable
                key={`stats-seg-${i}`}
                leftCols={listTable.leftCols}
                rightCols={listTable.rightCols}
                rightColWidth={listTable.rightColWidth}
                rows={segment}
                hideHead={i > 0}
              />,
            ])
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
        // 승인 전(ADS_ENABLED=false)엔 세그먼트로 쪼개지 않는다 — 단일 그리드로 이어서 렌더.
        (ADS_ENABLED ? buildCardSegments(sortedPlayers) : [sortedPlayers]).flatMap((segment, i) => [
          // 세그먼트 사이(첫 세그먼트 뒤부터)에만 광고 — 접힌 상태나 화면 최상단엔 절대 두지 않는다
          i > 0 && (
            <div key={`ad-${i}`} className={styles.feedAd}>
              <AdSlot slot={AD_SLOTS.PLAYERS_LIST} />
            </div>
          ),
          <div key={`grid-${i}`} className={styles.grid}>
            {segment.map((p) => (
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
          </div>,
        ])
      )}

      <FilterSheet
        open={filterOpen}
        teams={TEAMS}
        fTeam={fTeam}
        yearDecades={yearDecades}
        fYear={fYear}
        fPos={fPos}
        fKind={fKind}
        onlyL={onlyL}
        onToggleTeam={(t) => setFTeam((prev) => toggle(prev, t))}
        onToggleYear={(y) => setFYear((prev) => toggle(prev, y))}
        onToggleDecade={handleToggleDecade}
        onTogglePos={(p) => setFPos((prev) => toggle(prev, p))}
        onToggleKind={handleToggleKind}
        onTeamAll={() => setFTeam([])}
        onYearAll={() => setFYear([])}
        onPosAll={() => setFPos([])}
        onKindAll={() => setFKind([])}
        onToggleOnlyL={() => setOnlyL((v) => !v)}
        onReset={() => {
          setFTeam([]);
          setFYear([]);
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
