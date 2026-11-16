// /guides/[slug] 본문 — guide 는 page 가 slug 로 찾아 넘긴다(없으면 page 가 notFound()).
import Link from "next/link";
import GuideContent from "@/components/guideContent/GuideContent.jsx";
import styles from "./GuideDetailScreen.module.scss";

// TODO(next-migration): AdSlot(GUIDE_DETAIL) 미이전
const GuideDetailScreen = ({ guide }) => (
  <div className={styles.screen}>
    <GuideContent guide={guide} headingLevel="h1" />
    <Link href="/guides" className={styles.backLink}>
      다른 가이드 보러 가기
    </Link>
  </div>
);

export default GuideDetailScreen;
