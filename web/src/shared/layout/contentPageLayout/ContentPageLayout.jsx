import React from "react";
import styles from "./ContentPageLayout.module.scss";

const ContentPageLayout = ({header, children}) => {
  return (
    <main className={styles.container}>
      {header}
      {children}
    </main>
  );
};

export default ContentPageLayout;
