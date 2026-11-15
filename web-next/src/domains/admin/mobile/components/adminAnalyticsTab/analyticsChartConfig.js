// domains/admin/mobile/components/adminAnalyticsTab/analyticsChartConfig.js
// AdminAnalyticsTab 전용 라벨/색 상수 + 순수 변환 함수. 컴포넌트가 아닌 값만 담는다 —
// AnalyticsCharts.jsx(컴포넌트 전용)와 나뉜 이유는 react-refresh/only-export-components
// (컴포넌트 파일은 컴포넌트만 export해야 Fast Refresh 가 안 깨진다).

// BE event_type 4종(AnalyticsRange 와 별개, 수집 이벤트 종류) 한글 라벨.
// 코드가 여기 없는 값도 그대로 노출 — BE 가 종류를 추가해도 화면이 죽지 않는다.
export const EVENT_TYPE_LABEL = {
  PAGE_VIEW: "페이지 조회",
  OUTBOUND_CLICK: "외부 링크 클릭",
  CONTENT_CLICK: "콘텐츠 클릭",
  SEARCH: "검색",
};

// device_type 서버 파생값(AnalyticsEventGuard.detectDeviceType) 한글 라벨.
// unknown 은 실제로는 나오지 않지만(§ FN-19 COALESCE 방어) 스키마 계약상 대비해 둔다.
export const DEVICE_TYPE_LABEL = {
  mobile: "모바일",
  tablet: "태블릿",
  pc: "PC",
  unknown: "알 수 없음",
};

// 기기 비율 막대 색 — 신규 토큰 없이 관리자 태그 팔레트 재사용(admin.tokens.scss).
export const DEVICE_TYPE_COLOR = {
  mobile: "var(--color-admin-tag-purple-text)",
  tablet: "var(--color-admin-tag-green-text)",
  pc: "var(--color-admin-tag-amber-text)",
  unknown: "var(--color-admin-tag-neutral-text)",
};

// 신규/재방문(FN-10) · 가입 전환(FN-13) — 기기 비율과 같은 "라벨/막대/카운트" 모양으로 그린다.
export const VISITOR_TYPE_LABEL = { new: "신규", returning: "재방문" };
export const VISITOR_TYPE_COLOR = {
  new: "var(--color-admin-tag-purple-text)",
  returning: "var(--color-admin-tag-green-text)",
};
export const SIGNUP_LABEL = { immediate: "즉시가입", returningThenSignup: "재방문 후 가입" };
export const SIGNUP_COLOR = {
  immediate: "var(--color-admin-tag-purple-text)",
  returningThenSignup: "var(--color-admin-tag-amber-text)",
};

// count map(`{key: count}`) → 라벨/색 붙인 행 배열. deviceRatio·visitorComposition·signupConversion 공통.
export const countRows = (countMap, labelOf, colorOf) =>
  Object.entries(countMap ?? {}).map(([key, count]) => ({
    key,
    label: labelOf[key] ?? key,
    count,
    color: colorOf[key] ?? colorOf.unknown ?? "var(--color-admin-tag-neutral-text)",
  }));

// regionRatio(FN-지역 분포) 는 키 자체가 라벨("수원시 팔달구" · "JP" · "기타" · "알수없음") —
// device/visitor/signup 처럼 고정 라벨 딕셔너리가 없다. 값 내림차순은 BE 가 이미 정렬해서 주므로
// 여기서 다시 정렬하지 않는다(삽입 순서 유지).
const REGION_BAR_COLOR = "var(--color-admin-tag-purple-text)";
export const regionRows = (regionRatio) =>
  Object.entries(regionRatio ?? {}).map(([label, count]) => ({
    key: label,
    label,
    count,
    color: REGION_BAR_COLOR,
  }));

// 시간대별 분포(HourlyList) 가 채워 그리는 0~23시 라벨 — 활동 없는 시각도 0건 행으로 남기려면
// API 응답과 별개로 24개 시각을 직접 나열해야 한다.
export const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
