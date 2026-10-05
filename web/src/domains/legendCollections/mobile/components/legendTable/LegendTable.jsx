import { teamColor } from "@/domains/legendStats/config/legendStats.js";
import { LEGEND, SORT, displayAcquiredDate, legendStatus, ownedCount, prefLabel, shortDate, sortMark } from "@/domains/legendCollections/config/legendCollections.js";
import LegendBadge from "@/domains/legendCollections/mobile/components/legendBadge/LegendBadge.jsx";
import LegendDetail from "@/domains/legendCollections/mobile/components/legendDetail/LegendDetail.jsx";
import styles from "./LegendTable.module.scss";

/**
 * 순위 목록 (Figma 01·02 Table) — `#` · 레전드 · 상태 · 보유. 행을 누르면 바로 아래 펼침.
 * 조회·관리 화면이 같은 부품을 쓴다. `#` 는 현재 결과의 순번, 선호 열은 선호 순위("선호1"~).
 * 레전드·상태·선호·획득일·보유 머리를 누르면 정렬.
 */
const LegendTable = ({ rows, sort, onSort, openId, onToggle, c, historyCards, mileageBadge, onReset }) => {
  const { server, draft } = c;
  const prefs = server.preferences;
  return (
    <div className={styles.table}>
      <div className={styles.head} role="row">
        <span className={styles.cRank} role="columnheader">
          #
        </span>
        {[
          [SORT.NAME, "레전드", styles.cName],
          [SORT.PREF, "선호", styles.cPref],
          [SORT.STATUS, "상태", styles.cStatus],
          [SORT.DATE, "획득일", styles.cDate],
          [SORT.OWNED, "보유", styles.cOwned],
        ].map(([key, text, col]) => {
          const mark = sortMark(sort, key);
          const dir = sort?.key === key ? (sort.dir < 0 ? "descending" : "ascending") : "none";
          return (
            <span key={key} className={col} role="columnheader" aria-sort={dir}>
              <button type="button" className={styles.sortBtn} data-active={sort?.key === key || undefined} onClick={() => onSort(key)}>
                {text}
                {mark && <span className={styles.arrow}>{mark}</span>}
              </button>
            </span>
          );
        })}
      </div>
      <ul className={styles.list}>
        {rows.map((l, i) => {
          const open = openId === l.id;
          const st = legendStatus(l.id, server, draft);
          return (
            <li key={l.id}>
              <button
                type="button"
                className={styles.row}
                data-open={open || undefined}
                data-owned={st === LEGEND.OWNED || undefined}
                aria-expanded={open}
                onClick={() => onToggle(l.id)}
              >
                <span className={styles.cRank}>{i + 1}</span>
                <span className={styles.cName}>
                  <span className={styles.dot} style={{ color: teamColor(l.team) }} aria-hidden="true" />
                  <span className={styles.name}>{l.name}</span>
                </span>
                <span className={styles.cPref}>{prefLabel(prefs.indexOf(l.id) + 1)}</span>
                <span className={styles.cStatus}>
                  {st === LEGEND.FRAME && <LegendBadge>액자</LegendBadge>}
                  {st === LEGEND.OWNED && <LegendBadge fill>보유중</LegendBadge>}
                </span>
                <span className={styles.cDate}>{shortDate(displayAcquiredDate(l.id, server))}</span>
                <span className={styles.cOwned}>{`${ownedCount(l.id, server, draft)}/8`}</span>
              </button>
              {open && (
                <LegendDetail legend={l} c={c} historyCards={historyCards} mileageBadge={mileageBadge} onReset={onReset} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LegendTable;
