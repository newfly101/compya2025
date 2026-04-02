import React from "react";
import styles from "./RecommendCard.module.scss";
import { getHittingOrderLabel, sortCombos } from "./RecommendCard.model.js";
import ComboCard from "./ComboCard.jsx";

const RecommendCard = ({ isOpen, selected = [], combos = [], onClose }) => {
  if (!isOpen || combos.length === 0) return null;

  const sorted = sortCombos(combos);

  return (
    <section className={styles.modalOverlay} onClick={onClose}>
      <article className={styles.centerModal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle} id="recommend-title">
            {selected.join(" + ")} 추천 조합
            {getHittingOrderLabel(selected)}
          </h2>
          <button className={styles.modalCloseIcon} onClick={onClose} aria-label="닫기">
            ✕
          </button>
        </header>

        <section className={styles.modalBody}>
          <ul className={styles.comboGrid}>
            {sorted.map((combo, idx) => (
              <ComboCard key={idx} combo={combo} selected={selected} />
            ))}
          </ul>
        </section>
      </article>
    </section>
  );
};

export default RecommendCard;
