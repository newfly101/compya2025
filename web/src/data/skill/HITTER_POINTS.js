export const HITTER_POINTS = [
  {
    skill: "핵심타자",
    position: "타자",
    point: 10,
    condition: null
  },
  {
    skill: "위압감",
    position: "타자",
    point: 10,
    condition: null
  },
  {
    skill: "베테랑",
    position: "타자",
    point: 10,
    condition: null
  },

  {
    skill: "대포군단",
    position: "타자",
    point: 9,
    condition: null
  },
  {
    skill: "타격의달인",
    position: "타자",
    point: 9,
    condition: null
  },

  {
    skill: "슈퍼스타",
    position: "타자",
    point: 4,
    condition: {
      thirdOption: true,
      bonusPoint: 8
    }
  },
  {
    skill: "캡틴",
    position: "타자",
    point: 5,
    condition: {
      duplication: ["캡틴"],
      downgradePoint: 4
    }
  },

  {
    skill: "스프레이 히터",
    position: "타자",
    point: 8,
    condition: null
  },

  {
    skill: "예지력",
    position: "타자",
    point: 8,
    condition: null
  },
  {
    skill: "리드오프",
    position: "타자",
    point: 7,
    condition: {
      positionType: [1]
    }
  },

  {
    skill: "파워히터",
    position: "타자",
    point: 7,
    condition: {
      positionType: [4]
    }
  },
  {
    skill: "슬러거",
    position: "타자",
    point: 7,
    condition: {
      onlineType : true
    }
  },

  {
    skill: "배팅머신",
    position: "타자",
    point: 6,
    condition: null
  },

  {
    skill: "게스히터",
    position: "타자",
    point: 6,
    condition: null
  },

  {
    skill: "클러치 히터",
    position: "타자",
    point: 5,
    condition: {
      positionType: [5, 6]
    }
  },

  {
    skill: "슬러거",
    position: "타자",
    point: 4,
    condition: {
      onlineType : false
    }
  },

  {
    skill: "레전드",
    position: "타자",
    point: 3,
    condition: null
  },

  {
    skill: "에이스킬러",
    position: "타자",
    point: 3,
    condition: null
  },

  {
    skill: "우완킬러",
    position: "타자",
    point: 2,
    condition: null
  },

  {
    skill: "참을성",
    position: "타자",
    point: 2,
    condition: null
  },
  {
    skill: "매의눈",
    position: "타자",
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

export const HITTER_GRADES = [
  {ranking:"legend", point: 27, grade: "PERFECT"},
  {ranking:"legend", point: 25, grade: "GREAT"},
  {ranking:"PLATINUM 1", point: 26, grade: "PERFECT"},
  {ranking:"PLATINUM 1", point: 24, grade: "GREAT"},
  {ranking:"PLATINUM 3", point: 25, grade: "PERFECT"},
  {ranking:"PLATINUM 3", point: 23, grade: "GREAT"},
  {ranking:"PLATINUM 5", point: 24, grade: "PERFECT"},
  {ranking:"PLATINUM 5", point: 22, grade: "GREAT"},
  {ranking:"HERO", point: 22, grade: "PERFECT"},
  {ranking:"HERO", point: 17, grade: "GREAT"},
]
