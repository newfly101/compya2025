import styles from "./NoRecommendCard.module.scss";

const NoRecommendCard = ({ selected, onClose, mainText = "", subText = "" }) => {
  return (
    <section className={styles.modalOverlay} onClick={onClose}>
      <article
        className={styles.centerModal}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHeader} id="noRecommend-title">
          <h2 className={styles.modalTitle}>{selected}</h2>
        </header>

        <ul className={styles.modalBody}>
          <li className={styles.noRecommendIcon}>⚠️</li>

          <li className={styles.noRecommendText}>
            {mainText}
          </li>

          <li className={styles.noRecommendSub}>
            {subText}
          </li>

          <button className={styles.modalClose} onClick={onClose}>
            닫기
          </button>
        </ul>
      </article>
    </section>
  );
};

export default NoRecommendCard;
