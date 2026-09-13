import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import { useLegendStats } from "./hooks/useLegendStats";
import { useHistoryBadge } from "./hooks/useHistoryBadge";
import { useMileageBadge } from "./hooks/useMileageBadge";
import GuideModal from "@/global/ui/guideModal/GuideModal.jsx";
import { GUIDES_BY_SLUG } from "@/domains/guides/content/index.js";
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
    retry,
  } = useLegendStats();
  const historyCards = useHistoryBadge();
  const mileageBadge = useMileageBadge();

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
            {mats.map((m) => {
              const mileageTarget = mileageBadge.get(m.cardId);
              const inHistory = historyCards.has(m.name);
              return (
                <div key={`${m.team}-${m.name}`} className={styles.material}>
                  <span className={styles.materialTeam}>{m.team}</span>
                  <span className={styles.materialName}>{m.name}</span>
                  {(mileageTarget || inHistory) && (
                    <span className={styles.badgeGroup}>
                      {/* 이 카드를 마일리지로 확정 저격할 수 있다. 행 펼침과 겹치지 않게 클릭을 끊는다 */}
                      {mileageTarget && (
                        <Link
                          to={`${ROUTE_PATHS.mileage}?team=${encodeURIComponent(mileageTarget.teamCode)}&year=${mileageTarget.seasonYear}`}
                          className={`${styles.historyBadge} ${styles.mileage}`}
                          title={`${m.name} 은 마일리지로 저격할 수 있습니다`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          마
                        </Link>
                      )}
                      {/* 이 카드를 히스토리 모드에서 얻을 수 있다 */}
                      {inHistory && (
                        <Link
                          to={`${ROUTE_PATHS.history_legend}?legend=${encodeURIComponent(legend.name)}`}
                          className={styles.historyBadge}
                          title={`${m.name} 은 히스토리 모드에서 얻을 수 있습니다`}
                          onClick={(e) => e.stopPropagation()}
                        >
                          히
                        </Link>
                      )}
                    </span>
                  )}
                </div>
              );
            })}
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

      {/* 목록 자체가 실패/로딩 중일 때만 표를 대신한다 — 재료(마·히) 배지처럼
          부가 데이터가 늦는 건 상관없다. 필터 UI는 위에서 항상 그대로 남는다 */}
      {!loaded && loading && (
        <div className={styles.tableBox}>
          <Skeleton count={8} height={36} />
        </div>
      )}

      {!loaded && !loading && error && <StateBox status="error" onRetry={retry} />}

      {loaded && (
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
      )}

      {loaded && rows.length === 0 && (
        <StateBox status="empty" message="조건에 맞는 레전드가 없습니다. 필터를 하나 풀어보세요." compact />
      )}

      {/* 평점 출처(원작자 표기)·재료카드 배지 안내 — 둘 다 /guides/legend-stats-guide 로 승격됐다.
          두 버튼이 같은 가이드 안의 서로 다른 섹션을 다루므로 하나의 모달로 합쳤다(2026-09-13). */}
      <GuideModal
        open={!!helpOpen}
        guide={GUIDES_BY_SLUG["legend-stats-guide"]}
        onClose={() => setHelpOpen(null)}
      />

      <div className={styles.foot}>
        OVR은 스탯 평균으로 그때그때 계산합니다. 평점이 비어 있는 6명은 표 아래에 모아 두었습니다.
      </div>
    </div>
  );
};

export default LegendStatsScreen;
