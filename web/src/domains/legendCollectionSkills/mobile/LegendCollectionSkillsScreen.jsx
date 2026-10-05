import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { ALL, teamColor, teamOptions } from "@/domains/legendStats/config/legendStats.js";
import { DEFAULT_SKSORT, REG_FILTERS, SKSORT, enhanceSummary, isRegistered, matchRegFilter, nextSkillSort, skillSortMark, skillSortText, sortSkillRows } from "@/domains/legendCollectionSkills/config/legendCollectionSkills.js";
import { skillsGuide } from "@/domains/legendCollectionSkills/config/skillsGuide.js";
import LegendBadge from "@/domains/legendCollections/mobile/components/legendBadge/LegendBadge.jsx";
import "@/domains/legendCollections/mobile/legendCollections.tokens.scss";
import LegendTabs from "@/global/ui/mobile/legendTabs/LegendTabs.jsx";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import SkillFilters from "./components/skillFilters/SkillFilters.jsx";
import SkillsLoginGuide from "./components/skillsLoginGuide/SkillsLoginGuide.jsx";
import { useLegendCollectionSkills } from "./hooks/useLegendCollectionSkills";
import "./legendCollectionSkills.tokens.scss";
import styles from "./LegendCollectionSkillsScreen.module.scss";

const registeredOf = (r) => isRegistered(r.item.slots);
const STATUS_LABEL = { FRAME: "액자", OWNED: "보유중" };
// 머리 글자 · 열 클래스 이름 (정렬 키 → 표시)
const HEADS = [
  [SKSORT.NAME, "레전드", "cName"],
  [SKSORT.ENH, "강화", "cEnh"],
  [SKSORT.STATUS, "상태", "cStatus"],
  [SKSORT.REG, "등록여부", "cReg"],
];

/**
 * 내 레전드 스킬 기록 — 조회 전용 목록(강화 칩). 행을 누르면 /legend-collection-skills/:legendId/edit 에서 스킬·강화를 기록한다.
 * 로그인한 이용자 전용 본문. 비로그인은 홈으로 튕기지 않고 같은 주소에서 안내 화면을 본다 (아래 기본 export, REQ-LCSK-24).
 */
const SkillsRecords = () => {
  useDomainTopBar("레전드 재료");

  const c = useLegendCollectionSkills();
  const [team, setTeam] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [reg, setReg] = useState(REG_FILTERS[0]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(DEFAULT_SKSORT);

  const teams = useMemo(() => teamOptions(c.rows.map((r) => r.legend)), [c.rows]);

  const visible = useMemo(() => {
    const q = query.trim();
    return sortSkillRows(c.rows, sort).filter(
      (r) =>
        (!q || r.legend.name.includes(q)) &&
        (team === ALL || r.legend.team === team) &&
        (type === ALL || r.legend.type === type) &&
        matchRegFilter(registeredOf(r), reg),
    );
  }, [c.rows, query, team, type, reg, sort]);

  const registeredCount = c.rows.filter(registeredOf).length;
  const summary = `등록 ${registeredCount} · 미등록 ${c.rows.length - registeredCount}`;

  return (
    <div className={styles.screen}>
      <LegendTabs guide={skillsGuide} />
      <div className={styles.controls}>
        <SkillFilters
          query={query}
          onQuery={setQuery}
          teams={teams}
          team={team}
          onTeam={setTeam}
          type={type}
          onType={setType}
          reg={reg}
          onReg={setReg}
          summary={summary}
          sortLabel={skillSortText(sort)}
        />
        <p className={styles.basis}>
          {`보유 현황 기준 ${c.rows.length}명 · `}
          <Link to={ROUTE_PATHS.legend_collection_manage}>보유 현황에서 바꾸기 →</Link>
        </p>
      </div>

      {c.loading && !c.error && (
        <div className={styles.skeleton}>
          <Skeleton count={8} height={48} />
        </div>
      )}
      {c.error && <StateBox status="error" onRetry={c.retry} />}
      {!c.loading && !c.error && visible.length === 0 && (
        <StateBox
          status="empty"
          message={c.rows.length === 0 ? "액자나 보유중으로 표시한 레전드가 없어요. 보유 현황에서 먼저 표시해 주세요." : "조건에 맞는 레전드가 없습니다. 필터를 하나 풀어보세요."}
          compact
        />
      )}
      {!c.loading && !c.error && visible.length > 0 && (
        <div className={styles.table}>
          <div className={styles.head} role="row">
            <span className={styles.cRank}>#</span>
            {HEADS.map(([key, text, col]) => {
              const mark = skillSortMark(sort, key);
              const dir = sort.key === key ? (sort.dir < 0 ? "descending" : "ascending") : "none";
              return (
                <span key={key} className={styles[col]} role="columnheader" aria-sort={dir}>
                  <button type="button" className={styles.sortBtn} data-active={sort.key === key || undefined} onClick={() => setSort(nextSkillSort(sort, key))}>
                    {text}
                    {mark && <span className={styles.arrow}>{mark}</span>}
                  </button>
                </span>
              );
            })}
          </div>
          <ul className={styles.list}>
            {visible.map((r, i) => {
              const enh = enhanceSummary(r.item.slots, c.skillById);
              return (
                <li key={r.legend.id}>
                  <Link to={ROUTE_PATHS.legend_collection_skill_edit(r.legend.id)} className={styles.row}>
                    <span className={styles.cRank}>{i + 1}</span>
                    <span className={styles.cName}>
                      <span className={styles.dot} style={{ color: teamColor(r.legend.team) }} aria-hidden="true" />
                      <span className={styles.name}>{r.legend.name}</span>
                    </span>
                    <span className={styles.cEnh} role={enh ? "img" : undefined} aria-label={enh?.label}>
                      {enh
                        ? enh.cells.map((x, k) => (
                            <span key={k} className={styles.g} data-grade={x.key}>
                              {x.grade}
                            </span>
                          ))
                        : "-"}
                    </span>
                    <span className={styles.cStatus}>
                      <LegendBadge fill={r.item.status === "OWNED"}>{STATUS_LABEL[r.item.status]}</LegendBadge>
                    </span>
                    <span className={styles.cReg} data-on={registeredOf(r) || undefined}>
                      {registeredOf(r) ? "등록" : "미등록"}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

// 로그인 확인 전(initialized=false)에는 아무것도 그리지 않는다 — 로그인 사용자에게 안내 화면이 깜빡이지 않게
const LegendCollectionSkillsScreen = () => {
  const { initialized, isAuthenticated } = useAuthentication();
  if (!initialized) return null;
  return isAuthenticated ? <SkillsRecords /> : <SkillsLoginGuide />;
};

export default LegendCollectionSkillsScreen;
