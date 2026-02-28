export const PLAYER_TABLE = [
  {key: "id", label: "#"},
  {key: "name", label: "이름"},
  {key: "teamId", label: "구단"},
  {key: "role", label: "타입"},
  {key: "grade", label: "등급"},
  {key: "overall", label: "오버롤"},
  {key: "position", label: "포지션"},
  {key: "attributes", label: "능력치"}
]


export const HITTER_POSITION_OPTIONS = [
  "C",
  "1B",
  "2B",
  "3B",
  "SS",
  "LF",
  "CF",
  "RF",
  "DH",
];

export const PITCHER_POSITION_OPTIONS = [
  "SP",
  "RP",
];

export const TRAIT_OPTIONS = [
  "특이폼",
  "페이스",
];


export const ATTRIBUTE_CONFIG = {
  HITTER: [
    { label: "정확", name: "accuracy" },
    { label: "파워", name: "power" },
    { label: "선구", name: "contact" },
    { label: "주력", name: "speed" },
    { label: "수비", name: "defense" },
  ],
  PITCHER: [
    { label: "제구", name: "control" },
    { label: "구위", name: "velocity" },
    { label: "체력", name: "stamina" },
    { label: "직구", name: "fastball" },
    { label: "변화", name: "breaking" },
  ],
};
