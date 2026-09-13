// domains/players/mobile/components/statsTable/StatsTable.jsx
// 리스트형 표 1개(스탯 또는 구종 등급) — 왼쪽(식별 열)·오른쪽(능력치) 두 패널 다 스크롤 없이
// 폭 계산으로 한 화면에 담는다(400px 미만 좁은 화면만 예외로 왼쪽 패널에 스크롤을 남긴다).
import styles from "./StatsTable.module.scss";

const Arrow = ({ dir }) =>
  dir ? <span className={styles.arrow}>{dir === 1 ? "▲" : "▼"}</span> : null;

// hideHead: 광고로 끊어 이어붙이는 두 번째 이후 세그먼트에서 열 머리글을 반복 렌더하지
// 않기 위한 옵션(선수 백과 표형 in-feed 광고, PlayerEncyclopediaScreen 참고). 기본값 false라
// 기존 단일 호출부는 영향이 없다 — 다른 화면이 이 컴포넌트를 새로 쓰게 되어도 안전.
const StatsTable = ({ leftCols, rightCols, rows, rightColWidth, hideHead = false }) => (
  <div className={styles.wrap}>
    <div className={styles.leftPanel}>
      <table className={`${styles.table} ${styles.leftTable}`}>
        {!hideHead && (
          <thead>
            <tr>
              {leftCols.map((c) => (
                <th
                  key={c.key}
                  onClick={c.onClick}
                  className={`${styles.th} ${c.active ? styles.thActive : ""} ${c.onClick ? styles.sortable : ""}`}
                  style={{ width: c.width, textAlign: c.align }}
                >
                  {c.label}
                  <Arrow dir={c.dir} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={styles.row}>
              {row.left.map((cell) => (
                <td
                  key={cell.key}
                  className={`${styles.td} ${cell.key === "n" ? styles.tdName : ""}`}
                  style={{ textAlign: leftCols.find((c) => c.key === cell.key)?.align }}
                >
                  {cell.value}
                  {cell.showL && <span className={styles.lMark}>L</span>}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className={styles.rightPanel}>
      <table className={`${styles.table} ${styles.rightTable}`} style={{ tableLayout: "fixed" }}>
        {!hideHead && (
          <thead>
            <tr>
              {rightCols.map((c) => (
                <th
                  key={c.key}
                  onClick={c.onClick}
                  className={`${styles.th} ${styles.thRight} ${c.active ? styles.thActive : ""}`}
                  style={{ width: rightColWidth }}
                >
                  {c.label}
                  <Arrow dir={c.dir} />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={styles.row}>
              {row.right.map((cell) => (
                <td
                  key={cell.key}
                  className={`${styles.td} ${styles.tdRight} ${cell.active ? styles.tdActive : ""}`}
                  style={{ color: cell.color }}
                >
                  {cell.value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default StatsTable;
