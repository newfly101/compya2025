import PinnedBadge from "@/global/ui/badge/PinnedBadge.jsx";
import { formatCount, getEffectiveBadge } from "@/domains/community/mobile/utils.js";
import styles from "./PostRow.module.scss";

// D1=a (2026-05-31 확정): CommunityBadge → PinnedBadge.new/important/mustread 직접 치환
//   - "new"    → PinnedBadge.new      (red "NEW")
//   - "notice" → PinnedBadge.important (yellow "공지")
//   - "hot"    → PinnedBadge.mustread  (red "인기")
const renderBadge = (kind) => {
  if (kind === "new") return <PinnedBadge variant="new" />;
  if (kind === "notice") return <PinnedBadge variant="important" label="공지" />;
  if (kind === "hot") return <PinnedBadge variant="mustread" label="인기" />;
  if (kind === "pinned") return <PinnedBadge variant="mustread" label="고정" />;
  return null;
};

const PostRow = ({ post, defaultBadge, tagBadge, onClick }) => {
  const { title, author, timeText, views, comments, thumbnail } = post;
  const badgeKind = getEffectiveBadge(post) ?? defaultBadge ?? null;
  const badge = renderBadge(badgeKind);
  const isClickable = typeof onClick === "function";

  return (
    <article
      className={`${styles.row} ${isClickable ? styles.clickable : ""}`}
      onClick={onClick}
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick(e);
            }
          : undefined
      }
    >
      <div className={styles.body}>
        <div className={styles.titleRow}>
          {badge && <span className={styles.badgeSlot}>{badge}</span>}
          <p className={styles.title}>
            {tagBadge && <span className={styles.titleTagSlot}>{tagBadge}</span>}
            {title}
          </p>
        </div>
        <p className={styles.meta}>
          <span>{author}</span>
          <span className={styles.dot}>·</span>
          <span>{timeText}</span>
          <span className={styles.dot}>·</span>
          <span>조회 {formatCount(views)}</span>
        </p>
      </div>

      <div className={styles.right}>
        {thumbnail && (
          <div className={styles.thumb}>
            {typeof thumbnail === "string" ? (
              <img src={thumbnail} alt="" className={styles.thumbImg} />
            ) : (
              <span className={styles.thumbPlaceholder}>IMG</span>
            )}
          </div>
        )}
        <div className={styles.commentBox}>
          <span className={styles.commentCount}>{comments}</span>
          <span className={styles.commentLabel}>댓글</span>
        </div>
      </div>
    </article>
  );
};

export default PostRow;
