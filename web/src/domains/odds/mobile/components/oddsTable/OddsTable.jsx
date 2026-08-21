import { useEffect, useMemo, useRef, useState } from "react";
import styles from "./OddsTable.module.scss";

// 셀 링크 렌더 (표 안 href) — 외부 URL, 새 탭
const CellContent = ({ cell }) => {
  if (cell?.href) {
    return (
      <a href={cell.href} target="_blank" rel="noopener noreferrer" className={styles.cellLink}>
        {cell.text}
      </a>
    );
  }
  return cell?.text ?? "";
};

// rowSpan/colSpan 은 1이면 아예 없는 값 → 있을 때만 속성으로 전달
const spanProps = (cell) => {
  const props = {};
  if (cell?.rowSpan && cell.rowSpan !== 1) props.rowSpan = cell.rowSpan;
  if (cell?.colSpan && cell.colSpan !== 1) props.colSpan = cell.colSpan;
  return props;
};

// 행의 colSpan 합 — 첫 행이 colCount 를 채우지 못하면 table-layout: fixed 를
// 강제하지 않고 auto 로 폴백한다 (병합 셀 + fixed 조합에서 열 폭이 깨지는 것 방지)
const rowSpanSum = (row) =>
  (row ?? []).reduce((sum, cell) => sum + (cell?.colSpan ?? 1), 0);

// 병합 셀을 고려해 각 셀의 "실제 격자 열 index" 를 계산한다 (HTML 표 배치 규칙과 동일).
// 이전 행의 rowSpan 이 점유 중인 열은 건너뛰고, 남은 자리에 왼쪽부터 colSpan 만큼 채운다.
// 반환값은 입력과 같은 모양(행 배열의 배열)이며 각 셀이 { cell, gridCol } 로 감싸진다.
const computeGridColumns = (rowsInput) => {
  const occupied = {}; // col → 이후 몇 행 더 점유되는지 (현재 행 처리 시점 기준)

  return (rowsInput ?? []).map((row) => {
    const newBlocks = {};
    let col = 0;

    const placed = (row ?? []).map((cell) => {
      while (occupied[col] > 0) col++;

      const gridCol = col;
      const colSpan = cell?.colSpan ?? 1;
      const rowSpan = cell?.rowSpan ?? 1;

      if (rowSpan > 1) {
        for (let j = 0; j < colSpan; j++) newBlocks[col + j] = rowSpan - 1;
      }

      col += colSpan;
      return { cell, gridCol };
    });

    // 이 행 처리가 끝났다 — 기존 점유는 1행 소모, 이 행에서 새로 생긴 점유를 반영
    Object.keys(occupied).forEach((k) => {
      occupied[k] = Math.max(0, occupied[k] - 1);
    });
    Object.entries(newBlocks).forEach(([k, v]) => {
      occupied[k] = v;
    });

    return placed;
  });
};

// 확률 공시 표 — block.wide 로 렌더 분기
//   wide === false (2~4열) : 폭 100% 고정, 가로 스크롤 없음
//   wide === true  (5열+)  : 가로 스크롤 + 진짜 0열 셀만 sticky 고정
const OddsTable = ({ block }) => {
  const { head = null, rows = [], wide = false, colCount = null } = block;
  const scrollRef = useRef(null);
  const [showHint, setShowHint] = useState(wide);

  const canUseFixedLayout = useMemo(() => {
    if (!colCount) return true;
    const firstRow = head ?? rows[0] ?? [];
    return rowSpanSum(firstRow) === colCount;
  }, [head, rows, colCount]);

  // wide 표에서만 필요 — 병합을 감안한 실제 0열 위치 계산 (head/body 는 각자 독립 그리드)
  const gridHead = useMemo(
    () => (wide && head ? computeGridColumns([head])[0] : null),
    [wide, head]
  );
  const gridRows = useMemo(
    () => (wide ? computeGridColumns(rows) : null),
    [wide, rows]
  );

  useEffect(() => {
    if (!wide) return;
    const el = scrollRef.current;
    if (!el) return;

    // 스크롤이 끝(우측)에 닿으면 힌트/페이드 숨김
    const handleScroll = () => {
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
      setShowHint(!atEnd);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [wide]);

  if (wide) {
    return (
      <div className={styles.wideWrap}>
        <div className={styles.tableArea}>
          <div className={styles.scrollWrap} ref={scrollRef}>
            <table className={`${styles.table} ${styles.wideTable}`}>
              {gridHead && (
                <thead>
                  <tr>
                    {gridHead.map(({ cell, gridCol }, i) => (
                      <th
                        key={i}
                        className={`${styles.th} ${styles.wideCell} ${gridCol === 0 ? styles.sticky : ""}`}
                        {...spanProps(cell)}
                      >
                        <CellContent cell={cell} />
                      </th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {gridRows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map(({ cell, gridCol }, ci) => (
                      <td
                        key={ci}
                        className={`${styles.cell} ${styles.wideCell} ${gridCol === 0 ? styles.sticky : ""}`}
                        {...spanProps(cell)}
                      >
                        <CellContent cell={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {showHint && <div className={styles.fade} aria-hidden="true" />}
        </div>
        {showHint && <div className={styles.scrollHint}>좌우로 밀어서 보세요 ›</div>}
      </div>
    );
  }

  return (
    <div className={styles.fixedWrap}>
      <table className={`${styles.table} ${canUseFixedLayout ? styles.fixedTable : styles.autoTable}`}>
        {head && (
          <thead>
            <tr>
              {head.map((cell, i) => (
                <th key={i} className={styles.th} {...spanProps(cell)}>
                  <CellContent cell={cell} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td key={ci} className={styles.cell} {...spanProps(cell)}>
                  <CellContent cell={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OddsTable;
