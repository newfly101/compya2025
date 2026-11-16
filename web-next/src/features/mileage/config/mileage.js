// domains/mileage/config/mileage.js
// 마일리지 저격 경로 — 순수 계산 로직 전용 모듈.
//
// ⚠️ DOM · React 를 일절 참조하지 않는다. node 빌드 스크립트가 이 파일을 그대로
// import 해 사전계산에 쓸 예정이라, document/window 접근이 한 줄이라도 들어가면
// 그 계획이 깨진다. named export 만 사용한다.
//
// 원본: design_handoff_mileage/mileage-sniper.html (703줄, 손계산·몬테카를로 검증 완료).
// DP 알고리즘(solve/ePick/weightsFor)은 그대로 옮겼다 — 최적화·리팩터 금지
// (design_handoff_mileage/README.md §3, §4 참조).

export const ALL = "미정";

/* ════ 원본 데이터 : DB `teams` 테이블과 1:1 대응 예정 ════
   이번 라운드는 DB teams 테이블을 만들지 않는다 — 이 상수가 유일한 원본이다.
   배열만 갈아끼우면 연도 범위·표 크기·열 순서·뽑기 확률·도움말 예시까지 전부 다시 계산된다. */
export const TEAMS_RAW = [
  { code: "DOO", name: "두산", start: 1999, end: 2026, latest: null },
  { code: "SAM", name: "삼성", start: 1982, end: 2026, latest: null },
  { code: "HAN", name: "한화", start: 1994, end: 2026, latest: null },
  { code: "LOT", name: "롯데", start: 1982, end: 2026, latest: null },
  { code: "KIA", name: "KIA", start: 2001, end: 2026, latest: null },
  { code: "KIW", name: "키움", start: 2008, end: 2026, latest: null },
  { code: "SSG", name: "SSG", start: 2021, end: 2026, latest: null },
  { code: "LG", name: "LG", start: 1990, end: 2026, latest: null },
  { code: "NC", name: "NC", start: 2013, end: 2026, latest: null },
  { code: "KT", name: "KT", start: 2015, end: 2026, latest: null },
  { code: "OB", name: "OB", start: 1982, end: 1998, latest: "DOO" },
  { code: "MBC", name: "MBC", start: 1982, end: 1989, latest: "LG" },
  { code: "BIN", name: "빙그레", start: 1986, end: 1993, latest: "HAN" },
  { code: "SUP", name: "삼미", start: 1982, end: 1984, latest: "HYU" },
  { code: "HAE", name: "해태", start: 1982, end: 2000, latest: "KIA" },
  { code: "HYU", name: "현대", start: 1996, end: 2007, latest: null },
  { code: "SSA", name: "쌍방울", start: 1991, end: 1999, latest: null },
  { code: "CHU", name: "청보", start: 1985, end: 1987, latest: "HYU" },
  { code: "PAC", name: "태평양", start: 1988, end: 1995, latest: "HYU" },
  { code: "SK", name: "SK", start: 2000, end: 2020, latest: "SSG" },
];

export const POSITIONS = ["SP", "RP", "CP", "C", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "DH"];

/* 게임 규칙 상수 — DB 값이 아니라 규칙 자체라 상수로 둔다 (README §6 "여전히 수동인 것") */
export const COST_TEAM = 200;
export const COST_YEAR = 400;
export const SHOWN = 7;

/* 기본 목표 — beta UI 초기값(두산 2008) */
export const DEFAULT_GOAL_TEAM_CODE = "DOO";
export const DEFAULT_GOAL_YEAR = 2008;

/* ── 표 열 순서: latest 계보를 따라 같은 프랜차이즈를 인접 배치 ───────────── */
function orderTeams(raw) {
  const by = new Map(raw.map((t) => [t.code, t]));
  const root = (c) => {
    let x = c;
    const seen = new Set();
    while (by.get(x) && by.get(x).latest && !seen.has(x)) {
      seen.add(x);
      x = by.get(x).latest;
    }
    return x;
  };
  const groups = new Map();
  raw.forEach((t, i) => {
    const r = root(t.code);
    if (!groups.has(r)) groups.set(r, { items: [], idx: i });
    groups.get(r).items.push(t);
  });
  return [...groups.values()]
    .map((g) => ({ items: g.items.sort((a, b) => a.start - b.start), idx: g.idx }))
    .sort(
      (a, b) =>
        a.items[0].start - b.items[0].start || // 먼저 생긴 계보부터
        b.items[0].end - a.items[0].end || // 오래 간 쪽부터
        a.idx - b.idx,
    )
    .flatMap((g) => g.items);
}

