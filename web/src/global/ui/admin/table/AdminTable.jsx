import styles from "./AdminTable.module.scss";

// 열 정의 기반 sticky-header 표. 레전드/히스토리 재료 표의 정렬·고정폭·hover 규칙을 계승.
// columns: [{ key, label, width, sticky, sortable, align:'left'|'center', render(row,index) }]
// renderDetail 을 주면 행 클릭 시 바로 아래 <tr> 로 펼치는 인라인 상세를 지원한다(선택).
const AdminTable = ({
  columns,
  rows,
  rowKey = (row) => row.id,
  sortKey,
  sortDir = -1,
  onSort,
  onRowClick,
  expandedKey,
  renderDetail,
}) => {
  const cellClass = (col) =>
    [styles.cell, col.sticky ? styles.sticky : "", col.align === "left" ? styles.alignLeft : ""]
      .filter(Boolean)
      .join(" ");

  const cellStyle = (col) => (col.width != null ? { width: col.width } : undefined);

  return (
    <div className={styles.tableBox}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${cellClass(col)} ${col.sortable ? styles.sortable : ""}`}
                style={cellStyle(col)}
                onClick={col.sortable ? () => onSort?.(col.key) : undefined}
              >
                {col.label}
                {col.sortable && sortKey === col.key && (
                  <span className={styles.arrow}>{sortDir < 0 ? "▼" : "▲"}</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => {
            const key = rowKey(row);
            const open = expandedKey != null && expandedKey === key;
            return [
              <tr
                key={key}
                className={`${styles.row} ${onRowClick ? styles.clickable : ""} ${open ? styles.open : ""}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cellClass(col)} style={cellStyle(col)}>
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>,
              open && renderDetail && (
                <tr key={`${key}-detail`} className={styles.detailRow}>
                  <td colSpan={columns.length}>{renderDetail(row)}</td>
                </tr>
              ),
            ];
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminTable;
