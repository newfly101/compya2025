import styles from "@/styles/pages/SkillDictionary.module.scss";

const NoRecommendSkillCard = ({ skill, onClose }) => {
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
            현재 기준에서<br />
            잘 사용되지 않는 스킬입니다.
          </p>

          <p className={styles.noRecommendSub}>
            다른 스킬로 변경을 추천합니다.
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
