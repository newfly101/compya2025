import React from "react";
import styles from "@/styles/pages/SkillDictionary.module.scss";
import { HITTER_SKILLS } from "@/data/skill/HITTER_SKILLS.js";

const SkillPanels = ({standard, renderGroup}) => {
  return (
    <footer className={styles.panel}>
      {standard === "레전드" && renderGroup("레전드", "legend", HITTER_SKILLS.legend)}
      {renderGroup("플레티넘", "platinum", HITTER_SKILLS.platinum)}
      {renderGroup("히어로", "hero", HITTER_SKILLS.hero)}
      {renderGroup("노말", "normal", HITTER_SKILLS.normal)}
    </footer>
  );
};

export default SkillPanels;
