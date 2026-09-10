// 서버 응답(player-skills API) → 화면(PlayerSkillScreen, 1단계 config/skills.json) 형태 변환.
// 화면은 4단계에서 이 어댑터를 거친 데이터를 받는다 — 이 파일은 그 전에 미리 만든다.
//
// labels 는 서버가 주지 않는다. 설명문(descriptionTemplate)에서 "능력 이름"을 뽑아
// 계산하지만, 실제 표기는 사람이 게임 용어로 다듬은 값이라(예: "실투를 이끌어내는 능력"
// → "실투 유발", "체력 수치 소모량" → "체력 소모") 조사만 걷어내는 규칙으로는 92개 중
// 20개만 정확히 재현된다. 나머지 72개는 LABEL_OVERRIDES 에 정답을 그대로 박아둔다.
// (대조는 skills.json 을 거꾸로 "서버 응답"으로 흉내 내 어댑터에 통과시키는 일회성
// node 스크립트로 92건 전부 확인했다 — 스크립트는 커밋하지 않음)

const ROLE_TO_TYPE = { HITTER: "hitter", PITCHER: "pitcher" };
const ROLE_TO_ID_PREFIX = { HITTER: "b", PITCHER: "p" };
const GRADE_TO_LABEL = { NORMAL: "노말", HERO: "히어로", PLATINUM: "플래티넘", LEGEND: "레전드" };

const GRADES = ["E", "D", "C", "B", "A", "S", "S+"];
const CIRCLED = ["①", "②", "③", "④", "⑤"];

// desc 조각 끝의 조사만 걷어낸다 — "때/후/상대할 때" 같은 앞쪽 문맥은 못 걷어낸다.
// "능력이" 는 통째로(3글자) 버리고, "능력치가/수치가/효과가" 는 "가" 한 글자만 버려서
// "정확 능력치" 처럼 명사 자체(능력치·수치·효과)는 남긴다.
function extractBase(segment) {
  let text = segment ?? "";
  const lastComma = text.lastIndexOf(",");
  if (lastComma !== -1) text = text.slice(lastComma + 1);
  text = text.trim();
  if (text.endsWith("능력이")) return text.slice(0, -3).trim();
  if (text.endsWith("능력치가")) return text.slice(0, -1).trim();
  if (text.endsWith("수치가")) return text.slice(0, -1).trim();
  if (text.endsWith("효과가")) return text.slice(0, -1).trim();
  if (text.endsWith("가")) return text.slice(0, -1).trim();
  if (text.endsWith("이")) return text.slice(0, -1).trim();
  if (text.endsWith("을") || text.endsWith("를")) return text.slice(0, -1).trim();
  return text;
}

// "1,1,3" → [1, 1, 3]
function parseGroupSizes(valueGroups) {
  return String(valueGroups ?? "")
    .split(",")
    .map((n) => parseInt(n, 10))
    .filter((n) => Number.isFinite(n) && n > 0);
}

// {0}{1}... 를 화면(skillsUtils.js)이 기대하는 자리표시자 {} 로 되돌린다.
function toDisplayDesc(descriptionTemplate) {
  return String(descriptionTemplate ?? "").replace(/\{\d+\}/g, "{}");
}

// 일반 규칙으로 라벨을 1차 계산한다 — LABEL_OVERRIDES 에 없는 스킬(신규 스킬 추가 시)의
// fallback. valueGroups 로 자리표시자를 묶어(①②③) 그룹 크기가 1보다 크면 순번을 붙인다.
export function computeLabels(descriptionTemplate, valueGroups) {
  const segs = toDisplayDesc(descriptionTemplate).split("{}");
  const groupSizes = parseGroupSizes(valueGroups);
  const labels = [];
  let idx = 0;
  groupSizes.forEach((size) => {
    const base = extractBase(segs[idx]);
    for (let k = 0; k < size; k += 1) {
      labels.push(size > 1 ? `${base} ${CIRCLED[k] ?? k + 1}` : base);
    }
    idx += size;
  });
  return labels;
}

