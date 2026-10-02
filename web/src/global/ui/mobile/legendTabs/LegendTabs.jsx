import { Link, useLocation } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import GuideAccordion from "@/global/ui/guideAccordion/GuideAccordion.jsx";
import styles from "./LegendTabs.module.scss";

// match: 어느 주소에서 이 탭이 켜지나 — 보유 현황은 /manage 에서도 켜진다. 스킬 기록은 /:id/edit 까지 켜진다
const under = (base) => (p) => p === base || p.startsWith(`${base}/`);
const TABS = [
  { to: ROUTE_PATHS.legend_stats, label: "재료 검색", match: under(ROUTE_PATHS.legend_stats) },
  {
    to: ROUTE_PATHS.legend_collections,
    label: "내 보유 현황",
    match: (p) => p === ROUTE_PATHS.legend_collections || p === ROUTE_PATHS.legend_collection_manage,
  },
  { to: ROUTE_PATHS.legend_collection_skills, label: "스킬 기록", match: under(ROUTE_PATHS.legend_collection_skills) },
];

/**
 * 레전드 재료 화면 공용 머리 — 탭 3개(한 줄, 360 에서도 줄바꿈 없이 균등) + 아래 "이 페이지 활용 가이드" 아코디언.
 * 가이드 본문은 접혀 있어도 DOM 에 둔다(<details>) — 프리렌더·크롤러가 읽는다 (fe-ads.md § 6).
 */
const LegendTabs = ({ guide }) => {
  const { pathname } = useLocation();
  return (
    <div className={styles.wrap}>
      <nav className={styles.tabs} aria-label="레전드 재료">
        {TABS.map((t) => {
          const on = t.match(pathname.replace(/\/$/, ""));
          return (
            <Link key={t.to} to={t.to} className={styles.tab} data-active={on || undefined} aria-current={on ? "page" : undefined}>
              {t.label}
            </Link>
          );
        })}
      </nav>
      <GuideAccordion guide={guide} />
    </div>
  );
};

export default LegendTabs;
