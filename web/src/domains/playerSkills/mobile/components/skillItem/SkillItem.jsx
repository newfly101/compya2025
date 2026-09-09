// 스킬 리스트 항목 — 닫힘 바 + 펼침 패널(설명·등급 pill·수치표).
// 46개(타자/투수 각각) 반복되는 카드라 Screen 에서 분리했다.
import { Fragment } from "react";
import { GRADES, TIER_KEYS, buildDescSegments, buildValueRows } from "@/domains/playerSkills/config/skillsUtils.js";
import styles from "./SkillItem.module.scss";

const SkillItem = ({ skill, grade, open, onToggle, onSelectGrade }) => {
  const tierClass = styles[TIER_KEYS[skill.grade]];
  const segments = open ? buildDescSegments(skill, grade) : null;
  const rows = open ? buildValueRows(skill) : null;

  return (
    <div className={styles.item}>
      <button
        type="button"
        className={`${styles.bar} ${tierClass} ${open ? styles.open : ""}`}
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className={styles.gradeBox}>{grade}</span>
        <span className={styles.name}>{skill.name}</span>
        <span className={styles.chevron} aria-hidden="true">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open && (
        <div className={styles.panel}>
          <p className={styles.desc}>
            {segments.map((seg, i) => (
              <span
                key={i}
                className={`${seg.strong ? styles.segStrong : styles.segPlain} ${
                  seg.dir ? styles[`${seg.dir}Light`] : ""
                }`}
              >
                {seg.text}
              </span>
            ))}
          </p>

          <div className={styles.pillRow}>
            {GRADES.map((g) => {
              const has = !!skill.values[g];
              return (
                <button
                  key={g}
                  type="button"
                  className={styles.pill}
                  aria-pressed={grade === g}
                  disabled={!has}
                  onClick={() => onSelectGrade(g)}
                >
                  {g}
                </button>
              );
            })}
          </div>

          <div className={styles.table}>
            <div className={styles.headCell}>구분</div>
            {GRADES.map((g) => (
              <div key={g} className={styles.headCell} aria-pressed={grade === g}>
                {g}
              </div>
            ))}
            {rows.map((row, ri) => (
              // 표는 CSS grid — 행마다 라벨셀+7개 값셀이 flat 하게 grid 자식이어야 열이 맞는다
              <Fragment key={`row-${ri}`}>
                <div className={styles.labelCell}>
                  <span className={styles.labelText}>{row.label}</span>
                  {row.subLabels.map((sub, si) => (
                    <span key={si} className={styles.subLabel}>
                      {sub}
                    </span>
                  ))}
                </div>
                {row.cells.map((cell, ci) => (
                  <div
                    key={ci}
                    className={styles.valueCell}
                    aria-pressed={grade === GRADES[ci]}
                  >
                    {cell.lines.map((v, li) => (
                      <span
                        key={li}
                        className={cell.empty ? styles.valueEmpty : styles[`${cell.dir}Dark`]}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SkillItem;
