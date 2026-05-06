import { useCallback, useMemo, useRef, useState } from "react";
import { COMMUNITY_HOT_POSTS } from "@/data/community/hotPosts.js";
import { COMMUNITY_NOTICES } from "@/data/community/notices.js";
import { COMMUNITY_POSTS } from "@/data/community/posts.js";

const PAGE_SIZE = 10;

// TODO: BE 연동 시 카테고리별 API endpoint(또는 fetcher)로 분기.
//       현재는 정적 mock import.
const SOURCE_MAP = {
  trending: COMMUNITY_HOT_POSTS,
  free:     COMMUNITY_POSTS,
  notice:   COMMUNITY_NOTICES,
  update:   COMMUNITY_POSTS,
};

const TITLE_MAP = {
  trending: "인기 급상승",
  free:     "자유게시판",
  notice:   "전체 공지",
  update:   "업데이트",
};

export const useCategoryFeed = (category) => {
  const [page, setPage] = useState(1);
  const sentinelRef = useRef(null);

  const source = useMemo(() => SOURCE_MAP[category] ?? [], [category]);
  const items = useMemo(
    () => source.slice(0, page * PAGE_SIZE),
    [source, page]
  );
  const hasMore = page * PAGE_SIZE < source.length;
  const title = TITLE_MAP[category] ?? "";
  const total = source.length;

  const loadMore = useCallback(() => setPage((p) => p + 1), []);

  return { items, hasMore, loadMore, sentinelRef, title, total };
};
