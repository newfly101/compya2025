import styles from "./AdminToolbar.module.scss";

// 검색 input + 필터 chip row + "+ 등록" 버튼 한 줄.
// filters: [{ key, label, options: [{value,label}], value, onChange }]
const AdminToolbar = ({
  search,
  onSearchChange,
  searchPlaceholder = "검색",
  filters = [],
  onCreate,
  createLabel = "등록",
}) => {
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
              </button>
            ))}
          </div>
        </div>
      ))}

      {onCreate && (
        <div className={styles.addRow}>
          <button type="button" className={styles.addBtn} onClick={onCreate}>
            {`+ ${createLabel}`}
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminToolbar;
