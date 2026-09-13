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

// "OVR" 열 값 — domains/legendStats/config/legendStats.js 의 ovr() 과 같은 계산(스탯 5개 평균).
// 그쪽은 legend.stats 가 이름 있는 객체라 이 화면의 배열(st[i]) 구조와 안 맞아 함수를 그대로
// 가져다 쓸 수 없다 — 같은 식만 재구현한다. DB 의 ovr 컬럼도 이 식의 STORED 생성컬럼이라
// 서버 값과 같다(백엔드 수정·응답 확장 없이 화면에서 바로 계산해도 된다). 타자·투수 구분 없음.
// 하나라도 미확인(null)이면 결과도 미확인.
export function computeOvr(st) {
  if (!st || st.some((v) => v == null)) return null;
  return st.reduce((a, b) => a + b, 0) / st.length;
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
  if (sortKey === "ovr") {
    arr.sort((a, b) => ((computeOvr(a.st) ?? -1) - (computeOvr(b.st) ?? -1)) * sortDir);
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
 * 표에 바로 꽂는 컬럼·셀을 만든다. 왼쪽(식별 열)·오른쪽(능력치) 모두 스크롤 없이 한 화면에
 * 담는다(400px 미만만 예외 — StatsTable.module.scss 커스텀 미디어쿼리). 구종 표는 항상
 * # · 구단 · 연도 · 이름(포지션 X), 스탯 표는 여기에 포지션 · OVR 까지 더한다.
 * n(이름)만 폭을 안 주면 table-layout:fixed 가 나머지 폭을 전부 몰아준다 — 화면마다 다시 계산할 필요 없음.
 *
 * 폭 근거(실측, 480px 화면 puppeteer — th.scrollWidth 로 실제 겹침 여부 확인):
 * - 헤더 폰트 500/11.5px 에서 한글 1자 ≈10.58px, th 좌우 padding 합 8px, 화살표(▼/▲) 는
 *   글자 9px + 여백 3px = 12px.
 * - 포지션(3자, 31.75px 텍스트): 31.75+8=39.75 → 40px(옆 OVR 열로 안 넘치게 텍스트만 담음).
 * - 연도(2자, 21.17px): 24px 로는 실측상 1px 초과(반올림 오차 수준) → 26px 로 여유.
 * - OVR(영문 3자, 정렬 활성 시 화살표까지 자기 안에 담아야 함): 텍스트 자체는 22px 안팎으로
 *   한글 3자보다 훨씬 좁지만 화살표 포함 시 34px 로는 5px 부족(실측 scrollWidth 39) → 42px.
 */
const LEFT_WIDTH = { idx: "20px", tm: "32px", y: "26px", n: "auto", pos: "40px", ovr: "42px" };

export function buildTable({ rows, isPitch, statLabels, sortKey, sortDir, onSort }) {
  const fixed = isPitch
    ? [["idx", "#"], ["tm", "구단"], ["y", "연도"], ["n", "이름"]]
    : [["idx", "#"], ["tm", "구단"], ["y", "연도"], ["n", "이름"], ["pos", "포지션"], ["ovr", "OVR"]];

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
    const ovr = isPitch ? null : computeOvr(r.st);

    const left = fixed.map(([key]) => ({
      key,
      value: key === "idx" ? ri + 1 : key === "y" ? r.y.slice(-2) : key === "ovr" ? (ovr == null ? "-" : ovr.toFixed(1)) : r[key],
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

  return { leftCols, rightCols, rows: cellRows, rightColWidth: isPitch ? "25px" : "36px" };
}
