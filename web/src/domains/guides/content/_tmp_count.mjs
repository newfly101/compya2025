import { legendMaterialPriority } from "D:/NewProjects/com2usbaseball/web/src/domains/guides/content/legendMaterialPriority.js";
import { legendStatsGuide } from "D:/NewProjects/com2usbaseball/web/src/domains/guides/content/legendStatsGuide.js";
import { mileageSniping } from "D:/NewProjects/com2usbaseball/web/src/domains/guides/content/mileageSniping.js";
import { historyLegendGuide } from "D:/NewProjects/com2usbaseball/web/src/domains/guides/content/historyLegendGuide.js";
import { playerSkillsGuide } from "D:/NewProjects/com2usbaseball/web/src/domains/guides/content/playerSkillsGuide.js";
import { playerEncyclopedia } from "D:/NewProjects/com2usbaseball/web/src/domains/guides/content/playerEncyclopedia.js";

const guides = [legendMaterialPriority, legendStatsGuide, mileageSniping, historyLegendGuide, playerSkillsGuide, playerEncyclopedia];

function collectText(guide) {
  let text = "";
  if (guide.intro) text += guide.intro;
  for (const section of guide.sections || []) {
    text += section.heading || "";
    for (const block of section.body || []) {
      if (block.type === "p" || block.type === "note") text += block.text || "";
      else if (block.type === "ul" || block.type === "ol") text += (block.items || []).join("");
      else if (block.type === "table") {
        text += (block.headers || []).join("");
        for (const row of block.rows || []) text += row.join("");
      } else if (block.type === "link") text += block.text || "";
    }
  }
  return text;
}

for (const g of guides) {
  const body = collectText(g);
  console.log(`${g.slug}\t본문글자수=${body.length}\t(intro+heading+block, 공백포함)`);
}
