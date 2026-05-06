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
