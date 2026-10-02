import { REG_FILTERS } from "@/domains/legendCollectionSkills/config/legendCollectionSkills.js";
import { ALL, TYPE_FILTERS, teamColor } from "@/domains/legendStats/config/legendStats.js";
import FilterChips from "@/domains/legendCollections/mobile/components/filterChips/FilterChips.jsx";
import styles from "./SkillFilters.module.scss";

const TYPE_OPTIONS = TYPE_FILTERS.map((t) => ({ value: t }));
const REG_OPTIONS = REG_FILTERS.map((r) => ({ value: r }));

/** 목록 위 조건 (Figma 01 Controls) — 검색 · 구단 칩 · 전체/타자/투수 · 전체/등록/미등록 · 요약 줄. 칩은 legendCollections 와 같은 부품 */
const SkillFilters = ({ query, onQuery, teams, team, onTeam, type, onType, reg, onReg, summary }) => (
  <>
    <label className={styles.search}>
      <span aria-hidden="true">⌕</span>
      <input
        type="search"
        value={query}
        placeholder="레전드 이름 검색"
        autoComplete="off"
        onChange={(e) => onQuery(e.target.value)}
      />
    </label>
    <FilterChips
      label="구단"
      options={teams.map((t) => ({ value: t, dot: t === ALL ? undefined : teamColor(t) }))}
      value={team}
      onChange={onTeam}
    />
    <FilterChips label="타자·투수" variant="seg" options={TYPE_OPTIONS} value={type} onChange={onType} />
    <FilterChips label="등록 여부" options={REG_OPTIONS} value={reg} onChange={onReg} />
    <p className={styles.meta}>{summary}</p>
  </>
);

export default SkillFilters;
