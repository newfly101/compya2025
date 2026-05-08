import CommunityBadge from "@/domains/community/mobile/components/communityBadge/CommunityBadge.jsx";
import { formatCount, getEffectiveBadge } from "@/domains/community/mobile/utils.js";
import styles from "./PostRow.module.scss";

const PostRow = ({ post, defaultBadge, tagBadge }) => {
  const { title, author, timeText, views, comments, thumbnail } = post;
  const badgeKind = getEffectiveBadge(post) ?? defaultBadge ?? null;

  return (
    <article className={styles.row}>
      <div className={styles.body}>
        <div className={styles.titleRow}>
          {badgeKind && (
            <span className={styles.badgeSlot}>
              <CommunityBadge kind={badgeKind} />
            </span>
          )}
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
