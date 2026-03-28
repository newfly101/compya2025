// 스킬 메타 정보: 선호포지션 / 상극 / 시너지
// tier: 1(최고) ~ 5(기본)
// preferredPosition: '선발' | '중계' | '마무리' | 'ALL'
export const PITCHER_SKILL_META = {
  L1: { tier: 1, preferredPosition: '선발',   conflictsWith: [],                                             synergyWith: ['P4'] },  // 슈퍼스타
  L2: { tier: 2, preferredPosition: '선발',   conflictsWith: [],                                             synergyWith: ['P4'] },  // 팔색조
  L3: { tier: 3, preferredPosition: '선발',   conflictsWith: [],                                             synergyWith: ['P4'] },  // 라이징패스트볼
  L4: { tier: 1, preferredPosition: '선발',   conflictsWith: ['P4'],                                         synergyWith: ['P5'] },  // 베테랑
  L5: { tier: 4, preferredPosition: '중계',   conflictsWith: ['P4'],                                         synergyWith: [] },       // 캡틴
  L6: { tier: 2, preferredPosition: '선발',   conflictsWith: [],                                             synergyWith: [] },       // 투혼
  L7: { tier: 3, preferredPosition: '선발',   conflictsWith: ['P4'],                                         synergyWith: [] },       // 닥터K

  P1: { tier: 3, preferredPosition: '중계',   conflictsWith: ['P4'],                                         synergyWith: [] },       // 각성
  P2: { tier: 3, preferredPosition: '중계',   conflictsWith: ['P4'],                                         synergyWith: [] },       // 뒷심
  P3: { tier: 2, preferredPosition: '선발',   conflictsWith: ['P4'],                                         synergyWith: [] },       // 끝판왕
  P4: { tier: 3, preferredPosition: '선발',   conflictsWith: ['L4','L7','L5','P1','P2','P9','P11','P8','P10','P3'], synergyWith: ['L2','L1','L6','L3','P6','P13'] }, // 자이언트킬러
  P5: { tier: 2, preferredPosition: '선발',   conflictsWith: [],                                             synergyWith: ['L4'] },  // 이닝이터
  P6: { tier: 2, preferredPosition: '선발',   conflictsWith: [],                                             synergyWith: ['P4'] },  // 언터처블
  P7: { tier: 4, preferredPosition: '선발',   conflictsWith: [],                                             synergyWith: [] },       // 결정구
  P8: { tier: 2, preferredPosition: '마무리', conflictsWith: ['P4'],                                         synergyWith: [] },       // 수호신
  P9: { tier: 3, preferredPosition: '중계',   conflictsWith: ['P4'],                                         synergyWith: [] },       // 버닝
  P10:{ tier: 3, preferredPosition: '중계',   conflictsWith: ['P4'],                                         synergyWith: [] },       // 에이스
  P11:{ tier: 2, preferredPosition: '마무리', conflictsWith: ['P4'],                                         synergyWith: [] },       // 벌떼야구
  P13:{ tier: 3, preferredPosition: '중계',   conflictsWith: [],                                             synergyWith: [] },       // 투지
  H6: { tier: 4, preferredPosition: '중계',   conflictsWith: [],                                             synergyWith: [] },       // 전력투구
};
// 나머지 HERO/NORMAL 스킬: preferredPosition 'ALL', tier 5 (메타 미등록)
