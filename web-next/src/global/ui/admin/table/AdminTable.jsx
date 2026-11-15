import AdminCheckbox from "@/global/ui/admin/checkbox/AdminCheckbox.jsx";
import styles from "./AdminTable.module.scss";

// 열 정의 기반 sticky-header 표. 레전드/히스토리 재료 표의 정렬·고정폭·hover 규칙을 계승.
// columns: [{ key, label, width, sticky, sortable, align:'left'|'center', render(row,index) }]
// renderDetail 을 주면 행 클릭 시 바로 아래 <tr> 로 펼치는 인라인 상세를 지원한다(선택).
//
// 체크박스 선택(v2) — selectable=true 일 때만 맨 앞에 28px 고정폭 체크박스 칸을
// 헤더(전체선택)/행에 추가한다. 유저 탭처럼 체크박스가 없는 화면은 selectable 을
// 아예 넘기지 않는다(prop 자체가 옵션 — 기존 호출부와 100% 하위호환).
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
  selectable = false,
  selectedKeys,
  allSelected = false,
  onToggleRow,
  onToggleAll,
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
            {selectable && (
              <th className={`${styles.cell} ${styles.checkboxCell}`} style={{ width: 28 }}>
                <AdminCheckbox checked={allSelected} onChange={onToggleAll} ariaLabel="전체 선택" />
              </th>
            )}
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
            const selected = selectable && !!selectedKeys?.has(key);
            return [
              <tr
                key={key}
                className={`${styles.row} ${onRowClick ? styles.clickable : ""} ${open ? styles.open : ""} ${selected ? styles.selectedRow : ""}`}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
              >
                {selectable && (
                  <td className={`${styles.cell} ${styles.checkboxCell}`} style={{ width: 28 }}>
                    <AdminCheckbox
                      checked={selected}
                      onChange={() => onToggleRow?.(row)}
                      ariaLabel={`${key} 선택`}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={cellClass(col)} style={cellStyle(col)}>
                    {col.render ? col.render(row, index) : row[col.key]}
                  </td>
                ))}
              </tr>,
              open && renderDetail && (
                <tr key={`${key}-detail`} className={styles.detailRow}>
                  <td colSpan={columns.length + (selectable ? 1 : 0)}>{renderDetail(row)}</td>
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
