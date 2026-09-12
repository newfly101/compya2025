// domains/players/config/statsTable.js
// 리스트형(스탯 표) 정렬·컬럼 계산 — 순수 함수만. 색은 항상 토큰(CSS var)을 반환한다.
import { getPosOrder } from "@/domains/players/config/playersLoader";
import { formatPosition } from "@/domains/players/config/position";
import { PITCH_SHORT } from "@/domains/players/store/statsAdapter.js";

export const STAT_LABELS_B = ["정확", "파워", "선구", "주력", "수비"];
export const STAT_LABELS_P = ["제구", "구위", "체력", "직구", "변화"];
export const STAT_SHORT_B = ["정", "파", "선", "주", "수"];
export const STAT_SHORT_P = ["제", "구", "체", "직", "변"];

const PITCH_RANK = { S: 5, A: 4, B: 3, C: 2, D: 1, "-": 0 };
const PITCH_COLOR = {
  S: "var(--color-pe-grade-s)",
  A: "var(--color-pe-gold)",
  B: "var(--color-pe-grade-b)",
  C: "var(--color-pe-grade-c)",
  D: "var(--color-pe-normal)",
  "-": "var(--color-text-placeholder)",
};

// 선수별 최고(70+) 민트, 70+ 흰색, 60대 보통, 60 미만 흐림, null(미확인) 자리표시.
function statColor(value, isMax) {
  if (value == null) return "var(--color-text-placeholder)";
  if (isMax && value >= 70) return "var(--color-pe-mint)";
  if (value >= 70) return "var(--color-text-primary)";
  if (value >= 60) return "var(--color-text-secondary)";
  return "var(--color-text-muted)";
}

/** 카드 행(id·tm·y·n·pos·subPos·L) + 스탯 행(st·pv)을 하나로 합친다. 스탯 미도착이면 null. */
export function joinListRows(cardRows, statsById) {
  return cardRows.map((r) => {
    const s = statsById.get(r.id);
    return {
      id: r.id,
      tm: r.tm,
      y: r.y,
      n: r.n,
      pos: formatPosition(r.pos, r.subPos),
      L: !!r.L,
      st: s?.st ?? null,
      pv: s?.pv ?? null,
    };
  });
}

/** 정렬 없음 = 기본(L 우선 → 포지션 순 → 이름). 있으면 키 종류별로 갈린다. */
export function sortListRows(rows, sortKey, sortDir) {
  const arr = [...rows];
  if (!sortKey) {
    arr.sort(
      (a, b) =>
        (a.L ? 0 : 1) - (b.L ? 0 : 1) ||
        getPosOrder(a.pos) - getPosOrder(b.pos) ||
        a.n.localeCompare(b.n, "ko"),
    );
    return arr;
  }
  if (sortKey.startsWith("stat:")) {
    const i = Number(sortKey.slice(5));
    arr.sort((a, b) => ((a.st?.[i] ?? -1) - (b.st?.[i] ?? -1)) * sortDir);
    return arr;
  }
  if (sortKey.startsWith("pitch:")) {
    const i = Number(sortKey.slice(6));
    arr.sort((a, b) => ((PITCH_RANK[a.pv?.[i]] ?? 0) - (PITCH_RANK[b.pv?.[i]] ?? 0)) * sortDir);
    return arr;
  }
  arr.sort((a, b) => String(a[sortKey]).localeCompare(String(b[sortKey]), "ko", { numeric: true }) * sortDir);
  return arr;
}

/**
 * 표에 바로 꽂는 컬럼·셀을 만든다. 왼쪽(식별 열)은 좌우 스크롤, 오른쪽(능력치)은 항상 전부.
 * showTeamYear: 구종 표에서만 의미 있음(검색/필터로 범위가 넓을 때만 구단·연도 열을 보탠다).
 */
const LEFT_WIDTH = { idx: "24px", tm: "36px", y: "28px", n: "auto", pos: "32px" };

export function buildTable({ rows, isPitch, showTeamYear, statLabels, sortKey, sortDir, onSort }) {
  const fixed = isPitch
    ? showTeamYear
      ? [["idx", "#"], ["tm", "구단"], ["y", "연도"], ["n", "이름"]]
      : [["idx", "#"], ["n", "이름"]]
    : [["idx", "#"], ["tm", "구단"], ["y", "연도"], ["n", "이름"], ["pos", "포지션"]];

  const leftCols = fixed.map(([key, label]) => ({
    key,
    label,
    width: LEFT_WIDTH[key],
    align: key === "n" ? "left" : "center",
    active: sortKey === key,
    dir: sortKey === key ? sortDir : 0,
    onClick: key === "idx" ? undefined : () => onSort(key),
  }));

  const shortLabels = isPitch ? PITCH_SHORT : statLabels.short;
  const rightCols = shortLabels.map((label, i) => {
    const key = (isPitch ? "pitch:" : "stat:") + i;
    return { key, label, active: sortKey === key, dir: sortKey === key ? sortDir : 0, onClick: () => onSort(key) };
  });

  const cellRows = rows.map((r, ri) => {
    const values = isPitch ? r.pv ?? shortLabels.map(() => "-") : r.st ?? shortLabels.map(() => null);
    const max = isPitch ? null : Math.max(...values.map((v) => v ?? -1));

    const left = fixed.map(([key]) => ({
      key,
      value: key === "idx" ? ri + 1 : key === "y" ? r.y.slice(-2) : r[key],
      showL: key === "n" && r.L,
    }));
    const right = values.map((v, i) => ({
      key: (isPitch ? "pitch:" : "stat:") + i,
      value: isPitch ? v : v == null ? "-" : v,
      color: isPitch ? (PITCH_COLOR[v] ?? PITCH_COLOR["-"]) : statColor(v, v != null && v === max),
      active: sortKey === (isPitch ? "pitch:" : "stat:") + i,
    }));
    return { id: r.id, left, right };
  });

  return { leftCols, rightCols, rows: cellRows, rightColWidth: isPitch ? "27px" : "36px" };
}
