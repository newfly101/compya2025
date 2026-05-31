import { useEffect, useRef } from "react";
import "./historyMode.tokens.scss";
import Chip from "./components/chip/Chip.jsx";
import StageCard from "./components/stageCard/StageCard.jsx";
import { useHistoryMode } from "./hooks/useHistoryMode.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import styles from "./HistoryModeScreen.module.scss";

const POSITIONS = [
  { key: "all", label: "전체" },
  { key: "타자", label: "타자" },
  { key: "투수", label: "투수" },
];

const HistoryModeScreen = () => {
  useDomainTopBar("히스토리 재료 탐색기");
  const autoCompleteWrapRef = useRef(null);
  const {
    inputValue,
    query,
    isAutoOpen,
    highlightIndex,
    positionFilter,
    teamFilter,
    selectedStage,
    availableTeams,
    teamCountMap,
    filteredLegendList,
    autoCompleteList,
    allMatchedStages,
    playerStats,
    selectedLegendMeta,
    setIsAutoOpen,
    handleQueryChange,
    handleSelectSuggestion,
    handleClear,
    handleKeyDown,
    handlePositionChange,
    handleTeamChange,
    handleSelectStage,
  } = useHistoryMode();

  useEffect(() => {
    if (!isAutoOpen) return;
    const handleClickOutside = (e) => {
      if (
        autoCompleteWrapRef.current &&
        !autoCompleteWrapRef.current.contains(e.target)
      ) {
        setIsAutoOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAutoOpen, setIsAutoOpen]);

  const hasQuery = Boolean(query);
  const hasResults = hasQuery && allMatchedStages.length > 0;
  const isStageSelected = Boolean(selectedStage);
  const showLegendRow = teamFilter !== "all";

  return (
    <main className={styles.page}>
      <div className={styles.body}>
        {isStageSelected && selectedLegendMeta ? (
          <div className={styles.compactBar}>
            <span className={styles.compactIcon}>🔍</span>
            <span className={styles.compactQuery}>{query}</span>
            <span className={styles.compactSub}>
              {selectedLegendMeta.team} · {selectedLegendMeta.position}
            </span>
            <button
              type="button"
              className={styles.compactClear}
              onClick={handleClear}
              aria-label="검색 해제"
            >
              ✕
            </button>
          </div>
        ) : (
          <section className={styles.filterSection}>
            <div ref={autoCompleteWrapRef} className={styles.searchWrap}>
              <div className={styles.searchInputBox}>
                <span className={styles.searchIcon}>🔍</span>
                <input
                  className={styles.searchInput}
                  placeholder="레전드 선수 이름 검색"
                  value={inputValue}
                  onChange={(e) => handleQueryChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setIsAutoOpen(true)}
                />
                {inputValue && (
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

              {isAutoOpen && inputValue && autoCompleteList.length > 0 && (
                <ul className={styles.autoComplete}>
                  {autoCompleteList.map((name, idx) => (
                    <li
                      key={`ac-${name}`}
                      className={`${styles.autoCompleteItem} ${
                        idx === highlightIndex ? styles.highlighted : ""
                      }`}
                      onClick={() => handleSelectSuggestion(name)}
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>포지션 :</span>
              <div className={styles.chipRow}>
                {POSITIONS.map((p) => (
                  <Chip
                    key={p.key}
                    label={p.label}
                    selected={positionFilter === p.key}
                    onClick={() => handlePositionChange(p.key)}
                  />
                ))}
              </div>
            </div>

            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>구단 :</span>
              <div className={styles.chipWrap}>
                {availableTeams.map((team) => (
                  <Chip
                    key={team}
                    label={team}
                    count={teamCountMap[team]}
                    selected={teamFilter === team}
                    fixedWidth
                    onClick={() => handleTeamChange(team)}
                  />
                ))}
              </div>
            </div>

            {showLegendRow && (
              <div className={styles.filterRow}>
                <span className={styles.filterLabel}>레전드 :</span>
                <div className={styles.chipWrap}>
                  {filteredLegendList.map((name) => (
                    <Chip
                      key={name}
                      label={name}
                      selected={query === name}
                      fixedWidth
                      onClick={() => handleSelectSuggestion(name)}
                    />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {!hasQuery && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>⚾</span>
            <p className={styles.emptyText}>
              레전드 선수 이름을 검색하거나 하단의 레전드 칩을 클릭하세요
            </p>
          </div>
        )}

        {hasQuery && !hasResults && (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🔍</span>
            <p className={styles.emptyText}>
              {`${query} 선수가 레전드 재료로\n등장하는 세션이 없습니다`}
            </p>
          </div>
        )}

        {hasResults && (
          <>
            <article className={styles.summary}>
              <span className={styles.summaryStrip} aria-hidden="true" />
              <div className={styles.summaryTagRow}>
                <span className={styles.summaryTag}>레전드 재료</span>
                <span className={styles.summaryTagAccent}>
                  총 {playerStats.totalSessions}개 세션
                </span>
              </div>

              <h2 className={styles.summaryName}>{query}</h2>
              {selectedLegendMeta && (
                <p className={styles.summarySub}>
                  {selectedLegendMeta.team} · {selectedLegendMeta.position}
                </p>
              )}

              <div className={styles.divider} />

              <div className={styles.summaryMatHead}>
                <span className={styles.summaryMatLabel}>필요 재료 카드</span>
                <span className={styles.summaryMatCount}>
                  {playerStats.materials.length}종
                </span>
              </div>

              <ul className={styles.summaryMatList}>
                {playerStats.materials.map((m, idx) => (
                  <li key={m.combo} className={styles.summaryMatItem}>
                    <span className={styles.summaryMatIndex}>{idx + 1}.</span>
                    <span className={styles.summaryMatName}>{m.combo}</span>
                    <span className={styles.summaryMatDay}>Day {m.day}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.divider} />

              <div className={styles.summaryRow}>
                <span className={styles.summaryRowIcon}>📅</span>
                <span className={styles.summaryRowLabel}>등장 Day</span>
                <span className={styles.summaryRowValue}>
                  {playerStats.days.map((d) => `Day ${d}`).join(", ")}
                </span>
              </div>
              <div className={styles.summaryRow}>
                <span className={styles.summaryRowIcon}>🎯</span>
                <span className={styles.summaryRowLabel}>획득 세션 수</span>
                <span className={styles.summaryRowValue}>
                  {playerStats.totalSessions}개
                </span>
              </div>
            </article>

            <div className={styles.sectionHead}>
              <span className={styles.sectionHeadBar} aria-hidden="true" />
              <h2 className={styles.sectionHeadTitle}>
                획득 가능 히스토리 스테이지
              </h2>
              <span className={styles.sectionHeadCount}>
                {allMatchedStages.length}개
              </span>
            </div>

            <ul className={styles.stageList}>
              {allMatchedStages.map((stage) => {
                const isSelected =
                  selectedStage?.day === stage.day &&
                  selectedStage?.roaster === stage.roaster;
                return (
                  <li
                    key={`${stage.day}-${stage.roaster}`}
                    className={styles.stageListItem}
                  >
                    <StageCard
                      stage={stage}
                      query={query}
                      isSelected={isSelected}
                      onClick={() => handleSelectStage(stage)}
                    />
                  </li>
                );
              })}
            </ul>

            <div className={styles.sectionHead}>
              <span className={styles.sectionHeadBar} aria-hidden="true" />
              <h2 className={styles.sectionHeadTitle}>세션 상세 정보</h2>
            </div>

            {isStageSelected ? (
              <article className={styles.detail}>
                <span className={styles.detailTag}>SELECTED STAGE</span>
                <h3 className={styles.detailTitle}>
                  Day {selectedStage.day} · 세션 {selectedStage.roaster}
                </h3>
                <p className={styles.detailSubtitle}>{selectedStage.name}</p>

                <div className={styles.divider} />

                <p className={styles.detailSectionLabel}>세션 재료 선수 목록</p>

                {(() => {
                  const items = selectedStage.item.filter((it) => it.legend);
                  if (items.length === 0) {
                    return (
                      <p className={styles.detailEmpty}>
                        이 세션에는 히스토리 재료가 없습니다
                      </p>
                    );
                  }
                  return (
                    <ul className={styles.playerList}>
                      {items.map((it, i) => {
                        const isTarget = it.legend === query;
                        return (
                          <li
                            key={i}
                            className={`${styles.playerRow} ${
                              isTarget ? styles.playerRowTarget : ""
                            }`}
                          >
                            <span
                              className={`${styles.playerLegend} ${
                                isTarget ? styles.playerLegendTarget : ""
                              }`}
                            >
                              {it.legend}
                            </span>
                            <span
                              className={`${styles.playerArrow} ${
                                isTarget ? styles.playerArrowTarget : ""
                              }`}
                            >
                              ▶
                            </span>
                            <span
                              className={`${styles.playerName} ${
                                isTarget ? styles.playerNameTarget : ""
                              }`}
                            >
                              {`${it.player}'${String(it.years).slice(-2)}`}
                            </span>
                            {isTarget && (
                              <span className={styles.playerTargetTag}>
                                ⭐ 목표
                              </span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  );
                })()}
              </article>
            ) : (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>📋</span>
                <p className={styles.emptyText}>
                  스테이지를 선택하면 세션 상세 정보가 표시됩니다
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default HistoryModeScreen;
