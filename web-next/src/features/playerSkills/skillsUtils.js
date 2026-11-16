// 스킬 백과사전 — 필터/정렬/설명 색칠/표 구성 순수 함수 모음.
// 원본 로직: design_handoff_skill_encyclopedia/skill-encyclopedia.dc.html 의 Component.renderVals().
// 데이터 소스와 무관하게 4단계(API 연결) 이후에도 그대로 재사용한다.

export const GRADES = ["E", "D", "C", "B", "A", "S", "S+"];

// 티어명 → CSS 모듈 클래스 접미사(로컬 토큰 --color-ps-{key}-* 와 짝을 이룬다)
export const TIER_KEYS = { 레전드: "legend", 플래티넘: "platinum", 히어로: "hero", 노말: "normal" };

// 상단 티어 칩 표시 순서(오름차순) — 리스트 정렬 순서(TIER_ORDER, 내림차순)와 다르다.
export const TIER_FILTERS = ["전체", "노말", "히어로", "플래티넘", "레전드"];

// 리스트 정렬 우선순위 — 레전드 → 플래티넘 → 히어로 → 노말
export const TIER_ORDER = { 레전드: 0, 플래티넘: 1, 히어로: 2, 노말: 3 };

function idNumber(id) {
  return parseInt(id.slice(1), 10);
}

// 타입/티어/검색어로 거르고 [티어 내림차순 → 엑셀 # 내림차순]으로 정렬
export function filterAndSortSkills(list, { type, cat, q }) {
  return list
    .filter(
      (s) =>
        s.type === type &&
        (cat === "전체" || s.grade === cat) &&
        (!q || s.name.includes(q)),
    )
    .slice()
    .sort((a, b) => TIER_ORDER[a.grade] - TIER_ORDER[b.grade] || idNumber(b.id) - idNumber(a.id));
}

// desc 의 각 {} 자리 바로 뒤에서 처음 만나는 "증가"/"감소" 단어를 찾는다.
export function directionsOf(skill) {
  const parts = skill.desc.split("{}");
  return parts.slice(1).map((_, i) => {
    for (let k = i + 1; k < parts.length; k += 1) {
      const m = parts[k].match(/증가|감소/);
      if (m) return m[0];
    }
    return "증가";
  });
}

// 설명 문장을 일반/강조(색칠) 세그먼트로 쪼갠다.
// dir: 'up' | 'down' | null — 색은 렌더링 쪽(CSS 토큰)에서 문맥(밝은 박스/어두운 표)에 맞게 입힌다.
export function buildDescSegments(skill, grade) {
  const parts = skill.desc.split("{}");
  const values = skill.values[grade];
  const dirs = directionsOf(skill);
  const out = [];

  parts.forEach((part, i) => {
    let rest = part;
    if (i > 0) {
      const dir = dirs[i - 1] === "감소" ? "down" : "up";
      out.push({ text: values ? values[i - 1] : "–", dir, strong: true });

      const m = rest.match(/^(%?\s*(?:추가\s*)?)(증가|감소)/);
      if (m) {
        const mid = m[1].trim();
        out.push({
          text: (mid.startsWith("%") ? "" : " ") + (mid ? `${mid} ` : ""),
          dir: null,
          strong: false,
        });
        out.push({ text: m[2], dir, strong: true });
        rest = rest.slice(m[0].length);
      }
    }
    if (rest) out.push({ text: rest, dir: null, strong: false });
  });

  return out;
}

// labels 를 "라벨 ①/②/③" 슬래시 그룹으로 묶어 표 행을 만든다.
export function buildValueRows(skill) {
  const groups = [];
  skill.labels.forEach((label, j) => {
    const m = label.match(/^(.*?) ?[①②③]$/);
    const last = groups[groups.length - 1];
    if (m && last && last.base === m[1] && last.grouped) {
      last.idx.push(j);
    } else {
      groups.push({ base: m ? m[1] : label, grouped: !!m, idx: [j] });
    }
  });

  const dirs = directionsOf(skill);

  return groups.map((g) => ({
    label: g.base,
    subLabels: g.grouped ? g.idx.map((_, k) => ["①", "②", "③"][k]) : [],
    cells: GRADES.map((grade) => {
      const has = !!skill.values[grade];
      const lines = has ? g.idx.map((j) => skill.values[grade][j]) : ["–"];
      return {
        lines,
        empty: !has,
        dir: dirs[g.idx[0]] === "감소" ? "down" : "up",
      };
    }),
  }));
}

// 등급 하나가 "값을 가진 스킬을 하나라도 갖는가" 판정 — 상단 등급 칩·펼침 패널 pill 이 공유한다.
function findBestGrade(hasValue) {
  return [...GRADES].reverse().find((g) => hasValue(g));
}

// 표시 등급에 값이 없는 스킬(노말·히어로 S/S+)을 펼칠 때 값이 있는 최고 등급으로 전환
export function bestAvailableGrade(skill) {
  return findBestGrade((g) => skill.values[g]);
}

// 현재 화면에 보이는 목록 중 해당 등급에 값을 가진 스킬이 하나라도 있는지 — 상단 등급 칩 비활성 판정
export function isGradeAvailableInList(list, grade) {
  return list.some((s) => !!s.values[grade]);
}

// 목록 전체 기준 "값 있는 최고 등급" — 티어 필터/검색 변경으로 현재 등급이 불가능해졌을 때 자동 보정용
export function bestAvailableGradeForList(list) {
  return findBestGrade((g) => isGradeAvailableInList(list, g));
}
