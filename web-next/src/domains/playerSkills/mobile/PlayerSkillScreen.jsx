"use client";
import FilterSection from "@/global/ui/mobile/filterSection/FilterSection.jsx";
import { useMemo, useState } from "react";
import {
  GRADES,
  TIER_FILTERS,
  TIER_KEYS,
  bestAvailableGrade,
  bestAvailableGradeForList,
  filterAndSortSkills,
  isGradeAvailableInList,
} from "@/domains/playerSkills/config/skillsUtils.js";
import SkillItem from "./components/skillItem/SkillItem.jsx";
import GuideAccordion from "@/global/ui/guideAccordion/GuideAccordion.jsx";
import { GUIDES_BY_SLUG } from "@/domains/guides/content/index.js";
import "./playerSkills.tokens.scss";
import styles from "./PlayerSkillScreen.module.scss";

// TIER_KEYS 값(legend/platinum/hero/normal) → 점 색 클래스 접미사(Legend/Platinum/...)
const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// TODO(next-migration): useSearchTracking(q) · AdSlot(SKILLS_LIST, 10번째 뒤) 미이전
const PlayerSkillScreen = ({ skills: all }) => {
  const [type, setType] = useState("hitter");
  const [cat, setCat] = useState("전체");
  const [q, setQ] = useState("");
  const [grade, setGrade] = useState("S");
  const [open, setOpen] = useState(null);

  const list = useMemo(() => filterAndSortSkills(all, { type, cat, q }), [all, type, cat, q]);
  const visibleIds = useMemo(() => new Set(list.map((x) => x.id)), [list]);

  // 티어 필터/검색 변경으로 현재 표시 등급이 선택 불가능해지면(예: 노말만 남았는데 S 선택 중)
  // 값 있는 최고 등급으로 자동으로 내린다. 반대로(전체 복귀) 다시 올리지는 않는다 — 사용자 선택 존중.
  // (렌더 중 보정 — React 권장 패턴. 반대로 전체 복귀 시 다시 올리지는 않는다)
  if (list.length > 0 && !isGradeAvailableInList(list, grade)) {
    setGrade(bestAvailableGradeForList(list));
  }

  const selectType = (next) => {
    setType(next);
    setOpen(null);
  };

  const selectCat = (next) => {
    setCat(next);
    setOpen(null);
  };

  const changeQuery = (value) => {
    setQ(value);
    setOpen(null);
  };

  // 표시 등급에 값 없는 스킬(노말·히어로 S/S+)을 열면 값 있는 최고 등급(A)으로 전환
  const toggleItem = (skill) => {
    const willOpen = open !== skill.id;
    setOpen(willOpen ? skill.id : null);
    if (willOpen && !skill.values[grade]) {
      setGrade(bestAvailableGrade(skill));
    }
  };

  const applied = [cat !== "전체" && cat, type === "hitter" ? "타자" : "투수", `${grade}등급`].filter(Boolean);

  return (
    <div className={styles.screen}>
      <GuideAccordion guide={GUIDES_BY_SLUG["player-skills-guide"]} />

      <div className={styles.filters}>
        <div className={styles.searchRow}>
          <svg
            className={styles.searchIcon}
            viewBox="0 0 16 16"
            width="15"
            height="15"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
          >
            <circle cx="7" cy="7" r="4.6" />
            <path d="M10.6 10.6 L14 14" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={q}
            placeholder="스킬 이름 검색"
            autoComplete="off"
            onChange={(e) => changeQuery(e.target.value)}
          />
          {q && (
            <button
              type="button"
              className={styles.clearButton}
              aria-label="검색어 지우기"
              onClick={() => changeQuery("")}
            >
              ×
            </button>
          )}
        </div>

        <FilterSection storageKey="playerSkills.filterOpen" count={applied.length} summary={applied.join(" · ")}>
        <div className={styles.tierRow}>
          {TIER_FILTERS.map((t) => (
            <button
              key={t}
              type="button"
              className={styles.tierChip}
              aria-pressed={t === cat}
              onClick={() => selectCat(t)}
            >
              {t !== "전체" && (
                <span className={`${styles.dot} ${styles[`dot${capitalize(TIER_KEYS[t])}`]}`} aria-hidden="true" />
              )}
              {t}
            </button>
          ))}
        </div>

        <div className={styles.typeSegment}>
          <button type="button" aria-pressed={type === "hitter"} onClick={() => selectType("hitter")}>
            타자
          </button>
          <button type="button" aria-pressed={type === "pitcher"} onClick={() => selectType("pitcher")}>
            투수
          </button>
        </div>

        <div className={styles.gradeRow}>
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              className={styles.gradeChip}
              aria-pressed={g === grade}
              disabled={!isGradeAvailableInList(list, g)}
              onClick={() => setGrade(g)}
            >
              {g}
            </button>
          ))}
        </div>
        </FilterSection>

        <div className={styles.meta}>
          <span>
            {`${list.length}개 · 표시 등급 `}
            <b>{grade}</b>
          </span>
          <span className={styles.metaSort}>티어 높은순</span>
        </div>
      </div>

      {list.length === 0 && (
        <div className={styles.empty}>조건에 맞는 스킬이 없습니다. 검색어나 필터를 확인해보세요.</div>
      )}
      {/* 92개 전부 SSR HTML 에 둔다 — 선택 안 된 타입·필터 밖 항목은 hidden(크롤러는 DOM 을 읽는다) */}
      {["hitter", "pitcher"].map((t) => (
        <div key={t} className={styles.list} hidden={t !== type}>
          {filterAndSortSkills(all, { type: t, cat: "전체", q: "" }).map((skill) => (
            <SkillItem
              key={skill.id}
              skill={skill}
              grade={grade}
              open={open === skill.id}
              hidden={!visibleIds.has(skill.id)}
              onToggle={() => toggleItem(skill)}
              onSelectGrade={setGrade}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default PlayerSkillScreen;
