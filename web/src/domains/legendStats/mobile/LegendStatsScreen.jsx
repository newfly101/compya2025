import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ALL,
  BADGE_GUIDE,
  RATING_SOURCE,
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
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { useLegendStats } from "./hooks/useLegendStats";
import { useHistoryBadge } from "./hooks/useHistoryBadge";
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
  const historyCards = useHistoryBadge();

  const [team, setTeam] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [pos, setPos] = useState(ALL);
  const [sort, setSort] = useState("score");
  const [dir, setDir] = useState(-1);
  const [openId, setOpenId] = useState(null);
  const [query, setQuery] = useState("");
  // null | 'rating' | 'badge'
  const [helpOpen, setHelpOpen] = useState(null);

  useEffect(() => {
    if (!helpOpen) return undefined;
    const onKeyDown = (e) => e.key === "Escape" && setHelpOpen(null);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [helpOpen]);

  const teams = useMemo(() => teamOptions(LEGENDS), [LEGENDS]);
  const positions = useMemo(() => posOptions(LEGENDS, type), [LEGENDS, type]);
  const cols = useMemo(() => columns(type), [type]);
  const rows = useMemo(
    () => visibleRows(LEGENDS, { team, type, pos, query, sort, dir }),
    [LEGENDS, team, type, pos, query, sort, dir],
  );

  const unrated = rows.filter((l) => l.score == null).length;

  const changeQuery = (value) => {
    setQuery(value);
    setOpenId(null);
  };

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
                <span className={styles.materialName}>{m.name}</span>
                {/* 이 카드를 히스토리 모드에서 얻을 수 있다. 행 펼침과 겹치지 않게 클릭을 끊는다 */}
                {historyCards.has(m.name) && (
                  <Link
                    to={`${ROUTE_PATHS.history_legend}?legend=${encodeURIComponent(legend.name)}`}
                    className={styles.historyBadge}
                    title={`${m.name} 은 히스토리 모드에서 얻을 수 있습니다`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    히
                  </Link>
                )}
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
            placeholder="레전드 이름 검색"
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
          <span className={styles.metaLeft}>
            <span>
              <b>{`${rows.length}명`}</b>
              {unrated > 0 && ` · 평점 미정 ${unrated}`}
            </span>
            <button
              type="button"
              className={styles.badgeHelp}
              onClick={() => setHelpOpen("rating")}
            >
              <span className={styles.badgeHelpMark} aria-hidden="true">
                ?
              </span>
              평점 도움말
            </button>
            <button
              type="button"
              className={styles.badgeHelp}
              onClick={() => setHelpOpen("badge")}
            >
              <span className={styles.badgeHelpMark} aria-hidden="true">
                ?
              </span>
              재료카드 도움말
            </button>
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

      {helpOpen && (
        <div className={styles.overlay} role="presentation" onClick={() => setHelpOpen(null)}>
          <div
            className={styles.helpCard}
            role="dialog"
            aria-modal="true"
            aria-labelledby="legend-help-title"
            onClick={(e) => e.stopPropagation()}
          >
            {helpOpen === "rating" ? (
              <>
                <h2 id="legend-help-title" className={styles.helpTitle}>
                  평점은 어떤 값인가요?
                </h2>
                <p className={styles.helpBody}>
                  게임 내 수치가 아니라 <b>{RATING_SOURCE.author}</b> 님이 분석해 산정한
                  점수입니다. 원작자의 사용 허락을 받아 출처를 밝히고 싣습니다.
                </p>
                <p className={styles.helpBody}>
                  OVR 과 스탯은 게임 표기 그대로이고, 평점만 분석값입니다.
                </p>
                <a
                  className={styles.helpLink}
                  href={RATING_SOURCE.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {`${RATING_SOURCE.site} 원문 보기 →`}
                </a>
              </>
            ) : (
              <>
                <h2 id="legend-help-title" className={styles.helpTitle}>
                  재료카드 도움말
                </h2>
                <ul className={styles.helpPoints}>
                  <li>레전드 재료카드에 있는 뱃지는 저격 가능한 재료의 위치를 나타냅니다.</li>
                  <li>뱃지를 클릭하면 컨텐츠 페이지로 이동합니다.</li>
                </ul>
                <ul className={styles.badgeList}>
                  {BADGE_GUIDE.map((b) => (
                    <li key={b.mark}>
                      <span className={`${styles.historyBadge} ${styles[b.tone]}`}>{b.mark}</span>
                      <span>
                        {b.label}
                        {b.note && <em className={styles.badgeNote}>{` (${b.note})`}</em>}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button type="button" className={styles.helpClose} onClick={() => setHelpOpen(null)}>
              닫기
            </button>
          </div>
        </div>
      )}

      <div className={styles.foot}>
        OVR은 스탯 평균으로 그때그때 계산합니다. 평점이 비어 있는 6명은 표 아래에 모아 두었습니다.
      </div>
    </div>
  );
};

export default LegendStatsScreen;
