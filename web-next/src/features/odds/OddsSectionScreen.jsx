import { notFound } from "next/navigation";
import { DEFAULT_ODDS_DOC, findOddsSection } from "@/data/odds/index.js";
import OddsTable from "@/features/odds/components/oddsTable/OddsTable.jsx";
import OddsNote from "@/features/odds/components/oddsNote/OddsNote.jsx";
import OddsSectionNav from "@/features/odds/components/oddsSectionNav/OddsSectionNav.jsx";
import styles from "./OddsSectionScreen.module.scss";

// 정적 데이터만 쓰는 서버 컴포넌트 — 잘못된 sectionId 는 404(원본은 목차로 리다이렉트)
const OddsSectionScreen = ({ sectionId }) => {
  const doc = DEFAULT_ODDS_DOC;
  const section = findOddsSection(sectionId, doc);
  if (!section) notFound();

  const categoryLabel = doc.categories?.find((c) => c.id === section.categoryId)?.label ?? null;
  const idx = doc.sections.findIndex((s) => s.id === section.id);
  const prevSection = idx > 0 ? doc.sections[idx - 1] : null;
  const nextSection = idx >= 0 && idx < doc.sections.length - 1 ? doc.sections[idx + 1] : null;

  return (
    <div className={styles.screen}>
      <div className={styles.body}>
        <div className={styles.sectionHeader}>
          <h1 className={styles.sectionTitle}>{section.title}</h1>
          {categoryLabel && <p className={styles.sectionCategory}>{categoryLabel}</p>}
        </div>

        {(section.blocks ?? []).map((block, i) => {
          if (block.type === "table") return <OddsTable key={i} block={block} />;
          if (block.type === "note" || block.type === "text" || block.type === "link") return <OddsNote key={i} block={block} />;
          return null;
        })}
      </div>

      <OddsSectionNav prevSection={prevSection} nextSection={nextSection} />
    </div>
  );
};

export default OddsSectionScreen;
