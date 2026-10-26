import { useMemo, useState } from "react";
import { ALL, TYPE_FILTERS, posOptions, teamColor, teamOptions, visibleRows } from "@/domains/legendStats/config/legendStats.js";
import FilterSection from "@/global/ui/mobile/filterSection/FilterSection.jsx";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
// 같은 칩 부품을 skillFilters 도 이미 다른 도메인에서 가져다 쓴다 — global/ui 로 옮길 때 한 번에 (import 3곳 + 여기)
import FilterChips from "@/domains/legendCollections/mobile/components/filterChips/FilterChips.jsx";
import styles from "./PlayerPicker.module.scss";

const TYPE_OPTIONS = TYPE_FILTERS.map((t) => ({ value: t }));

/**
 * 레전드 선수 고르기 — 검색 · 구단 · 타자/투수 · 포지션 칩 + 가로 스크롤 선수 카드열 (평점 높은순).
 * 필터 상태는 이 안에서만 쓴다. legends: 화면 모델 배열, selectedId/onSelect: 고른 선수 (같은 카드를 다시 누르면 null = 선택 해제).
 */
const PlayerPicker = ({ legends, selectedId, onSelect }) => {
  const [query, setQuery] = useState("");
  const [team, setTeam] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [pos, setPos] = useState(ALL);

  const teams = useMemo(() => teamOptions(legends), [legends]);
  const poses = useMemo(() => posOptions(legends, type), [legends, type]);
  const rows = useMemo(() => visibleRows(legends, { team, type, pos, query, sort: "score", dir: -1 }), [legends, team, type, pos, query]);
  const unrated = rows.filter((l) => l.score == null).length;

  const changeType = (next) => {
    setType(next);
    setPos(ALL); // 타자/투수 포지션 체계가 달라 바꾸면 초기화
  };

  return (
    <section className={styles.picker}>
      <div className={styles.filters}>
        <FilterSection collapsible={false} search={{ value: query, onChange: setQuery }}>
          <FilterChips label="구단" options={teams.map((t) => ({ value: t, dot: t === ALL ? undefined : teamColor(t) }))} value={team} onChange={setTeam} />
          <FilterChips label="타자·투수" variant="seg" options={TYPE_OPTIONS} value={type} onChange={changeType} />
          {poses.length > 0 && <FilterChips label="포지션" options={poses.map((p) => ({ value: p }))} value={pos} onChange={setPos} />}
        </FilterSection>
      </div>
      <div className={styles.meta}>
        <span>{`${rows.length}명${unrated > 0 ? ` · 평점 미정 ${unrated}` : ""}`}</span>
        <span>평점 높은순</span>
      </div>
      {rows.length === 0 ? (
        <StateBox status="empty" message="조건에 맞는 레전드가 없습니다. 필터를 하나 풀어보세요." compact />
      ) : (
        <ul className={styles.list}>
          {rows.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                className={styles.card}
                style={{ backgroundImage: `url(/cards/${l.type === "투수" ? "pitcher" : "hitter"}_legend.webp)` }}
                aria-pressed={l.id === selectedId}
                data-dim={(selectedId != null && l.id !== selectedId) || undefined}
                aria-label={`${l.team} ${l.name} ${l.pos.join(" ")}`}
                onClick={() => onSelect(l.id === selectedId ? null : l.id)}
              >
                <span className={styles.dot} style={{ color: teamColor(l.team) }} aria-hidden="true" />
                <span className={styles.name}>{l.name}</span>
                <span className={styles.pos}>{l.pos[0]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default PlayerPicker;
