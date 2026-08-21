import { useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getYears,
  getRosterPlayers,
  getRosterCoaches,
  getTopGrade,
  expandToCardTiles,
  getTeamTiles,
  SLUG_TO_TEAM,
  ALL_TEAM_SLUG,
} from "@/data/players";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { TEAM_LOGO, getTeamFallbackColor } from "./teamVisuals";
import TeamSelectModal from "./components/teamSelectModal/TeamSelectModal";
import YearSearchDropbox from "./components/yearSearchDropbox/YearSearchDropbox";
import "./players.tokens.scss";
import styles from "./PlayerEncyclopediaScreen.module.scss";

// 기본 구단 — 두산 (선수수 1위 자동 선택 방식은 폐기)
const DEFAULT_TEAM_SLUG = "doosan";

const matchesKeyword = (p, q) => p.name.includes(q) || p.label.includes(q);

// 카드 종류(cardTypes) → 색상 클래스 매핑. 9종 확실히 구분.
const CARD_TYPE_CHIP_CLASS = {
  레전드: "typeLegend",
  에픽: "typeEpic",
  MVP: "typeMvp",
  골든글러브: "typeGoldenGlove",
  올스타: "typeAllstar",
  국가대표: "typeNational",
  시그니처: "typeSignature",
  "연대 시그니처": "typeEraSignature",
  일반: "typeNormal",
};

// 셀의 연도 목록에서 "최신 연도" 우선 기본값. 레전드만 있으면 레전드.
const pickDefaultYearKey = (years) => {
  const latest = years.find((y) => y.year !== null);
  return latest ? String(latest.year) : "legend";
};

const getTeamDisplayName = (slug) => (slug === ALL_TEAM_SLUG ? "전체" : (SLUG_TO_TEAM[slug] ?? null));

