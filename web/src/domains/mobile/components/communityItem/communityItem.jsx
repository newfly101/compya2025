// src/domains/mobile/components/CommunityItem/CommunityItem.jsx
import styles from "./CommunityItem.module.scss";

const TAG_STYLE = {
  HOT: { bg: "rgba(232,65,65,0.18)", color: "#e84141" },
  NEW: { bg: "rgba(232,213,65,0.33)", color: "#ffd9d9" },
};

/**
 * C/CommunityItem — 커뮤니티 인기글 행
 */
const CommunityItem = ({ title, stats, tag, onClick }) => {
  const tagStyle = TAG_STYLE[tag];

  return (
    <button className={styles.item} onClick={onClick}>
      {/* 좌측: 태그 + 제목 */}
      <div className={styles.left}>
        {tag && (
          <span
            className={styles.tag}
            style={{ backgroundColor: tagStyle?.bg, color: tagStyle?.color }}
          >
            {tag}
          </span>
        )}
        <p className={styles.title}>{title}</p>
        {stats && <p className={styles.stats}>{stats}</p>}
      </div>

      {/* 우측 chevron */}
      <span className={styles.chevron}>›</span>
    </button>
  );
};

export default CommunityItem;
