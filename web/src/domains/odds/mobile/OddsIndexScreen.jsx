import { Link } from "react-router-dom";
import { DEFAULT_ODDS_DOC } from "@/data/odds";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import styles from "./OddsIndexScreen.module.scss";

const OddsIndexScreen = () => {
  useDomainTopBar("확률 공시");

  const doc = DEFAULT_ODDS_DOC;

  if (!doc) {
    return (
      <div className={styles.screen}>
        <p className={styles.emptyText}>공시 문서를 불러올 수 없습니다.</p>
      </div>
    );
  }

  const { intro, categories = [], sections = [] } = doc;

  if (sections.length === 0) {
    return (
      <div className={styles.screen}>
        <p className={styles.emptyText}>등록된 확률 공시 항목이 없습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.screen}>
      {intro && (
        <div className={styles.intro}>
          {intro.heading && (
            <p className={styles.introHeading}>
              <span className={styles.introIcon} aria-hidden="true">ⓘ</span>
              {intro.heading}
            </p>
          )}
          {Array.isArray(intro.notes) && intro.notes.length > 0 && (
            <ul className={styles.introList}>
              {intro.notes.map((note, i) => (
                <li key={i} className={styles.introItem}>{note}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {categories.map((category) => {
        const categorySections = sections.filter((s) => s.categoryId === category.id);
        if (categorySections.length === 0) return null;

        return (
          <section key={category.id} className={styles.category}>
            <div className={styles.categoryHeader}>{category.label}</div>
            <div className={styles.categoryList}>
              {categorySections.map((section) => (
                <Link
                  key={section.id}
                  to={ROUTE_PATHS.odds_section(section.id)}
                  className={styles.row}
                >
                  <span className={styles.rowTitle}>{section.title}</span>
                  <span className={styles.chevron} aria-hidden="true">›</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default OddsIndexScreen;
