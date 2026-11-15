"use client";
import Link from "next/link";
import { ROUTE_PATHS } from "@/config/routePath.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { useMyCollectionSummary } from "@/domains/legendCollections/mobile/hooks/useMyCollectionSummary.js";
import { useMySkillSummary } from "@/domains/legendCollectionSkills/mobile/hooks/useMySkillSummary.js";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import styles from "./MyCollectionSection.module.scss";

/**
 * 홈 "내 컬렉션" — 로그인: 보유·액자·스킬 등록 수 + 바로가기 둘 / 비로그인: 로그인 유도 카드.
 * 세션 확인 전에는 스켈레톤 카드(고정 높이)만 보여 레이아웃이 밀리지 않는다. 쿼리는 로그인했을 때만 나간다.
 */
const MyCollectionSection = () => {
  const { initialized, isAuthenticated, login } = useAuthentication();
  const collection = useMyCollectionSummary();
  const skills = useMySkillSummary();

  if (!initialized) return <div className={styles.card}><Skeleton count={1} height={72} /></div>;

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
        <Link href={ROUTE_PATHS.legend_collections} className={styles.link}>내 재료 보유 현황</Link>
        <Link href={ROUTE_PATHS.legend_collection_skills} className={styles.link}>내 레전드 스킬 기록</Link>
      </div>
    </section>
  );
};

export default MyCollectionSection;
