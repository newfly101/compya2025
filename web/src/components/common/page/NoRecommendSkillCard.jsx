import styles from "@/styles/pages/SkillDictionary.module.scss";

const NoRecommendSkillCard = ({ skill, onClose, mainText="", subText="" }) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.centerModal}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className={styles.modalTitle}>{skill}</h2>

        <div className={styles.modalBody}>
          <div className={styles.noRecommendIcon}>⚠️</div>

          <p className={styles.noRecommendText}>
            {mainText}
          </p>

          <p className={styles.noRecommendSub}>
            {subText}
          </p>

          <button className={styles.modalClose} onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoRecommendSkillCard;
