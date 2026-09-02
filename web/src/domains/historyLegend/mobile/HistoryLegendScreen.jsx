import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ALL,
  SORTABLE,
  SORT_DEFAULT,
  SORT_LABEL,
  VIEW,
  dayOk,
  dayOptions,
  legendSummary,
  makeLegendHit,
  matchedMaterials,
  posOptions,
  resolveLegend,
  roundLabel,
  sortDirectionLabel,
  sortRows,
  teamColor,
  teamOptions,
  weekOptions,
} from "@/domains/historyLegend/config/historyLegend.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useHistoryLegend } from "./hooks/useHistoryLegend";
import "./historyLegend.tokens.scss";
import styles from "./HistoryLegendScreen.module.scss";

// 합계를 375px(가장 좁은 모바일) 안에 넣어 가로 스크롤을 없앤다.
// 대상 레전드가 이 표의 핵심이라 남는 폭을 몰아주고, 5명이 다 안 들어가면
// 앞 3명 + "외 N" 으로 접는다. 팀명은 부가 정보라 좁히고 넘치면 말줄임한다.
// sticky 는 Day 하나만 — 스크롤이 생기더라도 어느 라운드인지만 남으면 된다.
const COLS = {
  [VIEW.ROUND]: [
    { key: "day", label: "Day", w: 42, left: 0 },
    { key: "dow", label: "요일", w: 28 },
    { key: "label", label: "팀명", w: 76, alignLeft: true },
    { key: "cnt", label: "재료", w: 34 },
    // 폭을 주지 않는다 — 남는 화면을 이 칸이 흡수한다
    { key: "legends", label: "대상 레전드", alignLeft: true },
  ],
  [VIEW.LEGEND]: [
    { key: "name", label: "레전드", w: 88, left: 0, alignLeft: true },
    { key: "pos", label: "포지션", w: 58 },
    { key: "cnt", label: "재료", w: 34 },
    // 폭을 주지 않는다 — 남는 화면을 이 칸이 흡수한다
    { key: "days", label: "등장 일차" },
  ],
};

