import { FRAME_FILTERS } from "@/domains/legendCollections/config/legendCollections.js";
import { ALL, TYPE_FILTERS } from "@/domains/legendStats/config/legendStats.js";
import FilterSection from "@/global/ui/mobile/filterSection/FilterSection.jsx";
import FilterChips from "@/domains/legendCollections/mobile/components/filterChips/FilterChips.jsx";
import styles from "./CollectionFilters.module.scss";

const TYPE_OPTIONS = TYPE_FILTERS.map((t) => ({ value: t }));
const FRAME_OPTIONS = FRAME_FILTERS.map((f) => ({ value: f }));

/** 목록 위 조건 (Figma 01 Controls) — 검색 · 구단 칩 · 전체/타자/투수 · 액자 필터 · 현황 요약 */
const CollectionFilters = ({ query, onQuery, teams, team, onTeam, type, onType, frame, onFrame, summary }) => {
  const applied = [team, type, frame].filter((v) => v !== ALL);
  return (
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
    <FilterSection storageKey="legendCollections.filterOpen" count={applied.length} summary={applied.join(" · ")}>
      <FilterChips label="구단" options={teams} value={team} onChange={onTeam} />
      <FilterChips label="타자·투수" variant="seg" options={TYPE_OPTIONS} value={type} onChange={onType} />
      <FilterChips label="액자 필터" options={FRAME_OPTIONS} value={frame} onChange={onFrame} />
    </FilterSection>
    <div className={styles.meta}>
      <span>{`${summary.count}명 · 액자 ${summary.frame} · 재료 보유 ${summary.owned} · 삽입 ${summary.inserted}`}</span>
    </div>
  </>
  );
};

export default CollectionFilters;
