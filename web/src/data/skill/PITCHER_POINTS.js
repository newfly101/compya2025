export const PITCHER_POINTS = [
  {
    skill: "슈퍼스타",
    position: "선발",
    point: 10,
    condition: null
  },
  {
    skill: "베테랑",
    position: "선발",
    point: 10,
    condition: {
      downgradeWith: ["자이언트 킬러"],
      downgradePoint: 1
    }
  },
  {
    skill: "팔색조",
    position: "선발",
    point: 10,
    condition: null
  },

  {
    skill: "투혼",
    position: "선발",
    point: 9,
    condition: null
  },
  {
    skill: "라이징 패스트볼",
    position: "선발",
    point: 9,
    condition: null
  },

  {
    skill: "닥터K",
    position: "선발",
    point: 8,
    condition: null
  },
  {
    skill: "수호신",
    position: "마무리",
    point: 8,
    condition: null
  },

  {
    skill: "끝판왕",
    position: "선발",
    point: 7,
    condition: {
      downgradeWith: ["자이언트 킬러"],
      downgradePoint: 1
    }
  },

  {
    skill: "언터처블",
    position: "선발",
    point: 6,
    condition: null
  },
  {
    skill: "자이언트 킬러",
    position: "선발",
    point: 6,
    condition: {
      downgradeWith: ["끝판왕", "베테랑"],
      downgradePoint: 1
    }
  },

  {
    skill: "벌떼야구",
    position: "마무리",
    point: 6,
    condition: null
  },
  {
    skill: "벌떼야구",
    position: "중계",
    point: 5,
    condition: null
  },

  {
    skill: "에이스",
    position: "중계",
    point: 5,
    condition: null
  },

  {
    skill: "이닝이터",
    position: "선발",
    point: 5,
    condition: {
      bonusWith: "베테랑",
      bonusPoint: 5
    }
  },

  {
    skill: "버닝",
    position: "중계",
    point: 4,
    condition: null
  },

  {
    skill: "캡틴",
    position: "중계",
    point: 4,
    condition: {
      downgradeWith: ["자이언트 킬러"],
      downgradePoint: 1
    }
  },

  {
    skill: "캡틴",
    position: "중계",
    point: 3,
    condition: {
      duplication: ["캡틴"],
      downgradePoint: 3
    }
  },

  {
    skill: "각성",
    position: "선발",
    point: 3,
    condition: null
  },

  {
    skill: "뒷심",
    position: "선발",
    point: 3,
    condition: null
  },

  {
    skill: "투지",
    position: "중계",
    point: 3,
    condition: null
  },
  {
    skill: "투지",
    position: "선발",
    point: 2,
    condition: null
  },

  {
    skill: "결정구",
    position: "선발",
    point: 2,
    condition: null
  },
  {
    skill: "버닝",
    position: "선발",
    point: 2,
    condition: null
  },
  {
    skill: "결정구",
    position: "선발",
    point: 2,
    condition: null
  },
  {
    skill: "강철체력",
    position: "선발",
    point: 2,
    condition: null
  },
  {
    skill: "피칭머신",
    position: "선발",
    point: 2,
    condition: null
  },
  {
    skill: "우타킬러",
    position: "선발",
    point: 2,
    condition: null
  },
  {
    skill: "전력투구",
    position: "중계",
    point: 2,
    condition: null
  },
  {
    skill: "__DEFAULT__",
    position: "ALL",
    point: 1,
    condition: null
  }
];

export const PITCHER_GRADES = [
  {ranking:"legend", point: 27, grade: "PERFECT"},
  {ranking:"legend", point: 25, grade: "GREAT"},
  {ranking:"PLATINUM 1", point: 26, grade: "PERFECT"},
  {ranking:"PLATINUM 1", point: 24, grade: "GREAT"},
  {ranking:"PLATINUM 3", point: 25, grade: "PERFECT"},
  {ranking:"PLATINUM 3", point: 23, grade: "GREAT"},
  {ranking:"PLATINUM 5", point: 23, grade: "PERFECT"},
  {ranking:"PLATINUM 5", point: 21, grade: "GREAT"},
  {ranking:"HERO", point: 21, grade: "PERFECT"},
  {ranking:"HERO", point: 18, grade: "GREAT"},
  {ranking:"HERO", point: 16, grade: "GOOD"},
]
