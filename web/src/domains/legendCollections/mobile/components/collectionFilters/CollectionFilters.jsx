import { FRAME_FILTERS, PREF_FILTER } from "@/domains/legendCollections/config/legendCollections.js";
import { TYPE_FILTERS } from "@/domains/legendStats/config/legendStats.js";
import FilterSection from "@/global/ui/mobile/filterSection/FilterSection.jsx";
import FilterChips from "@/domains/legendCollections/mobile/components/filterChips/FilterChips.jsx";
import styles from "./CollectionFilters.module.scss";

const TYPE_OPTIONS = TYPE_FILTERS.map((t) => ({ value: t }));
const FRAME_OPTIONS = FRAME_FILTERS.map((f) => ({ value: f }));

/**
 * 목록 위 조건 — 검색 줄(오른쪽에 actions 버튼) · 항상 펼친 칩 줄: · 구단 칩 · 전체/타자/투수 · 액자 필터 · (선택) 목표 칩 · 현황 요약.
 * prefCount 를 주면(로그인 시) 액자 칩 줄 끝에 "선호 N" 칩이 붙는다 — 4칩 단일 선택. sortLabel = 요약 줄 오른쪽 현재 정렬 기준.
 */
const CollectionFilters = ({ query, onQuery, teams, team, onTeam, type, onType, frame, onFrame, prefCount, summary, sortLabel, actions }) => {
  return (
    <>
      <FilterSection collapsible={false} search={{ value: query, onChange: onQuery }} searchActions={actions}>
        <FilterChips label="구단" options={teams} value={team} onChange={onTeam} />
        <FilterChips label="타자·투수" variant="seg" options={TYPE_OPTIONS} value={type} onChange={onType} />
        <FilterChips
          label="액자·선호 필터"
          options={prefCount === undefined ? FRAME_OPTIONS : [...FRAME_OPTIONS, { value: PREF_FILTER, label: `선호 ${prefCount}` }]} value={frame} onChange={onFrame} />
      </FilterSection>
      <div className={styles.meta}>
        <span>{`${summary.count}명 · 액자 ${summary.frame} · 재료 보유 ${summary.owned} · 삽입 ${summary.inserted}`}</span>
        {sortLabel && <span>{sortLabel}</span>}
      </div>
    </>
  );
};

export default CollectionFilters;
