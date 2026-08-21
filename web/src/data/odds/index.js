// AUTO-GENERATED — scripts/parse-odds.mjs 가 실행될 때마다 자동 재생성한다.
// 수동으로 편집하지 마라. 문서를 추가하려면 test-docs/*.html 을 추가하고
// node scripts/parse-odds.mjs 를 다시 실행하면 이 파일도 함께 갱신된다.
import cpb2015_1_3 from "./cpb2015_1_3.json";

export const ODDS_DOCS = [cpb2015_1_3];
export const DEFAULT_ODDS_DOC = cpb2015_1_3;
export const findOddsSection = (sectionId, doc = DEFAULT_ODDS_DOC) =>
  doc.sections.find((s) => s.id === sectionId) ?? null;
