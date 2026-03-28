import React, { useEffect, useRef } from "react";
import styles from "./legendCalendar.module.scss";
import { useNavigate } from "react-router-dom";
import { useLegendSearch } from "./useLegendSearch.js";
import { useLegendCalendar } from "./useLegendCalendar.js";
import CalendarGrid from "./CalendarGrid.jsx";

const LegendCalendar = () => {
  const navigate = useNavigate();
  const wrapperRef = useRef(null);

  const {
    query,
    isAutoOpen,
    highlightIndex,
    autoCompleteList,
    searchResultMap,
    activeDays,
    setIsAutoOpen,
    handleQueryChange,
    handleSelectSuggestion,
    handleClear,
    handleKeyDown,
  } = useLegendSearch();

  const { calendarDates, dayCountMap } = useLegendCalendar();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsAutoOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsAutoOpen]);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.category} onClick={() => navigate("/")}>
          ← 메인으로
        </span>
        <h1 className={styles.title}>히스토리모드 재료 탐색기</h1>
        <div className={styles.meta}>
          <span>2026-01-12</span>
          <span>v0.1.8</span>
        </div>
      </header>

      <div ref={wrapperRef} className={styles.legendWrapper}>
        <div className={styles.searchWrapper}>
          <input
            className={styles.legendSearch}
            placeholder="레전드 이름 검색 (예: 김시진)"
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

          {isAutoOpen && query && autoCompleteList.length > 0 && (
            <div className={styles.autoComplete}>
              {autoCompleteList.map((name, idx) => (
                <div
                  key={`legend-${name}`}
                  className={`${styles.autoCompleteItem} ${idx === highlightIndex ? styles.highlighted : ""}`}
                  onClick={() => handleSelectSuggestion(name)}
                >
                  {name}
                </div>
              ))}
            </div>
          )}
        </div>

        <CalendarGrid
          calendarDates={calendarDates}
          activeDays={activeDays}
          searchResultMap={searchResultMap}
          dayCountMap={dayCountMap}
          query={query}
        />
      </div>
    </main>
  );
};

export default LegendCalendar;
