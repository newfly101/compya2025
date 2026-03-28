// 투수 조합 프리셋
// skills 배열의 모든 코드가 카드에 포함되면 매칭
// tier: 'S' | 'A' | 'B'
export const PITCHER_COMBO_PRESETS = [
  {
    id: 'legend_starter_1',
    label: '3보라 최강선발',
    skills: ['L4', 'L2', 'L1'],
    position: '선발',
    description: '장타 안나고 안타도 힘듦',
    tier: 'S',
  },
  {
    id: 'legend_starter_2',
    label: '3보라 체력선발',
    skills: ['L4', 'L2', 'L6'],
    position: '선발',
    description: '안타 안나고 9이닝 버팀',
    tier: 'S',
  },
  {
    id: 'legend_starter_3',
    label: '3보라 변화구선발',
    skills: ['L2', 'L1', 'L6'],
    position: '선발',
    description: '변화구 강화, 선발 지속력',
    tier: 'S',
  },
  {
    id: 'plat_starter_1',
    label: '2보라 선발',
    skills: ['L4', 'L1', 'P3'],
    position: '선발',
    description: '안타 뒤지게 안나옴',
    tier: 'A',
  },
  {
    id: 'plat_relay_win',
    label: '필승조 중계',
    skills: ['P1', 'P2', 'P9'],
    position: '중계',
    description: '이기고 있을 때 최적',
    tier: 'A',
  },
  {
    id: 'plat_relay_chase',
    label: '추격조 중계',
    skills: ['P13', 'P2', 'P9'],
    position: '중계',
    description: '지고 있을 때 방어율 관리',
    tier: 'A',
  },
];