const HistoryLegendScreen = () => {
  useDomainTopBar("히스토리 재료 탐색기");

  const { rounds, legends, materials, meta, loading, loaded, error } = useHistoryLegend();
  const [searchParams] = useSearchParams();

  const [view, setView] = useState(VIEW.LEGEND);
  const [week, setWeek] = useState(ALL);
  const [day, setDay] = useState(ALL);
  const [team, setTeam] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [pos, setPos] = useState(ALL);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(SORT_DEFAULT[VIEW.LEGEND]);
  const [dir, setDir] = useState(-1);
  const [openId, setOpenId] = useState(null);

  const deepLinkDone = useRef(false);
  const scrollTarget = useRef(null);

  // 평점표에서 ?legend=... 로 넘어온 경우. 마스터가 도착해야 이름을 맞출 수 있다
  useEffect(() => {
    if (deepLinkDone.current || legends.length === 0) return;
    deepLinkDone.current = true;

    const name = resolveLegend(searchParams.get("legend"), legends);
    if (!name) return; // 못 찾으면 조용히 기본 화면

    // 필터가 남아 있으면 해당 레전드가 걸러져 빈 화면이 된다
    setView(VIEW.LEGEND);
    setTeam(ALL);
    setType(ALL);
    setPos(ALL);
    setSort(SORT_DEFAULT[VIEW.LEGEND]);
    setDir(-1);
    setQuery(name); // 검색창에 값이 보여야 사용자가 지울 수 있다
    setOpenId(`l${name}`);
    scrollTarget.current = `l${name}`;
  }, [legends, searchParams]);

  useEffect(() => {
    if (!scrollTarget.current) return;
    const el = document.querySelector(`[data-row-id="${scrollTarget.current}"]`);
    scrollTarget.current = null;
    el?.scrollIntoView({ block: "center" });
  });

  const legendHit = useMemo(() => makeLegendHit(query, meta), [query, meta]);
  // 고정 칸 합계 + 마지막 칸 최소 폭. 이보다 좁아지면 가로 스크롤이 걸린다
  const tableMinWidth = useMemo(
    () => COLS[view].reduce((sum, c) => sum + (c.w ?? 150), 0),
    [view],
  );
  // 일차 범위는 데이터에서 뽑는다 — 라운드가 늘면 안내도 따라 바뀐다
  const maxDay = useMemo(() => rounds.reduce((a, r) => Math.max(a, r.day), 0), [rounds]);
  const cols = COLS[view];

  const rows = useMemo(() => {
    if (view === VIEW.ROUND) {
      const list = rounds.filter(
        (r) => dayOk(r.day, { week, day }) && (!query || matchedMaterials(r, legendHit).length > 0),
      );
      const keyOf = {
        day: (r) => r.day * 10 + r.round,
        dow: (r) => r.day % 7,
        cnt: (r) => matchedMaterials(r, legendHit).length,
      }[sort] ?? ((r) => r.day * 10 + r.round);
      return sortRows(list, keyOf, {
        dir,
        ascendingKey: sort === "day",
        tieOf: (r) => -(r.day * 10 + r.round),
      });
    }

    const list = legends.filter(
      (l) =>
        (team === ALL || l.team === team) &&
        (type === ALL || l.type === type) &&
        (pos === ALL || l.pos?.includes(pos)) &&
        legendHit(l.name),
    );
    const keyOf = {
      cnt: (l) => l.mats.length,
      name: (l) => l.name,
      days: (l) => -l.days[0],
    }[sort] ?? ((l) => l.mats.length);
    return sortRows(list, keyOf, { dir, tieOf: (l) => -l.days[0] });
  }, [view, rounds, legends, week, day, team, type, pos, query, legendHit, sort, dir]);

  const selectView = (next) => {
    setView(next);
    setOpenId(null);
    setSort(SORT_DEFAULT[next]);
    setDir(-1);
  };

  const toggleSort = (key) => {
    if (sort === key) setDir((d) => -d);
    else {
      setSort(key);
      setDir(-1);
    }
  };

  const toggleRow = (id) => setOpenId((prev) => (prev === id ? null : id));

  const changeQuery = (value) => {
    setQuery(value);
    setOpenId(null);
  };

  /* ── 필터 줄 ── */

  const filterRow = (label, options, current, onSelect) => (
    <div className={styles.chipRow}>
      <span className={styles.chipLabel}>{label}</span>
      {options.map((opt) => {
        const [value, count] = Array.isArray(opt) ? opt : [opt, null];
        return (
          <button
            key={value}
            type="button"
            className={styles.chip}
            aria-pressed={value === current}
            onClick={() => onSelect(value)}
          >
            {value}
            {count != null && <span className={styles.chipCount}>{count}</span>}
          </button>
        );
      })}
    </div>
  );

  const renderFilters = () =>
    view === VIEW.ROUND ? (
      <>
        {filterRow("주차", weekOptions(), week, (v) => {
          setWeek(v);
          setDay(ALL); // 주차를 바꾸면 일차 목록이 교체된다
          setOpenId(null);
        })}
        {filterRow("일차", dayOptions(week), day, (v) => {
          setDay(v);
          setOpenId(null);
        })}
      </>
    ) : (
      <>
        {filterRow("구단", teamOptions(legends), team, (v) => {
          setTeam(v);
          setOpenId(null);
        })}
        {filterRow("타입", [ALL, "타자", "투수"], type, (v) => {
          setType(v);
          setPos(ALL); // 타입이 바뀌면 포지션 목록이 교체된다
          setOpenId(null);
        })}
        {filterRow("포지션", posOptions(legends, type), pos, (v) => {
          setPos(v);
          setOpenId(null);
        })}
      </>
    );

  /* ── 셀 ── */

  const cellStyle = (col) => ({
    ...(col.w != null ? { width: col.w } : {}),
    ...(col.left != null ? { left: col.left } : {}),
  });

  const cellClass = (col) =>
    [
      col.left != null ? styles.sticky : "",
      col.alignLeft ? styles.alignLeft : "",
      col.noClip ? styles.noClip : "",
    ]
      .filter(Boolean)
      .join(" ");

  const renderRoundCell = (round, col) => {
    if (col.key === "day") {
      return <span className={styles.dayBadge}>{roundLabel(round)}</span>;
    }
    if (col.key === "label") return round.label;
    if (col.key === "dow") return <span className={styles.dim}>{round.dow}</span>;
    if (col.key === "cnt") {
      const n = matchedMaterials(round, legendHit).length;
      return n ? <span className={styles.accent}>{n}</span> : <span className={styles.dim}>0</span>;
    }
    const names = [...new Set(matchedMaterials(round, legendHit).map((e) => e.legend))];
    return names.length ? (
      <span className={styles.muted} title={names.join(", ")}>
        {legendSummary(names)}
      </span>
    ) : (
      <span className={styles.dim}>—</span>
    );
  };

  const renderLegendCell = (legend, col) => {
    if (col.key === "name") {
      return (
        <span className={styles.nameInner}>
          <span
            className={styles.dot}
            style={{ background: teamColor(legend.team) }}
            aria-hidden="true"
          />
          {legend.name}
        </span>
      );
    }
    if (col.key === "pos") return <span className={styles.muted}>{legend.pos?.join(" ")}</span>;
    if (col.key === "cnt") return <span className={styles.accent}>{legend.mats.length}</span>;

    // 14칸 막대. D7과 D8 사이를 벌려 주차를 가른다
    const cells = [];
    for (let d = 1; d <= 14; d += 1) {
      if (d === 8) cells.push(<i key="gap" className={styles.barGap} />);
      cells.push(<i key={d} className={legend.days.includes(d) ? styles.barOn : undefined} />);
    }
    return (
      <span className={styles.bar} title={legend.days.map((d) => `D${d}`).join(" ")}>
        {cells}
      </span>
    );
  };

  /* ── 상세 ── */

  const renderRoundDetail = (round) => {
    const list = matchedMaterials(round, legendHit);
    return (
      <div className={styles.detail}>
        <div className={styles.detailHead}>
          <strong>{round.label}</strong>
          <span>{`${round.day}일차 ${round.dow} · ${round.round}라운드`}</span>
          <span>{`재료 ${list.length}장`}</span>
        </div>
        <div className={styles.detailSub}>재료 → 레전드</div>
        {list.length === 0 ? (
          <div className={styles.detailNote}>
            {query ? "검색어에 맞는 재료가 없습니다." : "이 라운드에는 레전드 재료가 없습니다."}
          </div>
        ) : (
          <div className={styles.materials}>
            {list.map((e) => {
              const m = meta[e.legend] ?? {};
              return (
                <div
                  key={`${e.group}-${e.order}`}
                  className={`${styles.materialRow} ${styles.mapRow}`}
                >
                  <span className={styles.card}>{e.card}</span>
                  <span className={styles.arrow}>→</span>
                  <span className={styles.to}>
                    <span
                      className={styles.dot}
                      style={{ background: teamColor(m.team) }}
                      aria-hidden="true"
                    />
                    <span className={styles.legendName}>{e.legend}</span>
                    <span className={styles.subText}>
                      {`${(m.pos ?? []).join(" ")} · ${m.team ?? ""}`}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const renderLegendDetail = (legend) => {
    // 획득처가 둘 이상인 카드는 어디서 먹어도 되므로 따로 표시한다
    const multiSpot = legend.mats.filter((m) => m.rounds.length > 1).length;

    return (
      <div className={styles.detail}>
        <div className={styles.detailHead}>
          <strong>{legend.name}</strong>
          <span>{`${legend.grade} · ${legend.team} · ${legend.pos?.join(" ")}`}</span>
        </div>
        <div className={styles.detailSub}>
          필요 재료
          <span className={styles.dim}>
            {`${legend.mats.length}장 · ${legend.days.map((d) => `D${d}`).join(", ")}`}
            {multiSpot > 0 && ` · 여러 라운드에서 얻는 카드 ${multiSpot}장`}
          </span>
        </div>
        <div className={styles.materials}>
          {legend.mats.map((m) => {
            const multi = m.rounds.length > 1;
            return (
              <div key={m.card} className={`${styles.materialRow} ${styles.needRow}`}>
                <span className={styles.dayGroup}>
                  {m.rounds.map((r) => (
                    <span key={`${r.day}-${r.round}`} className={styles.dayBadge}>
                      {roundLabel(r)}
                    </span>
                  ))}
                </span>
                <span className={`${styles.card} ${multi ? styles.cardMulti : ""}`}>{m.card}</span>
                <span className={styles.subText}>
                  {m.rounds.map((r) => r.label).join(" · ")}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const rowIdOf = (item) =>
    view === VIEW.ROUND ? `s${item.day}-${item.round}` : `l${item.name}`;

  return (
    <div className={styles.screen}>
      <div className={styles.filters}>
        <div className={styles.searchRow}>
<svg
            className={styles.searchIcon}
            viewBox="0 0 16 16"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.6 10.6 L14 14" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={query}
            placeholder="레전드 이름 · 구단 검색"
            autoComplete="off"
            onChange={(e) => changeQuery(e.target.value)}
          />
          {query && (
            <button
              type="button"
              className={styles.clearButton}
              aria-label="검색어 지우기"
              onClick={() => changeQuery("")}
            >
              ×
            </button>
          )}
        </div>

        <div className={styles.segment}>
          <button
            type="button"
            aria-pressed={view === VIEW.LEGEND}
            onClick={() => selectView(VIEW.LEGEND)}
          >
            레전드<span className={styles.segCount}>{legends.length}</span>
          </button>
          <button
            type="button"
            aria-pressed={view === VIEW.ROUND}
            onClick={() => selectView(VIEW.ROUND)}
          >
            라운드<span className={styles.segCount}>{rounds.length}</span>
          </button>
        </div>

        {renderFilters()}

        <div className={styles.meta}>
          <span>
            <b>{`${rows.length}${view === VIEW.ROUND ? "개" : "명"}`}</b>
          </span>
          <span>{`${SORT_LABEL[sort] ?? sort} ${sortDirectionLabel(sort, dir)}`}</span>
        </div>
      </div>

      <div className={styles.tableBox}>
        <table className={styles.table} style={{ minWidth: tableMinWidth }}>
          <thead>
            <tr>
              {cols.map((col) => (
                <th
                  key={col.key}
                  className={`${cellClass(col)} ${SORTABLE.has(col.key) ? styles.sortable : ""}`}
                  style={cellStyle(col)}
                  onClick={SORTABLE.has(col.key) ? () => toggleSort(col.key) : undefined}
                >
                  {col.label}
                  {SORTABLE.has(col.key) && sort === col.key && (
                    <span className={styles.arrowMark}>{dir < 0 ? "▼" : "▲"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const id = rowIdOf(item);
              const open = openId === id;
              // 홀짝은 행 순서가 아니라 일차 기준이라 정렬을 바꿔도 유지된다
              const parity =
                view === VIEW.ROUND ? (item.day % 2 ? styles.dayOdd : styles.dayEven) : "";
              return [
                <tr
                  key={id}
                  data-row-id={id}
                  className={`${styles.row} ${parity} ${open ? styles.open : ""}`}
                  onClick={() => toggleRow(id)}
                >
                  {cols.map((col) => (
                    <td key={col.key} className={cellClass(col)} style={cellStyle(col)}>
                      {view === VIEW.ROUND
                        ? renderRoundCell(item, col)
                        : renderLegendCell(item, col)}
                    </td>
                  ))}
                </tr>,
                open && (
                  <tr key={`${id}-detail`} className={styles.detailRow}>
                    <td colSpan={cols.length}>
                      {view === VIEW.ROUND ? renderRoundDetail(item) : renderLegendDetail(item)}
                    </td>
                  </tr>
                ),
              ];
            })}
          </tbody>
        </table>
      </div>

      {!loaded && loading && <div className={styles.empty}>불러오는 중…</div>}
      {error && <div className={styles.empty}>{error}</div>}
      {loaded && rows.length === 0 && (
        <div className={styles.empty}>조건에 맞는 결과가 없습니다. 필터를 하나 풀어보세요.</div>
      )}

      <div className={styles.foot}>
        <p>
          레전드 이름이나 구단으로 검색하세요. 카드 이름(이만수&apos;82)으로는 찾을 수 없습니다.
        </p>
        <p>
          {`지금은 1~${maxDay}일차까지 정리돼 있습니다 · ${rounds.length}라운드 · 재료 ${materials.length}장`}
        </p>
      </div>
    </div>
  );
};

export default HistoryLegendScreen;
