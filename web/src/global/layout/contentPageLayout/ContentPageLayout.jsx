import React from "react";
import styles from "./ContentPageLayout.module.scss";

const ContentPageLayout = ({ header, children }) => {
  return (
    <section className={styles.contentPageWrapper}>
      <div className={styles.contentPageContainer}>
        {header}
        {children}
      </div>
    </section>
  );
};

export default ContentPageLayout;
