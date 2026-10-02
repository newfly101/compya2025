import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import styles from "./MyCollectionSection.module.scss";

/**
 * 홈 "내 컬렉션" (REQ-HM-11·12) — 로그인: 보유·액자·스킬 등록 수 + 바로가기 둘 / 비로그인: 로그인 유도 카드.
 * 숫자는 기존 API 응답을 화면에서 합친 것이다. 한쪽이 실패하면 그 숫자만 "-", 둘 다 실패하면 섹션을 숨긴다.
 * props: collection = useMyCollectionSummary(), skills = useMySkillSummary()
 */
const MyCollectionSection = ({ collection, skills }) => {
  const { isAuthenticated, login } = useAuthentication();

  if (!isAuthenticated) {
    return (
      <section className={styles.card} aria-label="내 컬렉션">
        <span className={styles.eyebrow}>내 컬렉션</span>
        <h2 className={styles.title}>로그인하면 내 레전드 재료와 스킬을 기록할 수 있어요</h2>
        <p className={styles.text}>
          보유·액자·스킬을 계정에 저장하고, 선호 레전드의 오늘 히스토리도 홈에서 받아봐요. 재료 검색은 로그인 없이 볼 수 있어요.
        </p>
        <button type="button" className={styles.login} onClick={login}>로그인</button>
      </section>
    );
  }

  if (collection.meError && skills.error) return null;
  if (!collection.meLoaded && !skills.loaded) return <div className={styles.card}><Skeleton count={1} height={72} /></div>;

  const stat = (label, value, failed) => (
    <div className={styles.stat}>
      <strong className={styles.num}>{failed ? "-" : value}</strong>
      <span className={styles.label}>{label}</span>
    </div>
  );

  return (
    <section className={styles.card} aria-label="내 컬렉션">
      <div className={styles.stats}>
        {stat("보유", collection.owned, collection.meError)}
        {stat("액자", collection.frame, collection.meError)}
        {stat("스킬 등록", skills.registered, skills.error)}
      </div>
      <div className={styles.links}>
        <Link to={ROUTE_PATHS.legend_collections} className={styles.link}>내 재료 보유 현황</Link>
        <Link to={ROUTE_PATHS.legend_collection_skills} className={styles.link}>내 레전드 스킬 기록</Link>
      </div>
    </section>
  );
};

export default MyCollectionSection;
