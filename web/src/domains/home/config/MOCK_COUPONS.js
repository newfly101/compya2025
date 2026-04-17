// ── Mock 데이터 ───────────────────────────────────────────────
export const MOCK_COUPONS = [
  { id: 1, code: "DREAMY602ND", title: "GM드리미의 2차 쿠폰", expiredAt: "2026-05-31 23:59" },
  { id: 2, code: "DREAMYDEBUT1ST", title: "GM드리미의 데뷔 쿠폰", expiredAt: "2026-05-31 23:59" },
  { id: 3, code: "DREAMYGO2ND", title: "GM드리미의 2차 트리플렛", expiredAt: "2026-05-31 23:59" },
];


export const MOCK_COUPONS2 = [
  {
    id: 1,
    code: "DREAMY602ND",
    title: "GM드리미의 2차 쿠폰",
    rewards: ["에픽 트리플랙 x1"],
    expiredAt: "2026-05-31 23:59",
    isExpired: false,
  },
  {
    id: 4,
    code: "NEWYEARCPB2026",
    title: "설날 쿠폰",
    rewards: [
      "구단 선택 플래티넘 트리플렉 x1",
      "고유능력 변경권 x3",
      "리그 하드 볼 교환권 x2",
      "리그모드 위원장 x20",
      "스타 x1000",
    ],
    expiredAt: "2026-03-31 23:59",
    isExpired: true,
  },
]