// 사람이 정한 정답 라벨. 키: `${playerRole}:${sortOrder}` — sortOrder 가 곧 skills.json 의
// b46/p46 번호와 같아서(서버 sort_order = 화면 임시데이터 id 숫자) 그대로 대조 가능하다.
const LABEL_OVERRIDES = {
  "HITTER:46": ["안타", "정확 능력치", "안타 ①", "안타 ②", "안타 ③"],
  "HITTER:45": ["장타", "파워 능력치", "장타 ①", "장타 ②", "장타 ③"],
  "HITTER:44": ["장타", "장타"],
  "HITTER:43": ["모든 능력치", "안타", "모든 능력치"],
  "HITTER:42": ["실투 유발", "안타"],
  "HITTER:41": ["안타", "안타 ①", "안타 ②", "안타 ③"],
  "HITTER:40": ["모든 능력치", "안타"],
  "HITTER:39": ["장타", "도루 성공", "도루 성공", "도루 성공"],
  "HITTER:38": ["라인드라이브"],
  "HITTER:37": ["장타"],
  "HITTER:36": ["모든 능력치"],
  "HITTER:34": ["투구 예측"],
  "HITTER:33": ["안타"],
  "HITTER:31": ["라인드라이브"],
  "HITTER:30": ["타이밍 상승"],
  "HITTER:29": ["타이밍 상승"],
  "HITTER:28": ["모든 능력치", "안타"],
  "HITTER:27": ["홈런"],
  "HITTER:23": ["선구 능력치"],
  "HITTER:22": ["체력 소모"],
  "HITTER:21": ["안타"],
  "HITTER:18": ["장타"],
  "HITTER:16": ["장타", "삼진 억제"],
  "HITTER:15": ["수비 능력치", "실투·폭투 억제"],
  "HITTER:13": ["안타"],
  "HITTER:11": ["안타"],
  "HITTER:10": ["안타"],
  "HITTER:9": ["직구 유발"],
  "HITTER:8": ["안타"],
  "HITTER:7": ["수비 능력치"],
  "HITTER:6": ["장타"],
  "HITTER:4": ["안타"],
  "HITTER:3": ["모든 능력치"],
  "HITTER:2": ["장타"],
  "HITTER:1": ["장타"],
  "PITCHER:46": ["피안타 감소", "피안타 감소 ①", "피안타 감소 ②", "피안타 감소 ③"],
  "PITCHER:45": [
    "피안타 감소",
    "탈삼진",
    "피안타 감소 ①",
    "피안타 감소 ②",
    "피안타 감소 ③",
    "탈삼진 ①",
    "탈삼진 ②",
    "탈삼진 ③",
  ],
  "PITCHER:44": ["공의 움직임", "범타 생성"],
  "PITCHER:43": ["모든 능력치", "피안타 감소", "모든 능력치"],
  "PITCHER:42": ["피안타 감소", "피안타 감소 ①", "피안타 감소 ②", "피안타 감소 ③"],
  "PITCHER:41": ["모든 능력치", "범타 생성"],
  "PITCHER:40": ["착시효과", "범타 생성"],
  "PITCHER:39": ["모든 능력치", "피안타 감소"],
  "PITCHER:38": ["타이밍 하락", "범타 생성"],
  "PITCHER:37": ["범타 생성"],
  "PITCHER:36": ["범타 생성"],
  "PITCHER:34": ["타이밍 하락"],
  "PITCHER:33": ["모든 능력치"],
  "PITCHER:32": ["모든 능력치"],
  "PITCHER:31": ["아웃 카운트", "피안타 감소"],
  "PITCHER:30": ["모든 능력치"],
  "PITCHER:29": ["결정구 발동", "탈삼진"],
  "PITCHER:28": ["체력 제외 능력치", "피안타 감소"],
  "PITCHER:27": ["모든 능력치", "피안타 감소"],
  "PITCHER:26": ["제구·구위 능력치"],
  "PITCHER:23": ["모든 능력치"],
  "PITCHER:21": ["모든 능력치"],
  "PITCHER:20": ["모든 능력치"],
  "PITCHER:19": ["주력·수비 능력치"],
  "PITCHER:18": ["제구·구위 능력치"],
  "PITCHER:17": ["탈삼진", "장타 허용"],
  "PITCHER:16": ["모든 능력치"],
  "PITCHER:15": ["모든 능력치"],
  "PITCHER:13": ["피안타 감소"],
  "PITCHER:12": ["피안타 감소"],
  "PITCHER:11": ["피안타 감소"],
  "PITCHER:10": ["피안타 감소"],
  "PITCHER:9": ["체력 소모"],
  "PITCHER:8": ["도루 시도"],
  "PITCHER:5": ["피안타 감소"],
  "PITCHER:2": ["체력 수치"],
  "PITCHER:1": ["피안타 감소"],
};

function resolveLabels(playerRole, sortOrder, descriptionTemplate, valueGroups) {
  const override = LABEL_OVERRIDES[`${playerRole}:${sortOrder}`];
  return override ?? computeLabels(descriptionTemplate, valueGroups);
}

// tiers[] (서버, E→S+ 오름차순) → values 객체(화면, 등급별 문자열 배열 · 없는 등급은 null).
function buildValues(tiers) {
  const byGrade = {};
  (tiers ?? []).forEach((tier) => {
    byGrade[tier.tier] = (tier.values ?? []).map((v) => String(v));
  });
  const values = {};
  GRADES.forEach((grade) => {
    values[grade] = byGrade[grade] ?? null;
  });
  return values;
}

// 서버 스킬 1건 → 화면이 기대하는 스킬 1건.
export function toScreenSkill(serverSkill) {
  const {
    playerRole,
    skillGrade,
    skillName,
    sortOrder,
    descriptionTemplate,
    valueGroups,
    tiers,
  } = serverSkill;

  return {
    // 화면 정렬(skillsUtils.js 의 idNumber)이 "b46"/"p46" 형태를 전제로 하므로
    // 서버 UUID 대신 role+sortOrder 로 같은 모양의 id 를 재구성한다.
    id: `${ROLE_TO_ID_PREFIX[playerRole]}${sortOrder}`,
    type: ROLE_TO_TYPE[playerRole],
    grade: GRADE_TO_LABEL[skillGrade],
    name: skillName,
    desc: toDisplayDesc(descriptionTemplate),
    labels: resolveLabels(playerRole, sortOrder, descriptionTemplate, valueGroups),
    values: buildValues(tiers),
  };
}
