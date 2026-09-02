import { useMemo, useState } from "react";
import {
  ALL,
  TYPE_FILTERS,
  columns,
  ovr,
  batSummary,
  pitSummary,
  pitchAverage,
  posOptions,
  sortLabel,
  statTone,
  teamColor,
  teamOptions,
  visibleRows,
} from "@/domains/legendStats/config/legendStats.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useLegendStats } from "./hooks/useLegendStats";
import "./legendStats.tokens.scss";
import styles from "./LegendStatsScreen.module.scss";

const LegendStatsScreen = () => {
  useDomainTopBar("레전드 재료");

  const {
    legends: LEGENDS,
    loading,
    loaded,
    error,
    loadMaterials,
    materialsOf,
    materialsLoading,
  } = useLegendStats();

  const [team, setTeam] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [pos, setPos] = useState(ALL);
  const [sort, setSort] = useState("score");
  const [dir, setDir] = useState(-1);
  const [openId, setOpenId] = useState(null);

  const teams = useMemo(() => teamOptions(LEGENDS), [LEGENDS]);
  const positions = useMemo(() => posOptions(LEGENDS, type), [LEGENDS, type]);
  const cols = useMemo(() => columns(type), [type]);
  const rows = useMemo(
    () => visibleRows(LEGENDS, { team, type, pos, sort, dir }),
    [LEGENDS, team, type, pos, sort, dir],
  );

  const unrated = rows.filter((l) => l.score == null).length;

  const selectTeam = (next) => {
    setTeam(next);
    setOpenId(null);
  };

  // 없어질 스탯 컬럼으로 정렬 중이었다면 평점 내림차순으로 되돌린다
  const selectType = (next) => {
    setType(next);
    setPos(ALL);
    setOpenId(null);
    if (sort !== "score" && sort !== "ovr" && sort !== "name") {
      setSort("score");
      setDir(-1);
    }
  };

  const selectPos = (next) => {
    setPos(next);
    setOpenId(null);
  };

  const toggleSort = (key) => {
    if (sort === key) setDir((d) => -d);
    else {
      setSort(key);
      setDir(-1);
    }
  };

  // 펼치는 순간에만 재료를 받는다 (재요청은 thunk 가 막는다)
  const toggleRow = (id) => {
    const next = openId === id ? null : id;
    if (next) loadMaterials(next);
    setOpenId(next);
  };

  const renderCell = (legend, col, index) => {
    const cls = `${styles[col.cls]} ${col.sticky ? styles.sticky : ""}`;

    if (col.key === "rank") {
      return (
        <td key={col.key} className={cls}>
          {legend.score == null ? "–" : index + 1}
        </td>
      );
    }
    if (col.key === "score") {
      return (
        <td key={col.key} className={`${cls} ${legend.score == null ? styles.na : ""}`}>
          {legend.score == null ? "–" : legend.score.toFixed(1)}
        </td>
      );
    }
    if (col.key === "name") {
      return (
        <td key={col.key} className={cls}>
          <span className={styles.nameInner}>
            <span
              className={styles.nameDot}
              style={{ background: teamColor(legend.team) }}
              aria-hidden="true"
            />
            {legend.name}
          </span>
        </td>
      );
    }
    if (col.key === "pos") {
      return (
        <td key={col.key} className={cls}>
          {legend.pos.join(" ")}
        </td>
      );
    }
    if (col.key === "ovr") {
      return (
        <td key={col.key} className={cls}>
          {ovr(legend).toFixed(1)}
        </td>
      );
    }

    const value = legend.stats[col.key];
    return (
      <td key={col.key} className={`${cls} ${styles[statTone(value)] ?? ""}`}>
        {value}
      </td>
    );
  };

  const renderDetail = (legend) => {
    const { mats, coaches } = materialsOf(legend.id);
    const summary =
      legend.type === "타자"
        ? (({ 정파선, 주수 }) => `정파선 ${정파선} · 주수 ${주수}`)(batSummary(legend))
        : `제/구 ${pitSummary(legend).제구위}`;

    const avg = pitchAverage(legend.pitches);
    const pitchNote = legend.pitches
      ? avg != null
        ? ` · A평균 ${avg.toFixed(1)}`
        : " · 수치 미확인"
      : "";

    return (
      <div className={styles.detail}>
        <div className={styles.detailHead}>
          <strong>{legend.name}</strong>
          <span>{`${legend.grade} · ${legend.team} · ${legend.pos.join(" ")}`}</span>
          <span>{summary}</span>
        </div>

        {legend.pitches && (
          <>
            <div className={styles.detailSub}>{`구종${pitchNote}`}</div>
            <div className={styles.pitches}>
              {Object.entries(legend.pitches).map(([name, info]) => (
                <span
                  key={name}
                  className={`${styles.pitch} ${info.val == null ? styles.gradeOnly : ""}`}
                >
                  {name}
                  <b>{info.val ?? info.grade ?? "–"}</b>
                </span>
              ))}
            </div>
          </>
        )}

        {/* 재료는 펼친 뒤에 도착한다. 늦거나 실패해도 표는 그대로 살아 있다 */}
        <div className={styles.detailSub}>재료 선수</div>
        {mats.length > 0 ? (
          <div className={styles.materials}>
            {mats.map((m) => (
              <div key={`${m.team}-${m.name}`} className={styles.material}>
                <span className={styles.materialTeam}>{m.team}</span>
                {m.name}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.detailNote}>
            {materialsLoading ? "재료 불러오는 중…" : "재료 정보를 불러오지 못했습니다."}
          </div>
        )}

        {coaches.length > 0 && (
          <>
            <div className={styles.detailSub}>코치</div>
            <div className={styles.materials}>
              {coaches.map((c) => (
                <div key={`${c.team}-${c.year}`} className={styles.material}>
                  <span className={styles.materialTeam}>{c.team}</span>
                  {`${c.year} 코치`}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className={styles.screen}>
      <div className={styles.filters}>
        <div className={styles.chipRow}>
          {teams.map((t) => (
            <button
              key={t}
              type="button"
              className={styles.chip}
              aria-pressed={t === team}
              onClick={() => selectTeam(t)}
            >
              {t !== ALL && (
                <span
                  className={styles.chipDot}
                  style={{ color: teamColor(t) }}
                  aria-hidden="true"
                />
              )}
              {t}
            </button>
          ))}
        </div>

        <div className={styles.segment}>
          {TYPE_FILTERS.map((t) => (
            <button key={t} type="button" aria-pressed={t === type} onClick={() => selectType(t)}>
              {t}
            </button>
          ))}
        </div>

        {/* 타입이 전체면 포지션 줄을 숨긴다 — 타자/투수 체계가 섞이면 의미가 없다 */}
        {positions.length > 0 && (
          <div className={styles.chipRow}>
            {positions.map((p) => (
              <button
                key={p}
                type="button"
                className={styles.chip}
                aria-pressed={p === pos}
                onClick={() => selectPos(p)}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        <div className={styles.meta}>
          <span>
            <b>{`${rows.length}명`}</b>
            {unrated > 0 && ` · 평점 미정 ${unrated}`}
          </span>
          <span>{`${sortLabel(sort)} ${dir < 0 ? "높은순" : "낮은순"}`}</span>
        </div>
      </div>

      <div className={styles.tableBox}>
        <table className={styles.table}>
          <thead>
            <tr>
              {cols.map((col) => (
                <th
                  key={col.key}
                  className={`${styles[col.cls]} ${col.sticky ? styles.sticky : ""} ${
                    col.sortable ? styles.sortable : ""
                  }`}
                  onClick={col.sortable ? () => toggleSort(col.key) : undefined}
                >
                  {col.label}
                  {col.sortable && sort === col.key && (
                    <span className={styles.arrow}>{dir < 0 ? "▼" : "▲"}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((legend, index) => {
              const open = openId === legend.id;
              return [
                <tr
                  key={legend.id}
                  className={`${styles.row} ${open ? styles.open : ""} ${
                    legend.score == null ? styles.provisional : ""
                  }`}
                  onClick={() => toggleRow(legend.id)}
                >
                  {cols.map((col) => renderCell(legend, col, index))}
                </tr>,
                open && (
                  <tr key={`${legend.id}-detail`} className={styles.detailRow}>
                    <td colSpan={cols.length}>{renderDetail(legend)}</td>
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
        <div className={styles.empty}>조건에 맞는 레전드가 없습니다. 필터를 하나 풀어보세요.</div>
      )}

      <div className={styles.foot}>
        OVR은 스탯 평균으로 그때그때 계산합니다. 평점이 비어 있는 6명은 표 아래에 모아 두었습니다.
      </div>
    </div>
  );
};

export default LegendStatsScreen;
