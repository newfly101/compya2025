import styles from "./AdminToolbar.module.scss";

// 검색 input + 필터 chip row(건수 표시) + 정보 행(총계 · 정렬 라벨 · "+ 등록") 한 줄.
// filters: [{ key, label, options: [{value,label,count?}], value, onChange }]
// 다중선택/일괄삭제/일괄숨김은 이번 라운드 범위 밖(서버 일괄 API 없음) — props 자체를 두지 않는다.
const AdminToolbar = ({
  search,
  onSearchChange,
  searchPlaceholder = "검색",
  filters = [],
  totalCount,
  totalLabel = "개",
  sortLabel,
  onToggleSort,
  onCreate,
  createLabel = "등록",
}) => {
  const showInfoRow = totalCount != null || sortLabel || onCreate;

  return (
    <div className={styles.toolbar}>
      {onSearchChange && (
        <div className={styles.searchRow}>
          <input
            type="search"
            className={styles.searchInput}
            value={search}
            placeholder={searchPlaceholder}
            autoComplete="off"
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {search && (
            <button
              type="button"
              className={styles.clearButton}
              aria-label="검색어 지우기"
              onClick={() => onSearchChange("")}
            >
              ×
            </button>
          )}
        </div>
      )}

      {filters.map((filter) => (
        <div key={filter.key ?? filter.label} className={styles.filterRow}>
          {filter.label && <span className={styles.filterLabel}>{filter.label}</span>}
          <div className={styles.chipRow}>
            {filter.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={styles.chip}
                aria-pressed={opt.value === filter.value}
                onClick={() => filter.onChange(opt.value)}
              >
                {opt.label}
                {opt.count != null && <span className={styles.chipCount}>{opt.count}</span>}
              </button>
            ))}
          </div>
        </div>
      ))}

      {showInfoRow && (
        <div className={styles.infoRow}>
          <span className={styles.total}>
            {totalCount != null && (
              <>
                <b>{totalCount}</b>
                {totalLabel}
              </>
            )}
          </span>
          <div className={styles.infoRight}>
            {sortLabel && (
              <button
                type="button"
                className={styles.sortLabel}
                onClick={onToggleSort}
                disabled={!onToggleSort}
              >
                {sortLabel}
              </button>
            )}
            {onCreate && (
              <button type="button" className={styles.addBtn} onClick={onCreate}>
                {`+ ${createLabel}`}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminToolbar;
