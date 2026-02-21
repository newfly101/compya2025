import React from "react";
import styles from "./ContentPageHeader.module.scss";

const ContentPageHeader = ({
                             title,
                             meta = [],
                             backLabel,
                             onBack,
                           }) => {
  return (
    <header className={styles.headerWrapper}>
      {backLabel && (
        <button
          type="button"
          className={styles.headerBack}
          onClick={onBack}
        >
          ← {backLabel}
        </button>
      )}

      <h1 className={styles.headerTitle}>{title}</h1>

      {meta.length > 0 && (
        <div className={styles.headerMeta}>
          {meta.map((item, idx) => (
            <span key={`meta-${idx}`} className={styles.headerMetaItem}>
              {item}
            </span>
          ))}
        </div>
      )}
    </header>
  );
};

export default ContentPageHeader;
