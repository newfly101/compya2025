// AdSense 수동 슬롯 ID 모음.
// 승인 전에는 실제 슬롯 ID가 없다 — 여기 값들은 자리표시자다.
// TODO(AdSense 승인 후): 아래 슬롯 ID를 AdSense 콘솔에서 발급받은 실제 값으로 교체한다.

// 광고 게재 스위치(단일 지점). 승인 전(현재)엔 false — in-feed 세그먼트 분할 자체를 하지
// 않는다(표/그리드를 광고 자리 없이 통짜로 렌더). 승인 통보 후에만 true 로 바꾼다.
// 승인 후 작업 순서(docs/convention/adsense.md § 5): 1) 이 값을 true 로 2) index.html
// 의 adsbygoogle 로더 스크립트 주석 해제 3) 아래 AD_SLOTS 의 TODO_* 값을 실제 슬롯 ID로 교체.
export const ADS_ENABLED = false;

export const AD_CLIENT_ID = "ca-pub-8723423525807131";

export const AD_SLOTS = {
  HOME: "TODO_HOME_SLOT_ID",
  COUPONS_LIST: "TODO_COUPONS_LIST_SLOT_ID",
  EVENTS_LIST: "TODO_EVENTS_LIST_SLOT_ID",
  NOTICES_LIST: "TODO_NOTICES_LIST_SLOT_ID",
  SKILLS_LIST: "TODO_SKILLS_LIST_SLOT_ID",
  PLAYERS_LIST: "TODO_PLAYERS_LIST_SLOT_ID",
  PLAYERS_TABLE: "TODO_PLAYERS_TABLE_SLOT_ID",
  LEGEND_STATS_LIST: "TODO_LEGEND_STATS_LIST_SLOT_ID",
  GUIDE_DETAIL: "TODO_GUIDE_DETAIL_SLOT_ID",
};