export const TEAMS = orderTeams(TEAMS_RAW).map((t) => ({ c: t.code, n: t.name, s: t.start, e: t.end }));

/* 연도 축도 데이터에서 뽑는다 */
export const Y0 = Math.min(...TEAMS.map((t) => t.s));
export const Y1 = Math.max(...TEAMS.map((t) => t.e));
export const YEARS = (() => {
  const out = [];
  for (let y = Y0; y <= Y1; y += 1) out.push(y);
  return out;
})();

export const T = TEAMS.length;
export const Y = YEARS.length; // ALL 은 인덱스 T / Y(sentinel)

export const active = (ti, yi) => {
  const t = TEAMS[ti];
  const y = YEARS[yi];
  return y >= t.s && y <= t.e;
};

export const teamsInYear = YEARS.map((_, yi) => {
  const a = [];
  for (let t = 0; t < T; t += 1) if (active(t, yi)) a.push(t);
  return a;
});
export const yearsOfTeam = TEAMS.map((_, ti) => {
  const a = [];
  for (let y = 0; y < Y; y += 1) if (active(ti, y)) a.push(y);
  return a;
});
export const ALL_T = [...Array(T).keys()];
export const ALL_Y = [...Array(Y).keys()];

export const validState = (ti, yi) => (ti < T && yi < Y ? active(ti, yi) : true);
export const teamCands = (yi) => (yi < Y ? teamsInYear[yi] : ALL_T);
export const yearCands = (ti) => (ti < T ? yearsOfTeam[ti] : ALL_Y);

export const teamName = (ti) => (ti < T ? TEAMS[ti].n : ALL);
export const yearName = (yi) => (yi < Y ? String(YEARS[yi]) : ALL);

export const findTeamIndexByCode = (code) => TEAMS.findIndex((t) => t.c === code);
export const findYearIndexByYear = (year) => YEARS.indexOf(year);

/** 목표 팀이 바뀌었을 때 목표 연도가 그 팀과 안 맞으면 팀의 첫 연도로 보정 */
export const clampGoalYear = (goalT, goalY) =>
  active(goalT, goalY) ? goalY : yearsOfTeam[goalT][0];

/** 초기 목표(두산 2008)의 인덱스 쌍 */
export const defaultGoal = () => {
  const ti = findTeamIndexByCode(DEFAULT_GOAL_TEAM_CODE);
  const yi = findYearIndexByYear(DEFAULT_GOAL_YEAR);
  return { goalT: ti, goalY: yi };
};

/* ════ 7개 중 최선을 고를 때의 순위별 확률 ════
   w[k] = C(N-1-k, 6) / C(N, 7)   ← 순위 k가 7개 표본의 최솟값일 확률 */
const wCache = new Map();
export function weightsFor(N) {
  if (wCache.has(N)) return wCache.get(N);
  let w;
  if (N <= SHOWN) w = [1];
  else {
    w = [SHOWN / N];
    for (let k = 1; k <= N - SHOWN; k += 1) w.push((w[k - 1] * (N - 6 - k)) / (N - k));
  }
  wCache.set(N, w);
  return w;
}

export function ePick(vals) {
  const a = vals.slice().sort((p, q) => p - q);
  const w = weightsFor(a.length);
  let s = 0;
  for (let k = 0; k < w.length; k += 1) s += w[k] * a[k];
  return s;
}

/* ════ 값 반복 (Gauss-Seidel) ════
   목표가 바뀌면 격자 전체를 다시 푼다. 사전 계산해 박아둘 수 없다 — 원본 README §3. */
const INF = 1e9;
export function solve(goalT, goalY) {
  const V = Array.from({ length: T + 1 }, () => new Float64Array(Y + 1).fill(INF));
  V[goalT][goalY] = 0;

  for (let it = 0; it < 60; it += 1) {
    // 30회면 수렴, 여유 2배
    for (let t = 0; t <= T; t += 1) {
      for (let y = 0; y <= Y; y += 1) {
        if (!validState(t, y) || (t === goalT && y === goalY)) continue;
        const qT = COST_TEAM + ePick(teamCands(y).map((tt) => V[tt][y]));
        const qY = COST_YEAR + ePick(yearCands(t).map((yy) => V[t][yy]));
        V[t][y] = Math.min(qT, qY);
      }
    }
  }

  const pol = Array.from({ length: T + 1 }, () => new Array(Y + 1).fill(null));
  for (let t = 0; t <= T; t += 1) {
    for (let y = 0; y <= Y; y += 1) {
      if (!validState(t, y)) continue;
      if (t === goalT && y === goalY) {
        pol[t][y] = "goal";
        continue;
      }
      const qT = COST_TEAM + ePick(teamCands(y).map((tt) => V[tt][y]));
      const qY = COST_YEAR + ePick(yearCands(t).map((yy) => V[t][yy]));
      pol[t][y] = qT <= qY ? "team" : "year";
    }
  }
  return { V, pol };
}

