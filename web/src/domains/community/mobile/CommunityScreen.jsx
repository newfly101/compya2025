import { useEffect, useRef } from "react";
import "./community.tokens.scss";
import CategoryChip from "./components/categoryChip/CategoryChip.jsx";
import PostRow from "./components/postRow/PostRow.jsx";
import HotPostCard from "./components/hotPostCard/HotPostCard.jsx";
import Section from "./components/section/Section.jsx";
import CategoryScreen from "./CategoryScreen.jsx";
import { useCommunity } from "./hooks/useCommunity.js";
import styles from "./CommunityScreen.module.scss";

const CommunityScreen = () => {
  const {
    categories,
    selectedCategory,
    notices,
    hotPosts,
    posts,
    hasMoreHot,
    hasMorePosts,
    postsSentinelRef,
    handleCategoryChange,
    loadMoreHot,
  } = useCommunity();

  const hotScrollRef = useRef(null);
  const hotSentinelRef = useRef(null);

  useEffect(() => {
    if (selectedCategory !== "all") return;
    if (!hasMoreHot) return;
    const root = hotScrollRef.current;
    const node = hotSentinelRef.current;
    if (!root || !node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadMoreHot();
        });
      },
      { root, rootMargin: "0px 100px 0px 0px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [selectedCategory, hasMoreHot, loadMoreHot, hotPosts.length]);

  const isCategoryView = selectedCategory !== "all";

  return (
    <main className={styles.page}>
      <div className={styles.categoryRow}>
        {categories.map((c) => (
          <CategoryChip
            key={c.key}
            label={c.label}
            selected={selectedCategory === c.key}
            onClick={() => handleCategoryChange(c.key)}
          />
        ))}
      </div>

      {isCategoryView ? (
        <CategoryScreen key={selectedCategory} category={selectedCategory} />
      ) : (
        <>
          <Section
            title="공지사항"
            onShowAll={() => handleCategoryChange("notice")}
          >
            <div className={styles.list}>
              {notices.map((n) => (
                <PostRow key={n.id} post={n} defaultBadge="notice" />
              ))}
            </div>
          </Section>

          <Section
            title="인기 급상승"
            onShowAll={() => handleCategoryChange("trending")}
          >
            <div ref={hotScrollRef} className={styles.hotScroll}>
              {hotPosts.map((h) => (
                <HotPostCard key={h.id} post={h} />
              ))}
              {hasMoreHot && (
                <div ref={hotSentinelRef} className={styles.hotSentinel} />
              )}
            </div>
          </Section>

          <Section title="최신 게시글">
            <div className={styles.list}>
              {posts.map((p) => (
                <PostRow key={p.id} post={p} />
              ))}
              {hasMorePosts && (
                <div ref={postsSentinelRef} className={styles.postsSentinel} />
              )}
            </div>
          </Section>
        </>
      )}

      {/* TODO: 글쓰기 action 연결 필요 (라우트 이동 또는 모달 — 로그인 분기 포함) */}
      <button type="button" className={styles.fab} aria-label="글쓰기">
        <span className={styles.fabIcon}>✏️</span>
        <span className={styles.fabLabel}>글쓰기</span>
      </button>
    </main>
  );
};

export default CommunityScreen;
