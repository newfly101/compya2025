import React from "react";
import styles from "./ContentPageHeader.module.scss";

const ContentPageHeader = ({
                             title,
                             meta = [],
                             backLabel,
                             onBack,
                           }) => {

  return (
      <header className={styles.header}>
        <span className={styles.category} onClick={onBack}>← {backLabel}</span>
        <h1 className={styles.title}>{title}</h1>

        {meta.length > 0 && (
          <div className={styles.meta}>
            {meta.map((item, idx) => (
              <span key={`meta-${idx}`}>{item}</span>
            ))}
          </div>
        )}
      </header>
  );
};

export default ContentPageHeader;
