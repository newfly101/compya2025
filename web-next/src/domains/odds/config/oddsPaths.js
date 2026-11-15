// routePath(config/) 에 odds_section 이 없어 도메인 상수로 둔다 — TODO(next-migration): config/routePath.js 에 ROUTE_PATHS.odds_section 추가 후 교체
export const oddsSectionPath = (id) => `/probability/${id}`;
