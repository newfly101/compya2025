// domains/players/mobile/PlayerEncyclopediaScreen.jsx
// 1단계(UI 만) — store/thunk 없이 임시 데이터(config/playersLoader.js)로 화면을 완성한다.
// 필터 파이프라인 순서는 design_handoff README 를 그대로 따른다:
// 범위(검색/팀필터/구단연도) → 모달 필터 AND → 재료만 → 탭 카운트 → 정렬.
import { useCallback, useMemo, useState } from "react";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import {
  PLAYERS,
  TEAMS,
  TABS,
  ACTIVE_KINDS,
  getYearsForTeam,
  getPosOrder,
} from "@/domains/players/config/playersLoader";
import GuideView from "./components/guideView/GuideView";
import PlayerCard from "./components/playerCard/PlayerCard";
import FilterSheet from "./components/filterSheet/FilterSheet";
import "./players.tokens.scss";
import styles from "./PlayerEncyclopediaScreen.module.scss";

const toggle = (arr, value) => (arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);

const PlayerEncyclopediaScreen = () => {
  useDomainTopBar("선수 백과사전");

  const [entered, setEntered] = useState(false);
  const [help, setHelp] = useState(false);

  const [team, setTeam] = useState(TEAMS[0] ?? "");
  const [year, setYear] = useState(() => getYearsForTeam(TEAMS[0] ?? "")[0] ?? "");
  const [tab, setTab] = useState("all");
  const [query, setQuery] = useState("");
  const [maxGrade, setMaxGrade] = useState(false);
  const [onlyL, setOnlyL] = useState(false);
  const [openL, setOpenL] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [fTeam, setFTeam] = useState([]);
  const [fPos, setFPos] = useState([]);
  const [fKind, setFKind] = useState([]);

  const years = useMemo(() => getYearsForTeam(team), [team]);

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
      base = PLAYERS.filter((r) => r.tm === team && r.y === year);
    }
    if (teamFiltered) base = base.filter((r) => fTeam.includes(r.tm));
    if (fPos.length) base = base.filter((r) => fPos.includes(r.pos));
    if (fKind.length) base = base.filter((r) => r.kinds.some((k) => fKind.includes(k)));
    if (onlyL) base = base.filter((r) => r.L);
    return base;
  }, [hasQuery, trimmedQuery, teamFiltered, fTeam, fPos, fKind, onlyL, team, year]);

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

  const handleEnter = useCallback(() => {
    setEntered(true);
    setHelp(false);
  }, []);

  const handleOpenHelp = useCallback(() => {
    setHelp(true);
    setFilterOpen(false);
    setOpenL(null);
  }, []);

  const handleTeamChange = useCallback((nextTeam) => {
    const nextYears = getYearsForTeam(nextTeam);
    setTeam(nextTeam);
    setYear((prevYear) => (nextYears.includes(prevYear) ? prevYear : (nextYears[0] ?? "")));
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

  if (!entered || help) {
    return <GuideView primaryLabel={entered ? "확인" : "이용하기"} onSubmit={entered ? () => setHelp(false) : handleEnter} />;
  }

  return (
    <div className={styles.screen}>
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
          value={selectorDisabled ? "__all" : team}
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
          value={selectorDisabled ? "__all" : year}
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
          <button type="button" className={styles.viewGrid} aria-label="카드형">
            <span />
            <span />
            <span />
            <span />
          </button>
          <button type="button" className={styles.viewList} aria-label="리스트형 (준비 중)" disabled>
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
          <button type="button" className={styles.helpPill} onClick={handleOpenHelp}>
            <span className={styles.helpMark}>?</span>도움말
          </button>
          <span>
            <b>{sortedPlayers.length}</b>장
          </span>
        </div>
      </div>

      {sortedPlayers.length === 0 ? (
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
    </div>
  );
};

export default PlayerEncyclopediaScreen;
