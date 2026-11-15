import cpb2015_1_3 from "./cpb2015_1_3.json";

export const DEFAULT_ODDS_DOC = cpb2015_1_3;
export const findOddsSection = (sectionId, doc = DEFAULT_ODDS_DOC) =>
  doc.sections.find((s) => s.id === sectionId) ?? null;
