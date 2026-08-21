import { useMemo } from "react";
import { Navigate, useParams } from "react-router-dom";
import { DEFAULT_ODDS_DOC, findOddsSection } from "@/data/odds";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useOddsTopBar } from "@/domains/odds/mobile/hooks/useOddsTopBar.js";
import OddsTable from "@/domains/odds/mobile/components/oddsTable/OddsTable.jsx";
import OddsNote from "@/domains/odds/mobile/components/oddsNote/OddsNote.jsx";
import OddsSectionNav from "@/domains/odds/mobile/components/oddsSectionNav/OddsSectionNav.jsx";
import styles from "./OddsSectionScreen.module.scss";

const OddsSectionScreen = () => {
  const { sectionId } = useParams();
  const doc = DEFAULT_ODDS_DOC;
  const section = doc ? findOddsSection(sectionId, doc) : null;

  useOddsTopBar();

  const categoryLabel = useMemo(() => {
    if (!doc || !section) return null;
    return doc.categories?.find((c) => c.id === section.categoryId)?.label ?? null;
  }, [doc, section]);

  const { prevSection, nextSection } = useMemo(() => {
    if (!doc || !section) return { prevSection: null, nextSection: null };
    const idx = doc.sections.findIndex((s) => s.id === section.id);
    return {
      prevSection: idx > 0 ? doc.sections[idx - 1] : null,
      nextSection: idx >= 0 && idx < doc.sections.length - 1 ? doc.sections[idx + 1] : null,
    };
  }, [doc, section]);

  if (!doc) {
    return (
      <div className={styles.screen}>
        <p className={styles.emptyText}>공시 문서를 불러올 수 없습니다.</p>
      </div>
    );
  }

  // 잘못된 sectionId — 목차로 리다이렉트
  if (!section) {
    return <Navigate to={ROUTE_PATHS.odds} replace />;
  }

  return (
    <div className={styles.screen}>
      <div className={styles.body}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>{section.title}</h1>
          {categoryLabel && <p className={styles.sectionCategory}>{categoryLabel}</p>}
        </div>

        {(section.blocks ?? []).map((block, i) => {
          if (block.type === "table") {
            return <OddsTable key={i} block={block} />;
          }
          if (block.type === "note" || block.type === "text" || block.type === "link") {
            return <OddsNote key={i} block={block} />;
          }
          // 알 수 없는 type 은 조용히 skip
          return null;
        })}
      </div>

      <OddsSectionNav prevSection={prevSection} nextSection={nextSection} />
    </div>
  );
};

export default OddsSectionScreen;
