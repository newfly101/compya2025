// domains/mileage/mobile/hooks/useMileage.js
// 마일리지 저격 경로 — 화면 상태 훅. Redux 미사용(설계 결정, fe-structure-brief §3).
// 계산은 전부 config/mileage.js 의 순수 함수에 위임하고, 여기서는
// useState/useMemo 로 입력값·파생 데이터·URL 동기화만 다룬다.

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ALL_T,
  ALL_Y,
  POSITIONS,
  T,
  TEAMS,
  Y,
  YEARS,
  active,
  adjustCurrentOnTeamChange,
  adjustCurrentOnYearChange,
  buildExamples,
  buildGridData,
  buildHeroData,
  clampGoalYear,
  defaultGoal,
  findTeamIndexByCode,
  findYearIndexByYear,
  randomState,
  solve,
  teamsInYear,
  yearsOfTeam,
} from "@/domains/mileage/config/mileage.js";

const ARROW = "화살표";
const LETTER = "글자";

/** 격자 글리프 표시 방식(화살표 ↔/↕ · 글자 구/연)에 맞춰 셀 glyph 를 치환한다.
 *  buildGridData() 는 손대지 않고(config 모듈 금지 영역) 이 훅에서 후처리한다. */
function applyGridDisplay(rawGrid, { heatmap, arrowStyle }) {
  if (!rawGrid) return null;
  if (heatmap && arrowStyle === ARROW) return rawGrid;
  const swapGlyph = (g) => (arrowStyle === LETTER ? { "↔": "구", "↕": "연" }[g] ?? g : g);
  return {
    ...rawGrid,
    rows: rawGrid.rows.map((row) => ({
      ...row,
      cells: row.cells.map((cell) => ({
        ...cell,
        heatAlpha: heatmap ? cell.heatAlpha : null,
        glyph: swapGlyph(cell.glyph),
      })),
    })),
  };
}

const INITIAL_GOAL = defaultGoal();

/** URL(?team=CODE&year=YYYY) 이 유효한 목표를 가리키면 인덱스 쌍을, 아니면 null 을 반환 */
function parseGoalFromParams(searchParams) {
  const code = searchParams.get("team");
  const yearRaw = searchParams.get("year");
  if (!code || !yearRaw) return null;
  const ti = findTeamIndexByCode(code);
  const yi = findYearIndexByYear(parseInt(yearRaw, 10));
  if (ti >= 0 && yi >= 0 && active(ti, yi)) return { ti, yi };
  return null;
}

export function useMileage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlGoal = parseGoalFromParams(searchParams);

  const [goalT, setGoalT] = useState(urlGoal ? urlGoal.ti : INITIAL_GOAL.goalT);
  const [goalY, setGoalY] = useState(urlGoal ? urlGoal.yi : INITIAL_GOAL.goalY);
  const [curT, setCurT] = useState(T); // 미정
  const [curY, setCurY] = useState(Y); // 미정
  const [position, setPosition] = useState("1B");
  const [heatmap, setHeatmap] = useState(true); // 표 히트맵 음영 on/off — 시안 기본값 켬
  const [arrowStyle, setArrowStyle] = useState(ARROW); // 격자 글리프: "화살표"(↔↕) | "글자"(구·연)

  // 표 화면 여부는 URL 이 결정한다(모달 아님). 유효하지 않은 조합은 무시하고 메인.
  const view = urlGoal ? "table" : "main";

  // 브라우저 뒤로/앞으로가기로 다른 유효한 목표 URL 에 진입한 경우 상태를 맞춘다.
  useEffect(() => {
    if (urlGoal && (urlGoal.ti !== goalT || urlGoal.yi !== goalY)) {
      setGoalT(urlGoal.ti);
      setGoalY(urlGoal.yi);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  /* ── 목표 구단/연도 ── */
  const changeGoalTeam = useCallback((ti) => {
    setGoalT(ti);
    setGoalY((y) => clampGoalYear(ti, y));
  }, []);
  const changeGoalYear = useCallback((yi) => setGoalY(yi), []);

  /* ── 지금 구단/연도 — 서로 제약, 안 맞으면 반대쪽을 미정으로 ── */
  const changeCurrentTeam = useCallback((ti) => {
    setCurT(ti);
    setCurY((y) => adjustCurrentOnTeamChange(ti, y));
  }, []);
  const changeCurrentYear = useCallback((yi) => {
    setCurY(yi);
    setCurT((t) => adjustCurrentOnYearChange(yi, t));
  }, []);
  const clearCurrent = useCallback(() => {
    setCurT(T);
    setCurY(Y);
  }, []);
  const reroll = useCallback(() => {
    const next = randomState();
    setCurT(next.curT);
    setCurY(next.curY);
  }, []);

  /** 구단×연도 표 셀 클릭 — 유효한 칸(그 구단이 그 연도에 있던 경우)만 지금 위치로 반영 */
  const selectCell = useCallback((ti, yi) => {
    if (!active(ti, yi)) return;
    setCurT(ti);
    setCurY(yi);
  }, []);

  const toggleHeatmap = useCallback(() => setHeatmap((v) => !v), []);
  const toggleArrowStyle = useCallback(() => setArrowStyle((v) => (v === ARROW ? LETTER : ARROW)), []);

  /* ── 화면 전환 · URL ── */
  const openTable = useCallback(() => {
    setSearchParams({ team: TEAMS[goalT].c, year: String(YEARS[goalY]) });
  }, [goalT, goalY, setSearchParams]);
  const closeTable = useCallback(() => {
    // 원본 동작 그대로 — 닫기는 새 히스토리 항목(뒤로가기 시 표로 복귀 가능)
    setSearchParams({});
  }, [setSearchParams]);

  /* ── 선택지 ── */
  const goalYearOptions = useMemo(() => yearsOfTeam[goalT], [goalT]);
  const currentTeamOptions = useMemo(() => (curY < Y ? teamsInYear[curY] : ALL_T), [curY]);
  const currentYearOptions = useMemo(() => (curT < T ? yearsOfTeam[curT] : ALL_Y), [curT]);

  /* ── 계산 ── */
  const sol = useMemo(() => solve(goalT, goalY), [goalT, goalY]);
  const hero = useMemo(
    () => buildHeroData({ sol, goalT, goalY, curT, curY, position }),
    [sol, goalT, goalY, curT, curY, position],
  );
  const rawGrid = useMemo(
    () => (view === "table" ? buildGridData({ sol, goalT, goalY, curT, curY }) : null),
    [view, sol, goalT, goalY, curT, curY],
  );
  const grid = useMemo(
    () => applyGridDisplay(rawGrid, { heatmap, arrowStyle }),
    [rawGrid, heatmap, arrowStyle],
  );
  const arrowGlyphs = useMemo(
    () => (arrowStyle === ARROW ? { team: "↔", year: "↕" } : { team: "구", year: "연" }),
    [arrowStyle],
  );
  const examples = useMemo(() => buildExamples(), []);

  return {
    view,
    goalT,
    goalY,
    curT,
    curY,
    position,
    setPosition,
    changeGoalTeam,
    changeGoalYear,
    changeCurrentTeam,
    changeCurrentYear,
    clearCurrent,
    reroll,
    selectCell,
    openTable,
    closeTable,
    goalYearOptions,
    currentTeamOptions,
    currentYearOptions,
    sol,
    hero,
    grid,
    heatmap,
    toggleHeatmap,
    arrowStyle,
    toggleArrowStyle,
    arrowGlyphs,
    examples,
    positions: POSITIONS,
  };
}
