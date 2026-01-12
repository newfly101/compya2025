import React from "react";
import styles from "./ContentPageHeader.module.scss";
import { useContentPageHeader } from "@/shared/ui/contentPageHeader/useContentPageHeader.js";

const ContentPageHeader = ({
                             title,
                             meta = [],
                             backLabel,
                             onBack,
                           }) => {
  const {
    moveHome,
  } = useContentPageHeader();

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <span className={styles.category} onClick={moveHome}>← 메인으로</span>
        <h1 className={styles.title}>📌 조합 추천 백과사전</h1>

        <div className={styles.meta}>
          <span>2026-01-03</span>
          <span>v0.1.5</span>
        </div>
      </header>

      {/*<header className={styles.header}>*/}
      {/*  <span className={styles.category} onClick={onBack}>← {backLabel}</span>*/}
      {/*  <h1 className={styles.title}>{title}</h1>*/}

      {/*  {meta.length > 0 && (*/}
      {/*    <div className={styles.meta}>*/}
      {/*      {meta.map((item, idx) => (*/}
      {/*        <span key={`meta-${idx}`}>{item}</span>*/}
      {/*      ))}*/}
      {/*    </div>*/}
      {/*  )}*/}
      {/*</header>*/}
    </main>
  );
};

export default ContentPageHeader;