/** 두 가지 행동(구단 뽑기/연도 뽑기)을 비용 오름차순으로 반환 */
export function moves(sol, goalT, goalY, t, y) {
  const { V } = sol;
  const tc = teamCands(y);
  const yc = yearCands(t);
  const mk = (kind) => ({
    kind,
    verb: kind === "team" ? "구단을 돌리세요" : "연도를 돌리세요",
    glyph: kind === "team" ? "↔" : "↕",
    n: (kind === "team" ? tc : yc).length,
    q:
      kind === "team"
        ? COST_TEAM + ePick(tc.map((tt) => V[tt][y]))
        : COST_YEAR + ePick(yc.map((yy) => V[t][yy])),
    // 후보가 떴을 때 고를 순서 — 남은 거리가 짧은 칸부터
    order:
      kind === "team"
        ? tc
            .slice()
            .sort((a, b) => V[a][y] - V[b][y])
            .map((tt) => ({ name: TEAMS[tt].n, goal: tt === goalT && y === goalY }))
        : yc
            .slice()
            .sort((a, b) => V[t][a] - V[t][b])
            .map((yy) => ({ name: String(YEARS[yy]), goal: t === goalT && yy === goalY })),
  });
  return [mk("team"), mk("year")].sort((a, b) => a.q - b.q);
}

/** 추천 행동의 사유 문장 — 원본 reasonFor 그대로 이식 */
export function reasonFor(m, { goalT, goalY, curT, curY }) {
  const gt = TEAMS[goalT].n;
  const gy = YEARS[goalY];
  if (m.kind === "team") {
    if (curT === T && curY === Y)
      return `구단은 ${T}개, 연도는 ${Y}개입니다. 아무것도 안 뽑은 상태라면 후보가 적고 값도 싼 구단부터가 유리합니다.`;
    const live = teamCands(curY).filter((tt) => yearsOfTeam[tt].includes(goalY)).length;
    if (curY === goalY) return `${gy}년에 있던 구단 중 ${gt}가 뜨면 그대로 끝납니다.`;
    if (live === 0) return `지금 연도에는 ${gy}년까지 이어지는 구단이 없어, 구단부터 갈아타야 합니다.`;
    return `${yearName(curY)}년 구단 중 ${gy}년까지 이어지는 곳은 ${live}곳뿐이라 그쪽으로 좁힙니다.`;
  }
  if (curT === T && curY === Y)
    return `아직 아무것도 안 뽑았다면 구단부터입니다. 구단은 ${T}개, 연도는 ${Y}개라 맞을 확률이 훨씬 높습니다.`;
  if (curT === goalT) return `${gt}에서 ${gy}년이 뜨면 그대로 끝납니다.`;
  if (curT < T && !yearCands(curT).includes(goalY))
    return `${TEAMS[curT].n}에는 ${gy}년이 없으니, ${gy}년에 가까운 해로 먼저 옮깁니다.`;
  return `${gy}년 쪽으로 옮겨두면 구단은 한 번에 잡힙니다.`;
}

/** 히어로(다음 한 수) + 추천 순서 5개 — 화면이 그대로 렌더할 수 있는 데이터 모양으로 가공 */
export function buildHeroData({ sol, goalT, goalY, curT, curY, position }) {
  if (curT === goalT && curY === goalY) {
    return {
      arrived: true,
      glyph: "●",
      verb: "도착했습니다",
      why: `${position} 포지션으로 뽑으면 됩니다.`,
      scope: null,
      total: 0,
      shownCount: 0,
      picks: [],
    };
  }

  const best = moves(sol, goalT, goalY, curT, curY)[0];
  const why = reasonFor(best, { goalT, goalY, curT, curY });
  const scope =
    best.kind === "team"
      ? curY < Y
        ? `${YEARS[curY]}년에 있던 구단`
        : "전 구단"
      : curT < T
        ? `${TEAMS[curT].n}이 뛴 연도`
        : "전 연도";
  const top = best.order.slice(0, 5);

  return {
    arrived: false,
    glyph: best.glyph,
    verb: best.verb,
    why,
    scope,
    total: best.n,
    shownCount: Math.min(SHOWN, best.n),
    picks: top.map((o, i) => ({ ...o, rank: i + 1, best: i === 0 })),
  };
}

