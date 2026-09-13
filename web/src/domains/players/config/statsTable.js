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
 *
 * n(이름)은 고정 상수가 아니라 computeNameColWidth() 로 계산한 값을 쓴다 — 이 함수에 들어오는
 * rows 전체(세그먼트로 쪼개기 전 sortedListRows 전량) 중 가장 긴 이름 기준으로 한 번만 정해져,
 * in-feed 광고로 표가 여러 <StatsTable> 세그먼트로 나뉘어도(AdSense 승인 후) 모든 세그먼트가
 * 같은 이름 열 폭을 쓴다. 대부분 3자(≈46px)라 짧게, 운영 DB 최장 5자 외국인 선수("에스테베즈"
 * 등)가 섞인 구단·연도만 좀 더 넓어진다. 말줄임(.tdName 의 ellipsis)이 안전망으로 남아 있어
 * 계산이 약간 넉넉해도 레이아웃이 깨지지 않는다.
 *
 * 폭 근거(실측, 480px 화면 puppeteer — th.scrollWidth 로 실제 겹침 여부 확인):
 * - 헤더 폰트 500/11.5px 에서 한글 1자 ≈10.58px, th 좌우 padding 합 8px, 화살표(▼/▲) 는
 *   글자 9px + 여백 3px = 12px.
 * - 포지션(3자, 31.75px 텍스트): 31.75+8=39.75 → 40px(옆 OVR 열로 안 넘치게 텍스트만 담음).
 * - 연도(2자, 21.17px): 24px 로는 실측상 1px 초과(반올림 오차 수준) → 26px 로 여유.
 * - OVR(영문 3자, 정렬 활성 시 화살표까지 자기 안에 담아야 함): 텍스트 자체는 22px 안팎으로
 *   한글 3자보다 훨씬 좁지만 화살표 포함 시 34px 로는 5px 부족(실측 scrollWidth 39) → 42px.
 */
const LEFT_WIDTH = { idx: "20px", tm: "32px", y: "26px", pos: "40px", ovr: "42px" };

// 이름 열 폭 — 표가 in-feed 광고로 여러 <StatsTable> 세그먼트로 쪼개질 때(AdSense 승인 후),
// 세그먼트마다 "그 세그먼트에 보이는 이름 중 가장 긴 것"으로 auto 계산되면 세그먼트마다 폭이
// 달라져 좌우 컬럼이 어긋난다(버그 리포트: 표 UI 불일치). 항상 이 함수가 받는 전체 rows
// (세그먼트로 나뉘기 전의 sortedListRows 전량)를 기준으로 한 번만 계산해, 모든 세그먼트가
// 같은 값을 쓰게 한다 — 분할 여부와 무관하게 항상 같은 로직이라 단일 표(분할 없음) 결과도
// 기존 auto 계산과 거의 동일하다(한글 1자 ≈10.58px 실측치 기반, 여유 padding 포함).
function computeNameColWidth(rows) {
  let maxLen = 3; // 최소 3자 폭은 항상 보장(기존 흔한 케이스 46px 언저리와 맞춘다)
  for (const r of rows) {
    if (r.n && r.n.length > maxLen) maxLen = r.n.length;
  }
  return `${maxLen * 11 + 13}px`;
}

export function buildTable({ rows, isPitch, statLabels, sortKey, sortDir, onSort }) {
  const fixed = isPitch
    ? [["idx", "#"], ["tm", "구단"], ["y", "연도"], ["n", "이름"]]
    : [["idx", "#"], ["tm", "구단"], ["y", "연도"], ["n", "이름"], ["pos", "포지션"], ["ovr", "OVR"]];

  const nameColWidth = computeNameColWidth(rows);
  const widthOf = (key) => (key === "n" ? nameColWidth : LEFT_WIDTH[key]);

  const leftCols = fixed.map(([key, label]) => ({
    key,
    label,
    width: widthOf(key),
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

  // 오른쪽은 반대로 이름 열이 줄어 남는 폭을 전부 받는 쪽 — 열마다 똑같이 1/n 씩 나눠(%),
  // 화면이 넓어질수록(또는 이름이 짧을수록) 고르게 넓어진다. % 대신 px 로 고정하면
  // table-layout:fixed 표는 그 합보다 넓어져도(가운데 표 참고) 안 좁아져도 열이 그대로라
  // 남는 폭이 오른쪽 끝에 빈 칸으로 남거나(넓을 때), 400px 처럼 빠듯할 땐 반대로 화면
  // 밖으로 밀려 마지막 열이 잘려나간다 — % 는 표 자체 폭에 비례하므로 두 문제 다 없다.
  const rightColWidth = `${100 / rightCols.length}%`;

  return { leftCols, rightCols, rows: cellRows, rightColWidth };
}
