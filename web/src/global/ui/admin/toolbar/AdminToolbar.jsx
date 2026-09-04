import styles from "./AdminToolbar.module.scss";

// 검색 input + 필터 chip row(건수 표시, 여러 줄 가능) + 정보 행(총계/선택 상태 · 정렬 라벨 · "+ 등록") 한 줄.
// filters: [{ key, label, options: [{value,label,count?}], value, onChange }]
//
// 일괄 삭제·숨김(v2) — selectedCount > 0 일 때 총계 옆에 "{N}개 선택" + 액션 버튼을 보여준다.
// onBulkDelete/onBulkHide 를 넘기지 않은 도메인(퀴즈=숨김 없음, 유저=선택 자체 없음)은
// 해당 버튼이 렌더되지 않는다 — prop 자체가 옵션.
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
  selectedCount = 0,
  onBulkDelete,
  onBulkHide,
  bulkDeleteLabel = "선택 삭제",
  bulkHideLabel = "숨김",
}) => {
  const hasSelection = selectedCount > 0 && (onBulkDelete || onBulkHide);
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
            {hasSelection && (
              <span className={styles.selection}>
                <span className={styles.selectionCount}>{selectedCount}개 선택</span>
                {onBulkDelete && (
                  <button type="button" className={styles.bulkDeleteBtn} onClick={onBulkDelete}>
                    {bulkDeleteLabel}
                  </button>
                )}
                {onBulkHide && (
                  <button type="button" className={styles.bulkHideBtn} onClick={onBulkHide}>
                    {bulkHideLabel}
                  </button>
                )}
              </span>
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
