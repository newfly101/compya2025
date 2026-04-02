import React from "react";
import styles from "./CafeLinkCard.module.scss";

const CafeLinkCard = ({
                        title,
                        dateRange,
                        image,
                        link,
                        short,
                        disabled,
                      }) => {
  return (
    <article className={styles.cafeLinkCardWrapper}>
      <figure className={styles.thumbnail}>
        <img src={image} alt={title} />
        <figcaption className={disabled ? styles.disabledBadge : styles.badge}>
          {disabled ? "종료된 이벤트" : "진행중 이벤트"}
        </figcaption>
      </figure>

      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        {!short && (
          <p className={styles.date}>{dateRange}</p>
        )}

        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className={styles.detailLink}
        >
          상세 정보 →
        </a>
      </div>
    </article>
  );
};

export default CafeLinkCard;
