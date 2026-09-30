import { useState } from "react";
import {
  GOAL_FILTERS,
  legendStatus,
  matchGoalFilter,
} from "@/domains/legendCollections/config/legendCollections.js";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import FilterChips from "@/domains/legendCollections/mobile/components/filterChips/FilterChips.jsx";
import GoalCard from "@/domains/legendCollections/mobile/components/goalCard/GoalCard.jsx";
import ScheduleCard from "@/domains/legendCollections/mobile/components/scheduleCard/ScheduleCard.jsx";
import styles from "./GoalPanel.module.scss";

/**
 * 내 목표 탭 열람 (Figma 04) — 접힌 주기 일정(상단 고정) → 전체/액자 보유/미보유 → 선호 순위 카드.
 * 편집은 이 부품이 아니라 화면이 전체 탭과 같은 목록(LegendTable)으로 그린다.
 */
const GoalPanel = ({ c, prefLegends, legendsById, historyCards, mileageBadge, onPickPrefs }) => {
  const { server, draft } = c;
  const prefs = server.preferences;
  const [filter, setFilter] = useState(GOAL_FILTERS[0]);
  const [open, setOpen] = useState(() => new Set());

  const statusOf = (l) => legendStatus(l.id, server, draft);
  const inFilter = (f) => prefLegends.filter((l) => matchGoalFilter(statusOf(l), f));
  const rows = inFilter(filter);
  const options = GOAL_FILTERS.map((f) => ({ value: f, label: `${f} ${inFilter(f).length}` }));

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <>
      {/* 화면 전체 높이를 부모로 둬야 스크롤 내내 붙어 있다 */}
      <div className={styles.sticky}>
        <ScheduleCard schedule={c.schedule} preferences={prefs} legendsById={legendsById} />
      </div>
      {prefs.length > 0 && (
        <div className={styles.filter}>
          <FilterChips label="액자 보유 필터" options={options} value={filter} onChange={setFilter} />
        </div>
      )}

      <div className={styles.body}>
        {prefs.length === 0 ? (
          <div className={styles.empty}>
            <StateBox status="empty" message="선호 레전드를 골라 보세요. 미보유 레전드 중 최대 10명까지 담을 수 있어요." compact />
            <button type="button" className={styles.primary} onClick={onPickPrefs}>
              선호 레전드 고르기
            </button>
          </div>
        ) : rows.length === 0 ? (
          <StateBox status="empty" message="조건에 맞는 선호 레전드가 없습니다." compact />
        ) : (
          <ol className={styles.goals}>
            {rows.map((l) => (
              <GoalCard
                key={l.id}
                legend={l}
                rank={prefs.indexOf(l.id) + 1}
                open={open.has(l.id)}
                onToggle={() => toggle(l.id)}
                c={c}
                historyCards={historyCards}
                mileageBadge={mileageBadge}
              />
            ))}
          </ol>
        )}
      </div>
    </>
  );
};

export default GoalPanel;
