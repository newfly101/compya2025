import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/pages/historyMode/legendCalendar.module.scss";
import { legendStuff } from "@/data/historyMode/LegendStuff.js";

const LegendCalendar = () => {
  const [query, setQuery] = useState("");
  const [focusedDay, setFocusedDay] = useState(null);
  const [isAutoOpen, setIsAutoOpen] = useState(false);
  const wrapperRef = useRef(null);

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
          });
        }
      });
    });

    console.log("result : ", result);
    return result;
  }, [query]);

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
    <div ref={wrapperRef} className={styles.legendWrapper}>
      {/* 🔍 검색 */}
      <input
        className={styles.legendSearch}
        placeholder="레전드 이름 검색 (예: 김시진)"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setFocusedDay(null);
          setIsAutoOpen(true);
        }}
      />

      {/* 자동완성 */}
      {isAutoOpen && query && autoCompleteList.length > 0 && (
        <div className={styles.autoComplete}>
          {autoCompleteList.map((name) => {
            return (
              <div
                key={`legend-${name}`}
                className={styles.autoCompleteItem}
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

      {/* 📅 14일 캘린더 */}
      <div className={styles.calendarGrid}>
        {days.map((day) => (
          <div
            key={`history-${day}`}
            className={`${styles.calendarCell}
              ${activeDays.has(day) ? styles.active : ""}
              ${focusedDay === day ? styles.focused : ""}
            `}
          >
            <div className={styles.dayLabel}>Day {day}</div>
            {dayCountMap[day] && (
              <div className={styles.dot}>
                ● {dayCountMap[day]}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LegendCalendar;
