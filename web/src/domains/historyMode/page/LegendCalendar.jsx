import React, { useEffect, useRef } from "react";
import styles from "./LegendCalendar.module.scss";
import { useNavigate } from "react-router-dom";
import { useLegendSearch } from "./useLegendSearch.js";

const POSITIONS = ["전체", "타자", "투수"];

const LegendCalendar = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const {
    query,
    isAutoOpen,
    highlightIndex,
    autoCompleteList,
    allMatchedStages,
    selectedStage,
    playerStats,
    positionFilter,
    teamFilter,
    availableTeams,
    filteredLegendList,
    fmt,
    setIsAutoOpen,
    handleQueryChange,
    handleSelectSuggestion,
    handleClear,
    handleKeyDown,
    handlePositionChange,
    handleTeamChange,
    handleSelectStage,
  } = useLegendSearch();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsAutoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsAutoOpen]);

  useEffect(() => {
    if (allMatchedStages.length > 0) {
      handleSelectStage(allMatchedStages[0]);
    } else {
      handleSelectStage(null);
    }
  }, [allMatchedStages]);

  const hasResults = allMatchedStages.length > 0;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.category} onClick={() => navigate("/")}>
          ← 메인으로
        </span>
        <h1 className={styles.title}>히스토리모드 재료 탐색기</h1>
        <div className={styles.meta}>
          <span>2026-01-12</span>
          <span>v0.2.0</span>
        </div>
      </header>

      {/* 검색 + 필터 섹션 */}
      <section className={styles.searchSection}>
        {/* 검색창 */}
        <div ref={wrapperRef} className={styles.searchBar}>
          <div className={styles.searchInputWrap}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              className={styles.searchInput}
              placeholder="레전드 선수 이름 검색"
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            {query && (
              <button
                type="button"
                className={styles.clearButton}
                onClick={handleClear}
                aria-label="검색 삭제"
              >
                ✕
              </button>
            )}
          </div>

          {isAutoOpen && query && autoCompleteList.length > 0 && (
            <div className={styles.autoComplete}>
              {autoCompleteList.map((name, idx) => (
                <div
                  key={`ac-${name}`}
                  className={`${styles.autoCompleteItem} ${idx === highlightIndex ? styles.highlighted : ""}`}
                  onClick={() => handleSelectSuggestion(name)}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 포지션 탭 */}
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>포지션 :</span>
          <div className={styles.positionTabs}>
            {POSITIONS.map((pos) => {
              const key = pos === "전체" ? "all" : pos;
              return (
                <button
                  key={pos}
                  className={`${styles.positionTab} ${positionFilter === key ? styles.active : ""}`}
                  onClick={() => handlePositionChange(key)}
                >
                  {pos}
                </button>
              );
            })}
          </div>
        </div>

        {/* 구단 필터 */}
        <div className={styles.filterRow}>
          <span className={styles.filterLabel}>구단 :</span>
          <div className={styles.teamPills}>
            {availableTeams.map((team) => (
              <button
                key={team}
                className={`${styles.teamPill} ${teamFilter === team ? styles.active : ""}`}
                onClick={() => handleTeamChange(team)}
              >
                {team}
              </button>
            ))}
          </div>
        </div>

        {/* 레전드 칩 */}
        <div className={styles.legendRow}>
          <span className={styles.filterLabel}>레전드 :</span>
          <div className={styles.legendChips}>
            {filteredLegendList.map((name) => (
              <span
                key={name}
                className={`${styles.legendChip} ${query === name ? styles.active : ""}`}
                onClick={() => handleSelectSuggestion(name)}
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* 메인 레이아웃 */}
      <div className={styles.mainLayout}>
        {/* 좌측 패널 */}
        <div className={styles.leftPanel}>
          {!query && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>⚾</div>
              <p className={styles.emptyText}>
                레전드 선수 이름을 검색하거나
                <br />
                하단의 레전드 칩을 클릭하세요
              </p>
            </div>
          )}

          {query && !hasResults && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>🔍</div>
              <p className={styles.emptyText}>
                <strong>{query}</strong> 선수가 레전드 재료로
                <br />
                등장하는 세션이 없습니다
              </p>
            </div>
          )}

          {query && hasResults && playerStats && (
            <>
              {/* 선수 카드 */}
              <div className={styles.playerCard}>
                <div className={styles.playerHeader}>
                  <div className={styles.playerAvatar}>
                    ⚾
                    <span className={styles.avatarTag}>LEGEND</span>
                  </div>
                  <div className={styles.playerInfo}>
                    <div className={styles.playerTags}>
                      <span className={styles.tagLegend}>레전드 재료</span>
                      <span className={styles.tagCount}>
                        총 {playerStats.totalSessions}개 세션
                      </span>
                    </div>
                    <div className={styles.playerName}>{query}</div>
                    <div className={styles.playerSub}>
                      재료 카드:{" "}
                      <strong className={styles.goldText}>
                        {playerStats.uniqueCombos.join(", ")}
                      </strong>
                    </div>
                  </div>
                </div>

                <div className={styles.matSummary}>
                  <div className={styles.matSumItem}>
                    <div className={styles.matSumIcon}>📅</div>
                    <div>
                      <div className={styles.matSumLabel}>등장 Day</div>
                      <div className={styles.matSumVal}>
                        {playerStats.days.map((d) => `Day ${d}`).join(", ")}
                      </div>
                    </div>
                  </div>
                  <div className={styles.matSumItem}>
                    <div className={styles.matSumIcon}>🎯</div>
                    <div>
                      <div className={styles.matSumLabel}>총 세션 수</div>
                      <div className={styles.matSumVal}>
                        {playerStats.totalSessions}개
                      </div>
                    </div>
                  </div>
                  <div className={styles.matSumItem}>
                    <div className={styles.matSumIcon}>🃏</div>
                    <div>
                      <div className={styles.matSumLabel}>재료 카드 종류</div>
                      <div className={styles.matSumVal}>
                        {playerStats.uniqueCombos.length}종
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 결과 목록 */}
              <div className={styles.resultList}>
                <div className={styles.resultsHeader}>
                  <span className={styles.resultsTitle}>
                    획득 가능 히스토리 스테이지
                  </span>
                  <span className={styles.resultsCount}>
                    {allMatchedStages.length}개
                  </span>
                </div>

                {allMatchedStages.map((stage) => {
                  const targetItems = stage.item.filter(
                    (it) => it.legend === query
                  );
                  const otherItems = stage.item.filter(
                    (it) => it.legend && it.legend !== query
                  );
                  const isSelected =
                    selectedStage?.day === stage.day &&
                    selectedStage?.roaster === stage.roaster;

                  return (
                    <div
                      key={`${stage.day}-${stage.roaster}`}
                      className={`${styles.resultItem} ${isSelected ? styles.selected : ""}`}
                      onClick={() => handleSelectStage(stage)}
                    >
                      <div className={styles.resultBadge}>
                        Day {stage.day}
                        <br />
                        세션 {stage.roaster}
                      </div>
                      <div className={styles.resultMain}>
                        <div className={styles.resultName}>{stage.name}</div>
                        <div className={styles.resultStageSub}>
                          Day {stage.day} · 세션 {stage.roaster} · 재료{" "}
                          {stage.item.length}슬롯
                        </div>
                        <div className={styles.playerChips}>
                          {targetItems.map((it, i) => (
                            <span
                              key={i}
                              className={`${styles.playerChip} ${styles.highlight}`}
                            >
                              ⭐ {fmt(it.player, it.years)}
                            </span>
                          ))}
                          {otherItems.map((it, i) => (
                            <span key={i} className={styles.playerChip}>
                              {fmt(it.player, it.years)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* 우측 패널 */}
        <div className={styles.rightPanel}>
          <div className={styles.acquireCard}>
            {!selectedStage ? (
              <p className={styles.emptyRight}>
                👈 스테이지를 선택하면
                <br />
                세션 상세 정보가 표시됩니다
              </p>
            ) : (
              <>
                <div className={styles.selectedLabel}>SELECTED STAGE</div>
                <div className={styles.selectedVal}>
                  Day {selectedStage.day} · 세션 {selectedStage.roaster}
                </div>
                <div className={styles.selectedName}>{selectedStage.name}</div>

                <div className={styles.panelSectionTitle}>세션 재료 선수 목록</div>
                <div className={styles.sessionPlayers}>
                  {selectedStage.item.filter((it) => it.legend).length === 0 ? (
                    <p className={styles.noMaterial}>
                      이 세션에는 히스토리 재료가 없습니다
                    </p>
                  ) : (
                    selectedStage.item
                      .filter((it) => it.legend)
                      .map((it, i) => {
                        const isTarget = it.legend === query;
                        return (
                          <div key={i} className={styles.spItem}>
                            <div className={styles.spLeft}>
                              <span className={styles.spLegendName}>
                                {it.legend}
                              </span>
                              <span className={styles.spArrow}>▶</span>
                              <span
                                className={`${styles.spPlayerName} ${isTarget ? styles.isTarget : ""}`}
                              >
                                {fmt(it.player, it.years)}
                              </span>
                            </div>
                            {isTarget && (
                              <span className={styles.spTargetBadge}>
                                ⭐ 목표
                              </span>
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default LegendCalendar;
