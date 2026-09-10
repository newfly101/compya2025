// domains/players/mobile/PlayerEncyclopediaScreen.jsx
// 4단계 — store 연동. 「이용하기」로 entered 가 true 가 될 때만 API 를 부른다(진입 즉시 호출 금지).
// 필터 파이프라인 순서는 design_handoff README 를 그대로 따른다:
// 범위(검색/팀필터/구단연도) → 모달 필터 AND → 재료만 → 탭 카운트 → 정렬.
import { useCallback, useMemo, useState } from "react";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { usePlayerCards } from "./hooks/usePlayerCards";
import {
  TABS,
  ACTIVE_KINDS,
  getTeams,
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

  const { items: PLAYERS, error, loaded, retry } = usePlayerCards(entered);

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

  // 데이터 로드 전엔 team/year 가 비어 있다 — 로드되면 TEAMS[0]/그 구단의 첫 연도로 자연히 채워진다.
  const effectiveTeam = team || TEAMS[0] || "";
  const years = useMemo(() => getYearsForTeam(PLAYERS, effectiveTeam), [PLAYERS, effectiveTeam]);
  const effectiveYear = years.includes(year) ? year : (years[0] ?? "");

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
    if (fPos.length) base = base.filter((r) => fPos.includes(r.pos));
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

  const handleEnter = useCallback(() => {
    setEntered(true);
    setHelp(false);
  }, []);

  const handleOpenHelp = useCallback(() => {
    setHelp(true);
    setFilterOpen(false);
    setOpenL(null);
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
    </div>
  );
};

export default PlayerEncyclopediaScreen;
