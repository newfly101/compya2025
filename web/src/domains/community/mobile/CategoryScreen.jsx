import { useEffect } from "react";
import PostRow from "./components/postRow/PostRow.jsx";
import Section from "./components/section/Section.jsx";
import { useCategoryFeed } from "./hooks/useCategoryFeed.js";
import { formatCount } from "./utils.js";
import styles from "./CategoryScreen.module.scss";

const CategoryScreen = ({ category }) => {
  const { items, hasMore, loadMore, sentinelRef, title, total } =
    useCategoryFeed(category);

  useEffect(() => {
    if (!hasMore) return;
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) loadMore();
        });
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore, items.length, sentinelRef]);

  const isNotice = category === "notice";

  return (
    <Section title={title} rightText={`총 ${formatCount(total)}개`}>
      <div className={styles.list}>
        {items.map((item) => (
          <PostRow
            key={item.id}
            post={item}
            defaultBadge={isNotice ? "notice" : undefined}
          />
        ))}
        {hasMore && <div ref={sentinelRef} className={styles.sentinel} />}
      </div>
    </Section>
  );
};

export default CategoryScreen;
