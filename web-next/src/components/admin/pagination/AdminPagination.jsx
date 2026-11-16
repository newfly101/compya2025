import styles from "./AdminPagination.module.scss";

// ‹ 1 2 3 › 번호식 페이지네이션. page 는 0-base, pageCount<=1 이면 렌더하지 않는다
// (v2 원본: hasPages = pageCount>1).
// pageCount<=7 이면 전부 보여준다. 그 이상이면 현재 ±1, 첫/마지막 페이지만 남기고 "…" 로 축약
// (모바일 360px 기준: 버튼 min-width 30px + gap 8px, 최대 9개=9*30+8*8=334px 로 들어옴. ±2 는 410px 로 넘침)
const buildPageWindow = (page, pageCount) => {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, i) => i);
  const keep = [...new Set([0, page - 1, page, page + 1, pageCount - 1])]
    .filter((i) => i >= 0 && i < pageCount)
    .sort((a, b) => a - b);
  return keep.flatMap((p, i) => (i > 0 && p - keep[i - 1] > 1 ? [`e${p}`, p] : [p]));
};

const AdminPagination = ({ page, pageCount, onChange }) => {
  if (pageCount <= 1) return null;

  const go = (next) => onChange(Math.min(pageCount - 1, Math.max(0, next)));

  return (
    <div className={styles.pagination}>
      <button
        type="button"
        className={styles.pageBtn}
        disabled={page === 0}
        onClick={() => go(page - 1)}
        aria-label="이전 페이지"
      >
        ‹
      </button>
      {buildPageWindow(page, pageCount).map((p) =>
        typeof p === "string" ? (
          <span key={p} className={`${styles.pageBtn} ${styles.ellipsis}`} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            className={styles.pageBtn}
            aria-pressed={p === page}
            onClick={() => go(p)}
          >
            {p + 1}
          </button>
        ),
      )}
      <button
        type="button"
        className={styles.pageBtn}
        disabled={page === pageCount - 1}
        onClick={() => go(page + 1)}
        aria-label="다음 페이지"
      >
        ›
      </button>
    </div>
  );
};

export default AdminPagination;
