import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { buildTodayHistory } from "@/domains/legendCollections/config/todayHistory.js";
import { cycleDateLabel, todayDayNo, todayLabel } from "@/domains/legendCollections/config/legendCollections.js";
import LegendBadge from "@/domains/legendCollections/mobile/components/legendBadge/LegendBadge.jsx";
import styles from "./TodayHistoryCard.module.scss";

/**
 * 홈 "오늘 히스토리 모드" 카드 (REQ-LCOL-20 · Figma legendCollections v2 / 06).
 * 선호 레전드의 미보유 재료 중 오늘 일차 명단에 있는 것. 일정을 못 받았거나 해당 재료가 없으면 카드를 통째로 숨긴다.
 * props: summary = useMyCollectionSummary() 결과
 */
const TodayHistoryCard = ({ summary }) => {
  const { schedule, preferences, meLoaded } = summary;
  if (!meLoaded || !schedule.loaded || schedule.error) return null;

  const today = schedule.todayDayNo ?? todayDayNo();
  const { count, withFrame, withoutFrame, next } = buildTodayHistory(schedule.items, preferences, today);
  if (count === 0) return null;

  const group = (title, rows, showFrame) =>
    rows.length > 0 && (
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>{title}</h3>
        <ul className={styles.rows}>
          {rows.map((r) => (
            <li key={`${r.legendId}-${r.materialId ?? r.card}`}>
              <Link to={`${ROUTE_PATHS.history_legend}?legend=${encodeURIComponent(r.legendName)}`} className={styles.row}>
                <span className={styles.round}>{r.round}</span>
                <span className={styles.main}>
                  <strong className={styles.cardName}>{r.card}</strong>
                  <span className={styles.need}>{`${r.legendName} 재료 · 선호 ${r.rank}위`}</span>
                </span>
                {showFrame && <LegendBadge>액자</LegendBadge>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );

  return (
    <section className={styles.card} aria-label="오늘 히스토리 모드">
      <div className={styles.head}>
        <div>
          <h2 className={styles.title}>{`오늘 히스토리 모드 · ${today}일차`}</h2>
          <p className={styles.sub}>{`내 선호 레전드 재료 ${count}장이 나와요`}</p>
        </div>
        <span className={styles.date}>{todayLabel()}</span>
      </div>
      {group("액자 있는 레전드", withFrame, true)}
      {group("액자 없는 레전드", withoutFrame, false)}
      <div className={styles.foot}>
        <span className={styles.next}>
          {next && `다음: ${cycleDateLabel(next.dayNo, new Date(), true)} · ${next.dayNo}일차 · ${next.count}장`}
        </span>
        <Link to={`${ROUTE_PATHS.legend_collections}?tab=mine`} className={styles.goal}>내 선호 보기 →</Link>
      </div>
    </section>
  );
};

export default TodayHistoryCard;
