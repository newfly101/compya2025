import { useNavigate } from "react-router-dom";
import styles from "./MatchPredictionCard.module.scss";
import WinRateBar from "@/domains/kbo/feature/public/components/winRate/WinRateBar.jsx";
import {
  getTeamMeta,
  getMatchStatusConfig,
  parseRecentResults,
} from "@/domains/kbo/feature/public/utils/matchUtils.js";

/**
 * MatchPredictionCard
 * - 오늘의 경기 예측 카드 단위 컴포넌트
 * - match 데이터 구조:
 *   { matchId, gameDate, gameTime, stadium, status,
 *     homeTeam: { code, startingPitcher, recentResults, aiWinRate },
 *     awayTeam: { code, startingPitcher, recentResults, aiWinRate } }
 */
const MatchPredictionCard = ({ match }) => {
  const navigate   = useNavigate();
  const homeMeta   = getTeamMeta(match.homeTeam.code);
  const awayMeta   = getTeamMeta(match.awayTeam.code);
  const statusConf = getMatchStatusConfig(match.status);
  const homeForm   = parseRecentResults(match.homeTeam.recentResults);
  const awayForm   = parseRecentResults(match.awayTeam.recentResults);

  const handleClick = () => navigate(`/kbo/match/${match.matchId}`);

  return (
    <article
      className={`${styles.card} ${styles[statusConf.badgeClass]}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && handleClick()}
    >
      {/* 상태 배지 */}
      <div className={styles.header}>
        <span className={`${styles.badge} ${styles[`badge_${statusConf.badgeClass}`]}`}>
          {statusConf.key === "LIVE" && <span className={styles.liveDot} />}
          {statusConf.label}
        </span>
        <span className={styles.gameInfo}>
          {match.gameTime} · {match.stadium}
        </span>
      </div>

      {/* 팀 매치업 */}
      <div className={styles.matchup}>
        {/* 어웨이 */}
        <div className={styles.team}>
          <span
            className={styles.teamCode}
            style={{ color: awayMeta.color }}
          >
            {awayMeta.abbr}
          </span>
          <span className={styles.teamName}>{awayMeta.name}</span>
          <span className={styles.pitcher}>
            {match.awayTeam.startingPitcher ?? "-"}
          </span>
          <RecentForm results={awayForm} />
        </div>

        <div className={styles.vsBlock}>
          <span className={styles.vs}>VS</span>
        </div>

        {/* 홈 */}
        <div className={`${styles.team} ${styles.teamRight}`}>
          <span
            className={styles.teamCode}
            style={{ color: homeMeta.color }}
          >
            {homeMeta.abbr}
          </span>
          <span className={styles.teamName}>{homeMeta.name}</span>
          <span className={styles.pitcher}>
            {match.homeTeam.startingPitcher ?? "-"}
          </span>
          <RecentForm results={homeForm} reverse />
        </div>
      </div>

      {/* AI 승률 */}
      <div className={styles.winRate}>
        <WinRateBar
          homeRate={match.homeTeam.aiWinRate}
          awayRate={match.awayTeam.aiWinRate}
          homeColor={homeMeta.color}
          awayColor={awayMeta.color}
        />
      </div>

      {/* CTA */}
      <button
        className={styles.ctaBtn}
        onClick={(e) => {
          e.stopPropagation();
          handleClick();
        }}
        disabled={match.status === "FINAL"}
      >
        {match.status === "FINAL" ? "경기 결과" : "분석 보기"}
      </button>
    </article>
  );
};

/* -----------------------------------------------
 * 최근 5경기 폼 (내부 전용 컴포넌트)
 * ----------------------------------------------- */
const RecentForm = ({ results = [], reverse = false }) => (
  <ul className={`${styles.form} ${reverse ? styles.formReverse : ""}`}>
    {results.map((r, i) => (
      <li key={i} className={`${styles.formDot} ${styles[r.resultClass]}`}>
        {r.label}
      </li>
    ))}
  </ul>
);

export default MatchPredictionCard;
