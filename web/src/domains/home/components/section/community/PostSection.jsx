import styles from "./PostSection.module.scss";
import badge from "@/global/styles/components/primitive/_Badge.module.scss";

const PostSection = ({ posts = [] }) => {
  return (
    <ul className={styles.postList}>
      {posts.map((post) => (
        <li key={post.id} className={styles.item}>
          <div className={styles.top}>
            {post.tags.map((tag) => (
              <span
                key={tag.code}
                className={`${badge.badge} ${badge[`pinned-${tag.code}`] ?? badge["pinned-notice"]}`}
              >
                {tag.name}
              </span>
            ))}
          </div>
          <p className={styles.title}>{post.title}</p>
          <span className={styles.meta}>
            {post.authorName} · 조회 {post.viewCount.toLocaleString()}
            {post.commentCount > 0 && ` · 댓글 ${post.commentCount}`}
            {post.likeCount > 0 && ` · 추천 ${post.likeCount}`}
          </span>
        </li>
      ))}
    </ul>
  );
};

export default PostSection;
