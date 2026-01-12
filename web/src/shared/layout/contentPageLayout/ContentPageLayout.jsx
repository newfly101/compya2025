import React from "react";
import styles from "./ContentPageLayout.module.scss";

const ContentPageLayout = ({header, children}) => {
  return (
    <section className={styles.container}>
      {header}
      {children}
    </section>
  );
};

export default ContentPageLayout;
