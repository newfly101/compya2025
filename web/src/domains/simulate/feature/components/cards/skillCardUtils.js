import styles from "./SkillCard.module.scss";

export const calcAttrClass = (value) => {
  if (value >= 90) return styles.attrHigh;
  if (value >= 80) return styles.attrMid;
  return "";
};

export const calcOptionClass = (value) => {
  if (value === "특이폼") return styles.option1;
  if (value === "페이스") return styles.option2;
  return "";
};
