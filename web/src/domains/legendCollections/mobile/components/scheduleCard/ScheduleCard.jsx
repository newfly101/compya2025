import { useMemo, useState } from "react";
import { teamColor } from "@/domains/legendStats/config/legendStats.js";
import {
  cycleDateLabel,
  cycleRangeLabel,
  groupSchedule,
  todayDayNo,
  todayLabel,
} from "@/domains/legendCollections/config/legendCollections.js";
import LegendBadge from "@/domains/legendCollections/mobile/components/legendBadge/LegendBadge.jsx";
import styles from "./ScheduleCard.module.scss";

/**
 * 이번 주기 일정 (Figma 04 Schedule · 04b 3상태) — 기본 접힘, 상단 고정.
 * 접힘: 오늘 줄만(없으면 안내 문구). 펼침: 선호 재료가 나오는 날만 14일 전체.
 */
const ScheduleCard = ({ schedule, preferences, legendsById }) => {
  const [expanded, setExpanded] = useState(false);
  const days = useMemo(() => groupSchedule(schedule.items, preferences), [schedule.items, preferences]);
  const today = schedule.todayDayNo ?? todayDayNo();
  const todayDay = days.find((d) => d.dayNo === today);
  const shown = expanded ? days : todayDay ? [todayDay] : [];

  const renderDay = (d) => {
    const isToday = d.dayNo === today;
    return (
      <div key={d.dayNo} className={styles.day}>
        <div className={styles.date}>
          <span className={styles.dateLabel} data-today={isToday || undefined}>
            {cycleDateLabel(d.dayNo)}
          </span>
          <span className={styles.sub}>
            {`${d.dayNo}일차`}
            {isToday && <LegendBadge fill>오늘</LegendBadge>}
          </span>
        </div>
        <ul className={styles.entries}>
          {d.entries.map((e) => (
            <li key={e.legendId}>
              <span
                className={styles.dot}
                style={{ color: teamColor(legendsById.get(e.legendId)?.team) }}
                aria-hidden="true"
              />
              <strong className={styles.legend}>{e.legendName}</strong>
              <span className={styles.cards}>
                {e.cards.map((card) => (
                  <span key={card}>{card}</span>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <section className={styles.card} aria-label="이번 주기 일정">
      <div className={styles.head}>
        <h2 className={styles.title}>이번 주기 일정</h2>
        <span className={styles.when}>{expanded ? cycleRangeLabel() : `오늘 ${today}일차 · ${todayLabel()}`}</span>
      </div>

      {schedule.error ? (
        <p className={styles.empty}>일정을 불러오지 못했습니다.</p>
      ) : shown.length > 0 ? (
        <div className={expanded ? styles.scroll : undefined}>{shown.map(renderDay)}</div>
      ) : (
        <p className={styles.empty}>
          {expanded ? "이번 주기에 선호 레전드 재료가 나오는 날이 없습니다" : "오늘 획득할 수 있는 선호 레전드 재료 카드가 없습니다"}
        </p>
      )}

      <button type="button" className={styles.toggle} aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>
        {expanded ? "접기 ▴" : "전체 일정 펼치기 ▾"}
      </button>
    </section>
  );
};

export default ScheduleCard;
