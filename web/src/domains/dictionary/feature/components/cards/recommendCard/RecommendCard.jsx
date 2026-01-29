import React from "react";
import styles from "./RecommendCard.module.scss";
import { GRADE_CLASS_MAP } from "@/domains/dictionary/feature/components/cards/recommendCard/RecommendCard.styles.js";
import {
  getHittingOrderLabel,
  sortCombos,
} from "@/domains/dictionary/feature/components/cards/recommendCard/RecommendCard.model.js";


// SAMPLE_RECOMMEND_COMBOS = combos
const RecommendCard = ({ isOpen, selected = [], combos = [], onClose }) => {
  if (!isOpen || combos.length === 0) return null;

  const sorted = sortCombos(combos);

  return (
    <section className={styles.modalOverlay} onClick={onClose}>
      <article
        className={styles.centerModal}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHeader}>
          <h2 className={styles.modalTitle} id="recommend-title">
            {selected.join(" + ")} 추천 조합
            {getHittingOrderLabel(selected)}
          </h2>

          <button
            className={styles.modalCloseIcon}
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </header>

        <section className={styles.modalBody}>
          <ul className={styles.comboGrid}>
            {sorted.map((combo, idx) => (
              <li key={idx} className={styles.comboCard}>
                <article>
                  <header className={styles.comboHeader}>
                    <span>{combo.position}</span>
                    <span
                      className={`${styles.grade} ${
                        GRADE_CLASS_MAP[combo.grade] ?? ""
                      }`}
                    >
                    {combo.grade}
                  </span>
                  </header>

                  <ul className={styles.skillList}>
                    {combo.skills.map((skill, i) => (
                      <li
                        key={i}
                        className={
                          selected.includes(skill)
                            ? styles.highlight
                            : ""
                        }
                      >
                        {skill}
                      </li>
                    ))}
                  </ul>

                  <footer className={styles.score}>
                    {combo.totalPoint}점
                  </footer>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </section>
  );
};

export default RecommendCard;
