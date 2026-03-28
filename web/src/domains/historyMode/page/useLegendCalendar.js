import { useMemo } from "react";
import { legendStuff } from "@/data/historyMode/LegendStuff.js";

const CYCLE_LENGTH = 14;
const CYCLE_START_DATE = new Date("2026-01-05");

const getCycleDayByDate = (date) => {
  const diffTime = date.getTime() - CYCLE_START_DATE.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return ((diffDays % CYCLE_LENGTH) + CYCLE_LENGTH) % CYCLE_LENGTH + 1;
};

export const useLegendCalendar = () => {
  const calendarDates = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 14 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      return { date, cycleDay: getCycleDayByDate(date) };
    });
  }, []);

  const dayCountMap = useMemo(() => {
    const map = {};
    legendStuff.forEach((e) => {
      map[e.day] = (map[e.day] ?? 0) + e.item.length;
    });
    return map;
  }, []);

  return { calendarDates, dayCountMap };
};
