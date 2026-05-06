import { formatCount } from "@/domains/community/mobile/utils.js";
import styles from "./HotPostCard.module.scss";

const HotPostCard = ({ post }) => {
  const { title, views, comments, thumbnail } = post;
  return (
    <article className={styles.card}>
      <div className={styles.thumb}>
        {thumbnail ? (
          <img src={thumbnail} alt="" className={styles.thumbImg} />
        ) : (
          <span className={styles.thumbPlaceholder}>미리보기</span>
        )}
      </div>
      <p className={styles.title}>{title}</p>
      <p className={styles.meta}>
        조회 {formatCount(views)} · 댓글 {comments}
      </p>
    </article>
  );
};

export default HotPostCard;
