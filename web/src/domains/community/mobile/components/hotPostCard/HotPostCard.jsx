// [미사용/삭제 대상] 2026-08-31 읽기 전용 재오픈 — "인기 급상승" 섹션이 실제 BE 스펙에 없어
// CommunityScreen.jsx 에서 제거. 샌드박스 권한으로 파일 삭제가 막혀 주석만 남김 — 수동 삭제 필요.
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
