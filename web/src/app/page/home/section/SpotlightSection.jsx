import React from "react";
import styles from "@/app/page/home/Home.module.scss";

const SpotlightSection = ({ title, image, link, interactive = false }) => {
  const Wrapper = interactive ? "button" : "div";

  return (
    <section className={styles.spotlightWrapper}>
      <Wrapper
        type={interactive ? "button" : undefined}
        className={`${styles.spotlightContent} ${
          interactive ? styles.spotlightInteractive : ""
        }`}
        onClick={
          interactive && (() => window.open(link, "_blank", "noopener,noreferrer"))
        }
      >
        <h2 className={styles.spotlightTitle}>{title}</h2>
        {/*<h2>{title}</h2>*/}

        <div className={styles.spotlightMedia}>
          <img
            className={styles.spotlightImage}
            src={image}
            alt={title}
          />
        </div>
      </Wrapper>
    </section>
  );
};

export default SpotlightSection;