/** 구단 × 연도 표 데이터 — 색상 계산까지 포함해 컴포넌트는 그대로 렌더만 하면 된다 */
export function buildGridData({ sol, curT, curY }) {
  const { V, pol } = sol;

  let vmax = 0;
  for (let t = 0; t < T; t += 1) {
    for (let y = 0; y < Y; y += 1) {
      if (active(t, y) && V[t][y] < INF / 2) vmax = Math.max(vmax, V[t][y]);
    }
  }

  const rows = YEARS.map((year, y) => {
    const cells = TEAMS.map((team, t) => {
      if (!active(t, y)) return { t, kind: "void" };
      const p = pol[t][y];
      const v = V[t][y];
      const here = t === curT && y === curY;
      let heatAlpha = null;
      if (p !== "goal" && vmax > 0) heatAlpha = 0.05 + 0.3 * (1 - v / vmax);
      const glyph = p === "goal" ? "●" : p === "team" ? "↔" : p === "year" ? "↕" : "";
      return { t, kind: p, glyph, here, heatAlpha, title: `${team.n} ${year}` };
    });
    return { y, year, cells };
  });

  return { vmax, rows };
}

/** 구단 변경 시 연도가 안 맞으면 미정(Y)으로, 그 반대도 같다 — 막다른 길이 없게 */
export const adjustCurrentOnTeamChange = (nextT, curY) =>
  nextT < T && curY < Y && !active(nextT, curY) ? Y : curY;
export const adjustCurrentOnYearChange = (nextY, curT) =>
  curT < T && nextY < Y && !active(curT, nextY) ? T : curT;

/** "지금 위치 무작위로" — 아무 구단이나 골라 그 구단이 뛴 연도 중 하나 */
export function randomState() {
  const t = Math.floor(Math.random() * T);
  const ys = yearsOfTeam[t];
  const y = ys[Math.floor(Math.random() * ys.length)];
  return { curT: t, curY: y };
}

/** 도움말 아코디언 예시 문장 — 데이터에서 자동 생성 (하드코딩 금지, README §7) */
export function buildExamples() {
  const last = Y - 1; // 가장 최근 연도
  const nLast = teamsInYear[last].length;
  const longest = TEAMS.reduce((a, b) => (b.e - b.s > a.e - a.s ? b : a));
  const shortest = TEAMS.reduce((a, b) => (b.e - b.s < a.e - a.s ? b : a));
  const sIdx = TEAMS.indexOf(shortest);
  const sYears = yearsOfTeam[sIdx];
  const nFirst = teamsInYear[sYears[0]].length;

  return {
    shown: SHOWN,
    ex1:
      `예를 들어 ${YEARS[last]}년에 뛴 구단은 ${nLast}개뿐이라 ${SHOWN}개가 뜨면 대부분 나오지만, ` +
      `${longest.n}이 뛴 연도는 ${longest.e - longest.s + 1}개나 돼서 원하는 해가 나올 확률이 낮습니다.`,
    ex2:
      `${shortest.n}는 ${shortest.s}~${shortest.e}년에만 있었으니, ${shortest.n}를 고르면 연도는 그 ${sYears.length}개만 나옵니다. ` +
      `반대로 ${YEARS[sYears[0]]}년을 고르면 구단은 그해 있던 ${nFirst}개만 나옵니다.`,
    span: `${Y0}~${Y1}년`,
  };
}

/* ════ 표 행 높이 — 화면 높이 기반, 화면 회전·리사이즈 대응은 호출부(hook) 책임 ════ */
export const ROW_H_MIN = 11;
export const ROW_H_MAX = 22;
// 제목·표 헤더·범례가 차지하는 몫(원본 fitGrid 상수 그대로)
const ROW_HEIGHT_RESERVED_PX = 132;

/** headH: 표 헤더 실측 높이(px), viewportH: window.innerHeight */
export function computeRowHeight(headH, viewportH) {
  const avail = viewportH - headH - ROW_HEIGHT_RESERVED_PX;
  return Math.max(ROW_H_MIN, Math.min(ROW_H_MAX, Math.floor(avail / Y)));
}
