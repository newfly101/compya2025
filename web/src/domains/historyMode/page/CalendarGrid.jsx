import React from "react";
import styles from "./legendCalendar.module.scss";
import { formatDateLabel, isSameDate } from "@/global/utils/DateFormatt.js";

const CalendarGrid = ({ calendarDates, activeDays, searchResultMap, dayCountMap, query }) => {
  return (
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
            <div className={styles.dayLabel}>{formatDateLabel(date)}</div>
            <div className={styles.subLabel}>{cycleDay}일차</div>

            {query && players && (
              <ul className={styles.playerList}>
                {players.map(({ player, years, roaster }, idx) => (
                  <li key={`${cycleDay}-${player}-${idx}`}>
                    {roaster}: {player}'{String(years).slice(-2)}
                  </li>
                ))}
              </ul>
            )}

            {!query && dayCountMap[cycleDay] && (
              <div className={styles.dot}>● {dayCountMap[cycleDay]}</div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CalendarGrid;
