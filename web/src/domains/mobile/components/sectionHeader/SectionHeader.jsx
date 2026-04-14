// src/domains/mobile/components/SectionHeader/SectionHeader.jsx
import styles from "./SectionHeader.module.scss";

/**
 * C/SectionHeader — 섹션 공통 헤더
 * 좌측 accent bar + 제목 + 우측 링크
 */
const SectionHeader = ({ title, linkLabel = "전체 보기 →", onLink }) => {
  return (
    <div className={styles.header}>
      <div className={styles.left}>
        <span className={styles.accent} />
        <span className={styles.title}>{title}</span>
      </div>
      {onLink && (
        <button className={styles.link} onClick={onLink}>
          {linkLabel}
        </button>
      )}
    </div>
  );
};

export default SectionHeader;
