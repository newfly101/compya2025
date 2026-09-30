import { teamColor } from "@/domains/legendStats/config/legendStats.js";
import {
  LEGEND,
  legendCounts,
  legendStatus,
} from "@/domains/legendCollections/config/legendCollections.js";
import LegendBadge from "@/domains/legendCollections/mobile/components/legendBadge/LegendBadge.jsx";
import LegendDetail from "@/domains/legendCollections/mobile/components/legendDetail/LegendDetail.jsx";
import ProgressBar from "@/domains/legendCollections/mobile/components/progressBar/ProgressBar.jsx";
import styles from "./GoalCard.module.scss";

/**
 * 내 목표 카드 (Figma 04 Goal/*) — 순위 · 이름 · 구단·포지션 · 액자, 8칸 막대, 재료 8칸.
 * 액자 있는 레전드는 테두리·순위가 브랜드색.
 */
const GoalCard = ({ legend, rank, open, onToggle, c, historyCards, mileageBadge }) => {
  const { server, draft } = c;
  const status = legendStatus(legend.id, server, draft);
  const frame = status === LEGEND.FRAME;
  const { inserted, have, left } = legendCounts(legend.id, server, draft);
  const panelId = `goal-remain-${legend.id}`;

  return (
    <li className={styles.card} data-frame={frame || undefined}>
      <div className={styles.head}>
        <span className={styles.rank}>{rank}</span>
        <span className={styles.dot} style={{ color: teamColor(legend.team) }} aria-hidden="true" />
        <strong className={styles.name}>{legend.name}</strong>
        <span className={styles.meta}>{[legend.team, ...legend.pos].filter(Boolean).join(" · ")}</span>
        {frame && <LegendBadge>액자</LegendBadge>}
      </div>

      <ProgressBar inserted={inserted} have={have} />

      <div className={styles.foot}>
        <span>{`삽입 ${inserted} · 보유 ${have} · 남은 ${left}칸`}</span>
        <button type="button" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
          {open ? "접기 ▴" : "재료 보기 ▾"}
        </button>
      </div>

      {open && (
        <div id={panelId}>
          <LegendDetail legend={legend} c={c} historyCards={historyCards} mileageBadge={mileageBadge} materialsOnly />
        </div>
      )}
    </li>
  );
};

export default GoalCard;
