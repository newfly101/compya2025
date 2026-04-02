import { Link } from "react-router-dom";
import styles from "./TodayMatchSection.module.scss";
import MatchPredictionCard from "@/domains/kbo/feature/public/components/card/MatchPredictionCard.jsx";
import { useTodayMatches } from "@/domains/kbo/feature/public/hooks/useTodayMatches.js";
import { formatGameDate } from "@/domains/kbo/feature/public/utils/matchUtils.js";

/**
 * TodayMatchSection
 * - "오늘의 KBO 승부예측" 섹션
 * - 경기 카드 그리드 + 전체보기 링크
 */
const TodayMatchSection = () => {
  const { visibleMatches, hasMore, loading, error } = useTodayMatches();
  const todayLabel = formatGameDate(new Date().toISOString().slice(0, 10));

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* 섹션 헤더 */}
        <div className={styles.sectionHeader}>
          <div className={styles.titleGroup}>
            <h2 className={styles.title}>오늘의 KBO 승부예측</h2>
            <span className={styles.date}>{todayLabel}</span>
          </div>
          {hasMore && (
            <Link to="/kbo/predict" className={styles.viewAll}>
              전체보기 →
            </Link>
          )}
        </div>

        {/* 상태별 콘텐츠 */}
        {loading && <MatchCardSkeleton />}

        {!loading && error && (
          <p className={styles.errorMsg}>경기 정보를 불러오지 못했습니다.</p>
        )}

        {!loading && !error && visibleMatches.length === 0 && (
          <p className={styles.emptyMsg}>오늘 예정된 경기가 없습니다.</p>
        )}

        {!loading && !error && visibleMatches.length > 0 && (
          <ul className={styles.grid}>
            {visibleMatches.map((match) => (
              <li key={match.matchId}>
                <MatchPredictionCard match={match} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

/* -----------------------------------------------
 * 로딩 스켈레톤 (내부 전용)
 * ----------------------------------------------- */
const MatchCardSkeleton = () => (
  <ul className={styles.grid} aria-label="로딩 중">
    {Array.from({ length: 3 }).map((_, i) => (
      <li key={i} className={styles.skeleton} aria-hidden="true" />
    ))}
  </ul>
);

export default TodayMatchSection;
