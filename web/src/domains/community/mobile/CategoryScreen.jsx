// [미사용/삭제 대상] 2026-08-31 읽기 전용 재오픈 시 CommunityScreen.jsx 에서 더 이상
// import 하지 않음. mock 카테고리(인기급상승/업데이트 등) 기반이라 실제 게시판(TIP/CLUB)과
// 매핑 불가. 샌드박스 권한으로 파일 삭제가 막혀 주석만 남김 — 수동 삭제 필요.
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