const PlayerEncyclopediaScreen = () => {
  useDomainTopBar("선수 백과사전");

  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTab] = useState("player"); // "player" | "coach"
  const [keyword, setKeyword] = useState("");
  const [teamModalOpen, setTeamModalOpen] = useState(false);

  // 구단 선택 모달용 22타일(구단 21 + 전체) — 모듈 로드 시 1회 인덱싱된 값 재사용
  const teamTiles = useMemo(() => getTeamTiles(), []);

  const teamParam = searchParams.get("team");
  const isValidTeamParam = teamParam === ALL_TEAM_SLUG || (!!teamParam && !!SLUG_TO_TEAM[teamParam]);
  const activeTeamSlug = isValidTeamParam ? teamParam : DEFAULT_TEAM_SLUG;
  const teamName = getTeamDisplayName(activeTeamSlug);
  const isAllTeams = activeTeamSlug === ALL_TEAM_SLUG;

  const years = useMemo(() => (activeTeamSlug ? getYears(activeTeamSlug) : []), [activeTeamSlug]);
  const validYearKeys = useMemo(
    () => new Set(years.map((y) => (y.year === null ? "legend" : String(y.year)))),
    [years]
  );

  const yearParam = searchParams.get("year");
  const activeYearKey = yearParam && validYearKeys.has(yearParam) ? yearParam : pickDefaultYearKey(years);

  const handleTeamSelect = useCallback(
    (slug) => {
      const next = new URLSearchParams(searchParams);
      next.set("team", slug);
      next.delete("year"); // 새 구단 진입 시 최신 연도로 재계산
      setSearchParams(next);
      setTeamModalOpen(false);
    },
    [searchParams, setSearchParams]
  );

  const handleYearSelect = useCallback(
    (yearKey) => {
      const next = new URLSearchParams(searchParams);
      next.set("team", activeTeamSlug);
      next.set("year", yearKey);
      setSearchParams(next);
    },
    [searchParams, setSearchParams, activeTeamSlug]
  );

  const rosterPlayers = useMemo(() => {
    if (!teamName || !activeTeamSlug) return [];
    const yearParamValue = activeYearKey === "legend" ? null : Number(activeYearKey);
    return getRosterPlayers(activeTeamSlug, yearParamValue);
  }, [activeTeamSlug, activeYearKey, teamName]);

  const rosterCoaches = useMemo(() => {
    if (!teamName || !activeTeamSlug) return [];
    const yearParamValue = activeYearKey === "legend" ? null : Number(activeYearKey);
    return getRosterCoaches(activeTeamSlug, yearParamValue);
  }, [activeTeamSlug, activeYearKey, teamName]);

  // 선수 탭이 비어있으면 코치 탭으로 폴백 — effect 없이 파생값으로 계산
  const effectiveTab = rosterPlayers.length === 0 && rosterCoaches.length > 0 ? "coach" : tab;
  const activeRoster = effectiveTab === "coach" ? rosterCoaches : rosterPlayers;

  const trimmedKeyword = keyword.trim();
  const filteredRoster = useMemo(() => {
    if (!trimmedKeyword) return activeRoster;
    return activeRoster.filter((p) => matchesKeyword(p, trimmedKeyword));
  }, [activeRoster, trimmedKeyword]);

  // 카드별 타일로 펼침 — 레코드 1개가 cardTypes 개수만큼 개별 타일이 된다.
  const tiles = useMemo(() => expandToCardTiles(filteredRoster), [filteredRoster]);

  if (teamTiles.length === 0) {
    return (
      <div className={styles.screen}>
        <p className={styles.emptyText}>등록된 구단이 없습니다.</p>
      </div>
    );
  }

  const emptyMessage = trimmedKeyword
    ? "검색 결과가 없습니다."
    : effectiveTab === "coach"
      ? "등록된 코치가 없습니다."
      : "등록된 선수가 없습니다.";

  const triggerLogo = !isAllTeams ? TEAM_LOGO[activeTeamSlug] : null;

  return (
    <div className={styles.screen}>
      <div className={styles.selectorRow}>
        <button
          type="button"
          className={styles.teamTrigger}
          onClick={() => setTeamModalOpen(true)}
        >
          {triggerLogo ? (
            <img className={styles.triggerLogo} src={triggerLogo} alt="" />
          ) : (
            <span
              className={styles.triggerLogoFallback}
              style={{
                backgroundColor: isAllTeams ? "var(--color-brand)" : getTeamFallbackColor(activeTeamSlug),
              }}
              aria-hidden="true"
            >
              {(teamName ?? "?").slice(0, 1)}
            </span>
          )}
          <span className={styles.triggerLabel}>{teamName ?? "구단 선택"}</span>
          <span className={styles.triggerCaret} aria-hidden="true">
            ▾
          </span>
        </button>

        <YearSearchDropbox years={years} activeYearKey={activeYearKey} onSelect={handleYearSelect} />
      </div>

      <TeamSelectModal
        open={teamModalOpen}
        tiles={teamTiles}
        activeSlug={activeTeamSlug}
        onSelect={handleTeamSelect}
        onClose={() => setTeamModalOpen(false)}
      />

      <div className={styles.tabRow}>
        <button
          type="button"
          className={`${styles.tab} ${effectiveTab === "player" ? styles.tabActive : ""}`}
          onClick={() => setTab("player")}
          disabled={rosterPlayers.length === 0}
        >
          선수 {rosterPlayers.length}
        </button>
        <button
          type="button"
          className={`${styles.tab} ${effectiveTab === "coach" ? styles.tabActive : ""}`}
          onClick={() => setTab("coach")}
          disabled={rosterCoaches.length === 0}
        >
          코치 {rosterCoaches.length}
        </button>
      </div>

      <div className={styles.searchWrap}>
        <div className={styles.searchInputBox}>
          <span className={styles.searchIcon} aria-hidden="true">
            🔍
          </span>
          <input
            className={styles.searchInput}
            placeholder="이름 검색"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      {rosterPlayers.length === 0 && rosterCoaches.length === 0 ? (
        <p className={styles.emptyText}>등록된 선수가 없습니다.</p>
      ) : tiles.length === 0 ? (
        <p className={styles.emptyText}>{emptyMessage}</p>
      ) : (
        <div className={styles.grid}>
          {tiles.map(({ tileId, player, cardType }) => {
            const topGrade = getTopGrade(player);
            const typeClass = styles[CARD_TYPE_CHIP_CLASS[cardType]] ?? styles.typeNormal;
            return (
              <div key={tileId} className={styles.card}>
                <span className={styles.cardLabel}>{player.label}</span>
                {player.label !== player.name && (
                  <span className={styles.cardName}>{player.name}</span>
                )}
                {isAllTeams && <span className={styles.cardTeam}>{player.team}</span>}
                <div className={styles.cardMetaRow}>
                  <span className={`${styles.chip} ${typeClass}`}>{cardType}</span>
                  <span className={styles.topGradeText}>{topGrade}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PlayerEncyclopediaScreen;
