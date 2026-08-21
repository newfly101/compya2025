// domains/players/mobile/teamVisuals.js
// 구단 로고 — 있으면 사용, 없으면 구단 컬러 원형 칩으로 폴백.
// web/src/assets/teams/{slug}.png 파일을 두면 자동으로 잡힌다 (코드 수정 불필요).
// ⚠️ 로고 파일은 저작권 사유로 프로젝트에 없다. 임의로 외부 에셋을 받아오지 않는다.

const logoModules = import.meta.glob("../../../assets/teams/*.png", {
  eager: true,
  import: "default",
});

// slug -> 로고 이미지 URL. 파일이 없으면 키 자체가 없다.
export const TEAM_LOGO = {};
for (const path in logoModules) {
  const match = path.match(/([^/]+)\.png$/);
  if (match) TEAM_LOGO[match[1]] = logoModules[path];
}

/**
 * 로고가 없을 때 쓰는 구단 컬러 원형 폴백.
 * slug 기반 결정론적 hue — 같은 구단은 항상 같은 색.
 * @param {string} slug
 * @returns {string} CSS color (hsl)
 */
export function getTeamFallbackColor(slug) {
  let hash = 0;
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  const hue = hash % 360;
  return `hsl(${hue}, 52%, 42%)`;
}
