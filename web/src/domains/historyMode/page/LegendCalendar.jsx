import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/domains/historyMode/page/legendCalendar.module.scss";
import { legendStuff } from "@/data/historyMode/LegendStuff.js";
import { formatDateLabel, isSameDate } from "@/global/utils/DateFormatt.js";
import { useNavigate } from "react-router-dom";

const LegendCalendar = () => {
  const [query, setQuery] = useState("");
  const [focusedDay, setFocusedDay] = useState(null);
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  const wrapperRef = useRef(null);
  const [highlightIndex, setHighlightIndex] = useState(0);


  const navigate = useNavigate();

  const handleMoveUrl = () => {
    navigate("/");
  };

  const handleUseKeyBoard = (e) => {
    if (!isAutoOpen) return;

    // ⬇️ 아래 화살표
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) =>
        Math.min(prev + 1, autoCompleteList.length - 1),
      );
    }

    // ⬆️ 위 화살표
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
    }

    // ⏎ Enter
    if (e.key === "Enter") {
      e.preventDefault();

      if (autoCompleteList.length > 0) {
        const index =
          highlightIndex >= 0 &&
          highlightIndex < autoCompleteList.length
            ? highlightIndex
            : 0;

        setQuery(autoCompleteList[index]);
      }

      setIsAutoOpen(false);
    }

    // ⎋ ESC
    if (e.key === "Escape") {
      setIsAutoOpen(false);
    }
  };

  const CYCLE_LENGTH = 14;
  const CYCLE_START_DATE = new Date("2026-01-05"); // 1일차 기준


  const getCycleDayByDate = (date) => {
    const diffTime = date.getTime() - CYCLE_START_DATE.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    // 음수 방지 + 1~14 보장
    return ((diffDays % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH + 1;
  };

  const calendarDates = useMemo(() => {
    const today = new Date();

    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      return {
        date,
        cycleDay: getCycleDayByDate(date),
      };
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target)
      ) {
        setIsAutoOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /** Day 1 ~ 14 고정 */
  const days = useMemo(
    () => Array.from({ length: 14 }, (_, i) => i + 1),
    [],
  );

  const legendList = useMemo(() => {
    const set = new Set();
    legendStuff.forEach((event) => {
      event.item.forEach((it) => {
        if (it.legend) set.add(it.legend);
      });
    });
    return Array.from(set);
  }, []);

  /** 🔍 자동완성 */
  const autoCompleteList = useMemo(() => {
    if (!query) return [];
    return legendList.filter((name) =>
      name.includes(query),
    );
  }, [query, legendList]);

  /** 🔍 검색 결과 */
  const searchResults = useMemo(() => {
    if (!query) return [];

    const result = [];
    legendStuff.forEach((event) => {
      event.item.forEach((it) => {
        if (it.legend?.includes(query)) {
          result.push({
            day: event.day,
            player: it.player,
            years: it.years,
            roaster: event.roaster,
          });
        }
      });
    });

    console.log("result : ", result);
    return result;
  }, [query]);

  const searchResultMap = useMemo(() => {
    const map = {};

    searchResults.forEach(({ day, player, years, roaster }) => {
      if (!map[day]) {
        map[day] = [];
      }
      map[day].push({ player, years, roaster });
    });

    return map;
  }, [searchResults]);


  /** 검색 결과 기반 활성 Day */
  const activeDays = useMemo(() => {
    return new Set(searchResults.map((r) => r.day));
  }, [searchResults]);

  /** Day별 이벤트 수 */
  const dayCountMap = useMemo(() => {
    const map = {};
    legendStuff.forEach((e) => {
      map[e.day] = (map[e.day] ?? 0) + e.item.length;
    });
    return map;
  }, []);

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.category} onClick={handleMoveUrl}>← 메인으로</span>
        <h1 className={styles.title}>히스토리모드 재료 탐색기</h1>

        <div className={styles.meta}>
          <span>2026-01-12</span>
          <span>v0.1.8</span>
        </div>
      </header>
      <div ref={wrapperRef} className={styles.legendWrapper}>
        {/* 🔍 검색 */}
        <div className={styles.searchWrapper}>
          <input
            className={styles.legendSearch}
            placeholder="레전드 이름 검색 (예: 김시진)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setFocusedDay(null);
              setIsAutoOpen(true);
            }}
            onKeyDown={(e) => handleUseKeyBoard(e)}
          />

          {query && (
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setQuery("");
                setIsAutoOpen(false);
                setFocusedDay(null);
              }}
              aria-label="검색 삭제"
            >
              ✕
            </button>
          )}

          {/* 자동완성 */}
          {isAutoOpen && query && autoCompleteList.length > 0 && (
            <div className={styles.autoComplete}>
              {autoCompleteList.map((name, idx) => {
                return (
                  <div
                    key={`legend-${name}`}
                    className={`${styles.autoCompleteItem}
                                ${idx === highlightIndex ? styles.highlighted : ""} `}
                    onClick={() => {
                      setQuery(name);
                      setIsAutoOpen(false);
                    }}
                  >
                    {name}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 📅 14일 캘린더 */}
        <div className={styles.calendarGrid}>
          {calendarDates.map(({ date, cycleDay }) => {
            const players = searchResultMap[cycleDay];
            const today = isSameDate(date, new Date());

            return (
              <div
                key={date.toISOString()}
                className={`${styles.calendarCell}
          ${activeDays.has(cycleDay) ? styles.active : ""}
          ${today ? styles.focused : ""}
        `}
              >
                {/* 실제 날짜 */}
                <div className={styles.dayLabel}>
                  {formatDateLabel(date)}
                </div>

                {/* 내부적으로는 주기 day */}
                <div className={styles.subLabel}>
                  {cycleDay}일차
                </div>

                {/* 🔍 검색 중일 때만 선수 리스트 */}
                {query && players && (
                  <ul className={styles.playerList}>
                    {players.map(({ player, years, roaster }, idx) => (
                      <li key={`${cycleDay}-${player}-${idx}`}>
                        {roaster}: {player}'{String(years).slice(-2)}
                      </li>
                    ))}
                  </ul>
                )}

                {/* 🔵 기본 상태 */}
                {!query && dayCountMap[cycleDay] && (
                  <div className={styles.dot}>
                    ● {dayCountMap[cycleDay]}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
};

export default LegendCalendar;
