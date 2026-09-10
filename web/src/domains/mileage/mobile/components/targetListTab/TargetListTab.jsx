// domains/mileage/mobile/components/targetListTab/TargetListTab.jsx
// 「저격 선수 리스트」 탭 본문 — 검색행 → 포지션칩 → 카운터행 → 표 → 도움말 모달.
// 재사용처는 없지만(design-spec §4) 탭 하나 분량을 MileageScreen.jsx 에 그대로 두면
// 파일이 400줄을 넘겨(file-split.md) 통째로 뺐다 — 표 행처럼 반복 부품을 쪼갠 게 아니다.
//
// "레전드 미정" 카운터는 만들지 않는다 — BE 쿼리가 INNER JOIN 이라 실데이터로는 항상
// 0건이라 존재할 수 없는 상태의 UI를 만들지 않기로 했다(design-spec §0 HITL 결정).

import { useState } from "react";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import { POS_ROWS, SORT_LABEL, teamDotColor } from "@/domains/mileage/config/mileageTargetList.js";
import styles from "./TargetListTab.module.scss";

const COLUMNS = [
  { key: "rank", label: "#", sortable: false },
  { key: "legend", label: "레전드", sortable: true },
  { key: "name", label: "재료 카드", sortable: true },
  { key: "team", label: "구단", sortable: true },
  { key: "year", label: "연도", sortable: true },
  { key: "pos", label: "포지션", sortable: true },
];

const SEARCH_PLACEHOLDER = {
  pos: "재료 선수명, 구단, 연도",
  legend: "저격 레전드 이름",
};

const TargetListTab = ({
  rows,
  total,
  loading,
  loaded,
  error,
  retry,
  query,
  setQuery,
  mode,
  changeMode,
  pos,
  selectPos,
  availablePositions,
  sortKey,
  dir,
  toggleSort,
  reverseDir,
  highlightId,
  onSelectRow,
}) => {
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className={styles.tab}>
      <div className={styles.searchRow}>
        <div className={styles.modeToggle} role="tablist" aria-label="검색 대상">
          <button type="button" aria-pressed={mode === "pos"} onClick={() => changeMode("pos")}>
            재료
          </button>
          <button
            type="button"
            aria-pressed={mode === "legend"}
            onClick={() => changeMode("legend")}
          >
            레전드
          </button>
        </div>
        <div className={styles.searchInput}>
          <span className={styles.searchIcon} aria-hidden="true" />
          <input
            type="search"
            value={query}
            placeholder={SEARCH_PLACEHOLDER[mode]}
            autoComplete="off"
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.posGrid}>
        <button type="button" className={styles.chip} aria-pressed={pos === null} onClick={() => selectPos(null)}>
          전체
        </button>
        <div className={styles.posRows}>
          {POS_ROWS.map((row, i) => (
            <div key={i} className={styles.posRow}>
              {row.map((p) => {
                const disabled = !availablePositions.has(p);
                return (
                  <button
                    key={p}
                    type="button"
                    className={styles.chip}
                    aria-pressed={pos === p}
                    disabled={disabled}
                    onClick={() => selectPos(p)}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className={styles.counter}>
        <span className={styles.counterLeft}>
          <b>{`${rows.length}명`}</b>
          <button type="button" className={styles.helpButton} onClick={() => setHelpOpen(true)}>
            <span className={styles.helpMark} aria-hidden="true">
              ?
            </span>
            도움말
          </button>
        </span>
        <button type="button" className={styles.sortLabel} onClick={reverseDir}>
          {`${SORT_LABEL[sortKey]} ${dir > 0 ? "▲" : "▼"}`}
        </button>
      </div>

      <div className={styles.tableBox}>
        <table className={styles.table}>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th
                  key={col.key}
                  className={`${styles[`c${col.key}`]} ${col.sortable ? styles.sortable : ""}`}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                >
                  {col.label}
                  {col.sortable && sortKey === col.key && (
                    <span className={styles.arrow}>{dir > 0 ? "▲" : "▼"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!loaded &&
              loading &&
              Array.from({ length: 12 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={COLUMNS.length}>
                    <Skeleton count={1} height={18} />
                  </td>
                </tr>
              ))}

            {!loaded && !loading && error && (
              <tr>
                <td colSpan={COLUMNS.length} className={styles.stateCell}>
                  불러오지 못했습니다.
                  <button type="button" className={styles.retryBtn} onClick={retry}>
                    다시 시도
                  </button>
                </td>
              </tr>
            )}

            {loaded && rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length} className={styles.stateCell}>
                  조건에 맞는 선수가 없습니다.
                </td>
              </tr>
            )}

            {loaded &&
              rows.map((row, index) => (
                <tr
                  key={row.id}
                  className={`${styles.row} ${row.id === highlightId ? styles.selected : ""}`}
                  onClick={() => onSelectRow(row)}
                >
                  <td className={styles.crank}>{index + 1}</td>
                  <td className={styles.clegend}>{row.legend ?? "—"}</td>
                  <td className={styles.cname}>
                    <span className={styles.nameInner}>
                      <span
                        className={styles.nameDot}
                        style={{ background: teamDotColor(row.team) }}
                        aria-hidden="true"
                      />
                      {row.name}
                    </span>
                  </td>
                  <td className={styles.cteam}>{row.team}</td>
                  <td className={styles.cyear}>{row.year}</td>
                  <td className={styles.cpos}>{row.pos}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {helpOpen && (
        <div className={styles.overlay} role="presentation" onClick={() => setHelpOpen(false)}>
          <div
            className={styles.helpCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="target-list-help-title"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="target-list-help-title" className={styles.helpTitle}>
              저격 선수 리스트
            </h2>
            <p className={styles.helpSubtitle}>{`L마크 레전드 재료 노말 카드 ${total}종`}</p>
            <dl className={styles.helpList}>
              <div className={styles.helpRow}>
                <dt>선수 클릭</dt>
                <dd>
                  저격 시뮬레이션으로 이동.
                  <br />
                  목표 구단 · 연도 · 포지션 자동 입력.
                </dd>
              </div>
              <div className={styles.helpRow}>
                <dt>포지션 칩</dt>
                <dd>포지션별 필터 설정 (타자/투수)</dd>
              </div>
              <div className={styles.helpRow}>
                <dt>검색</dt>
                <dd>
                  재료 = 선수명 · 구단 · 연도
                  <br />
                  레전드 = 저격 레전드 이름
                </dd>
              </div>
              <div className={styles.helpRow}>
                <dt>열 제목</dt>
                <dd>오름 ▲ / 내림 ▼ 차순 정렬 가능.</dd>
              </div>
            </dl>
            <button type="button" className={styles.helpClose} onClick={() => setHelpOpen(false)}>
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TargetListTab;
