// domains/guides/mobile/GuideDetailScreen.jsx
// /guides/:slug — 가이드 원본 전체 화면. GuideModal 과 동일한 GuideContent 렌더러를 그대로 쓴다.
// 콘텐츠가 빌드 시점에 이미 고정된 로컬 JS 데이터라 로딩 상태가 없다 — slug 매칭 실패(존재하지
// 않거나 아직 미완성인 편)만 notFound 로 갈린다(loading/error 는 발생하지 않는 정적 화면).
import { Link, useParams } from "react-router-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { usePageSeo } from "@/infra/seo/usePageSeo.js";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import { getGuideBySlug } from "@/domains/guides/content/index.js";
import GuideContent from "./GuideContent.jsx";
import styles from "./GuideDetailScreen.module.scss";

const GuideDetailScreen = () => {
  const { slug } = useParams();
  const guide = getGuideBySlug(slug);

  useDomainTopBar(guide ? guide.title : "가이드");

  usePageSeo({
    title: guide ? `컴프야펀 | 가이드 | ${guide.seo?.title ?? guide.title}` : undefined,
    description: guide?.seo?.description,
    canonicalPath: guide ? `/guides/${guide.slug}` : undefined,
  });

  if (!guide) {
    return (
      <div className={styles.screen}>
        <StateBox status="empty" message="존재하지 않거나 아직 준비 중인 가이드입니다." />
        <Link to={ROUTE_PATHS.guides} className={styles.backLink}>
          가이드 목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      <GuideContent guide={guide} headingLevel="h1" />
      <Link to={ROUTE_PATHS.guides} className={styles.backLink}>
        다른 가이드 보러 가기
      </Link>
    </div>
  );
};

export default GuideDetailScreen;
