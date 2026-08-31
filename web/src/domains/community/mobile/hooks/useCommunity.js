// [미사용/삭제 대상] 2026-08-31 읽기 전용 재오픈 시 CommunityScreen.jsx 가
// useUserBoard/useUserPost(실 API) 로 대체 — mock 데이터 기반이라 더 이상 쓰이지 않음.
// 샌드박스 권한으로 파일 삭제가 막혀 주석만 남김 — 수동 삭제 필요.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { COMMUNITY_CATEGORIES } from "@/data/community/categories.js";
import { COMMUNITY_NOTICES } from "@/data/community/notices.js";
import { COMMUNITY_HOT_POSTS } from "@/data/community/hotPosts.js";
import { COMMUNITY_POSTS } from "@/data/community/posts.js";

const NOTICE_LIMIT = 3;
const HOT_PAGE_SIZE = 5;
const POSTS_PAGE_SIZE = 10;

// 메인 화면("전체") 전용 — 카테고리 단일 화면은 useCategoryFeed 사용
export const useCommunity = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState(
    () => searchParams.get("category") ?? "all"
  );
  const [hotPage, setHotPage] = useState(1);
  const [postsPage, setPostsPage] = useState(1);
  const postsSentinelRef = useRef(null);

  const notices = useMemo(
    () => COMMUNITY_NOTICES.slice(0, NOTICE_LIMIT),
    []
  );

  const hotPosts = useMemo(
    () => COMMUNITY_HOT_POSTS.slice(0, hotPage * HOT_PAGE_SIZE),
    [hotPage]
  );

  const posts = useMemo(
    () => COMMUNITY_POSTS.slice(0, postsPage * POSTS_PAGE_SIZE),
    [postsPage]
  );

  const hasMoreHot = hotPage * HOT_PAGE_SIZE < COMMUNITY_HOT_POSTS.length;
  const hasMorePosts = postsPage * POSTS_PAGE_SIZE < COMMUNITY_POSTS.length;

  const loadMoreHot = useCallback(() => {
    setHotPage((p) => p + 1);
  }, []);

  const loadMorePosts = useCallback(() => {
    setPostsPage((p) => p + 1);
  }, []);

  const handleCategoryChange = useCallback(
    (key) => {
      setSelectedCategory(key);
      setHotPage(1);
      setPostsPage(1);
      // URL 동기화 → MobileLayout이 search 변경 감지해서 스크롤 top
      setSearchParams(key === "all" ? {} : { category: key });
    },
    [setSearchParams]
  );

  // URL ?category=xxx 가 변경되면 selectedCategory 동기화 (home → community 진입)
  useEffect(() => {
    const cat = searchParams.get("category") ?? "all";
    setSelectedCategory(cat);
    setHotPage(1);
    setPostsPage(1);
  }, [searchParams]);

  useEffect(() => {
    if (selectedCategory !== "all") return;
    if (!hasMorePosts) return;
    const node = postsSentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadMorePosts();
        });
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [selectedCategory, hasMorePosts, loadMorePosts, posts.length]);

  return {
    categories: COMMUNITY_CATEGORIES,
    selectedCategory,
    notices,
    hotPosts,
    posts,
    hasMoreHot,
    hasMorePosts,
    postsSentinelRef,
    handleCategoryChange,
    loadMoreHot,
  };
};
