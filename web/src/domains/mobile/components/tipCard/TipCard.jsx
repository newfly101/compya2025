// src/domains/mobile/components/TipCard/TipCard.jsx
import styles from "./TipCard.module.scss";

/**
 * C/TipCard — 팁 게시글 카드
 */
const TipCard = ({ category, title, meta, onClick }) => {
  return (
    <button className={styles.card} onClick={onClick}>
      <span className={styles.category}>{category}</span>
      <p className={styles.title}>{title}</p>
      <p className={styles.meta}>{meta}</p>
    </button>
  );
};

export default TipCard;
