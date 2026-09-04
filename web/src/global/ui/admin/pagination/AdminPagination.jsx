import styles from "./AdminPagination.module.scss";

// ‹ 1 2 3 › 번호식 페이지네이션. page 는 0-base, pageCount<=1 이면 렌더하지 않는다
// (v2 원본: hasPages = pageCount>1).
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
      {Array.from({ length: pageCount }, (_, i) => (
        <button
          key={i}
          type="button"
          className={styles.pageBtn}
          aria-pressed={i === page}
          onClick={() => go(i)}
        >
          {i + 1}
        </button>
      ))}
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
