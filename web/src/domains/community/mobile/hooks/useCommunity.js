import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { COMMUNITY_CATEGORIES } from "@/data/community/categories.js";
import { COMMUNITY_NOTICES } from "@/data/community/notices.js";
import { COMMUNITY_HOT_POSTS } from "@/data/community/hotPosts.js";
import { COMMUNITY_POSTS } from "@/data/community/posts.js";

const NOTICE_LIMIT = 3;
const HOT_PAGE_SIZE = 5;
const POSTS_PAGE_SIZE = 10;

// 메인 화면("전체") 전용 — 카테고리 단일 화면은 useCategoryFeed 사용
export const useCommunity = () => {
  const [selectedCategory, setSelectedCategory] = useState("all");
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

  const handleCategoryChange = useCallback((key) => {
    setSelectedCategory(key);
    setHotPage(1);
    setPostsPage(1);
  }, []);

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
