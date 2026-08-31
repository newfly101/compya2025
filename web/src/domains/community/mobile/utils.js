export const formatCount = (n) => {
  if (n == null) return "0";
  if (n < 1000) return String(n);
  return `${(n / 1000).toFixed(1)}K`;
};

const NEW_BADGE_TTL_MS = 3 * 60 * 60 * 1000;

/**
 * post.badge가 "new"이면 createdAt 기준 3시간 이내일 때만 유효.
 * 그 외 badge(notice/hot)는 시간 룰 없음. 시간 비교 시점은 호출자가 주입(now)
 */
export const getEffectiveBadge = (post, now = Date.now()) => {
  if (!post) return null;
  if (post.badge === "new") {
    if (!post.createdAt) return null;
    const elapsed = now - new Date(post.createdAt).getTime();
    if (elapsed > NEW_BADGE_TTL_MS) return null;
  }
  return post.badge ?? null;
};

// 서버 PostResponse(레코드) → PostRow 가 기대하는 뷰 모델로 매핑.
// v1 이관 게시글은 전부 본문 없는 외부 링크(EXTERNAL) — 썸네일 필드 자체가 없다.
export const mapPostForRow = (post) => ({
  id: post.id,
  title: post.title,
  author: post.authorName ?? "익명",
  timeText: post.createdAt ? post.createdAt.slice(0, 10) : "",
  views: post.viewCount ?? 0,
  comments: post.commentCount ?? 0,
  thumbnail: null,
  badge: post.isPinned ? "pinned" : null,
  linkType: post.linkType,
  externalUrl: post.externalUrl,
});
