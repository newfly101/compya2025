import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import { ALL, teamColor, teamOptions } from "@/domains/legendStats/config/legendStats.js";
import { REG_FILTERS, enhanceSummary, isRegistered, matchRegFilter, sortByOwned } from "@/domains/legendCollectionSkills/config/legendCollectionSkills.js";
import { skillsGuide } from "@/domains/legendCollectionSkills/config/skillsGuide.js";
import LegendBadge from "@/domains/legendCollections/mobile/components/legendBadge/LegendBadge.jsx";
import "@/domains/legendCollections/mobile/legendCollections.tokens.scss";
import ConfirmModal from "@/global/ui/confirmModal/ConfirmModal.jsx";
import GuideAccordion from "@/global/ui/guideAccordion/GuideAccordion.jsx";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import SkillEditor from "./components/skillEditor/SkillEditor.jsx";
import SkillFilters from "./components/skillFilters/SkillFilters.jsx";
import { useLegendCollectionSkills } from "./hooks/useLegendCollectionSkills";
import "./legendCollectionSkills.tokens.scss";
import styles from "./LegendCollectionSkillsScreen.module.scss";

const registeredOf = (r) => isRegistered(r.item.slots);
const STATUS_LABEL = { FRAME: "액자", OWNED: "보유중" };

/**
 * 레전드 스킬 기록 — 보유중·액자 레전드의 스킬 3개와 등급을 저장하고 강화 버튼으로 현재 등급을 기록한다.
 * 비로그인은 라우트 가드(AuthGuard)가 홈으로 돌려보내 이 화면이 보이지 않는다.
 */
const LegendCollectionSkillsScreen = () => {
  useDomainTopBar("레전드 스킬 기록");

  const c = useLegendCollectionSkills();
  const [team, setTeam] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [reg, setReg] = useState(REG_FILTERS[0]);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const dirtyRef = useRef(0); // 열린 편집기의 저장 안 된 강화 건수 (편집기가 갱신)
  const [discard, setDiscard] = useState(null); // 버릴지 묻는 중이면 { n, run }

  const teams = useMemo(() => teamOptions(c.rows.map((r) => r.legend)), [c.rows]);

  const visible = useMemo(() => {
    const q = query.trim();
    return sortByOwned(c.rows).filter(
      (r) =>
        (!q || r.legend.name.includes(q)) &&
        (team === ALL || r.legend.team === team) &&
        (type === ALL || r.legend.type === type) &&
        matchRegFilter(registeredOf(r), reg),
    );
  }, [c.rows, query, team, type, reg]);

  const registeredCount = c.rows.filter(registeredOf).length;
  const summary = `액자·보유중 ${c.rows.length}명 · 등록 ${registeredCount} · 미등록 ${c.rows.length - registeredCount}`;

  // 저장 안 된 강화가 있으면 버릴지 묻는다
  const guard = (run) => (dirtyRef.current ? setDiscard({ n: dirtyRef.current, run }) : run());

  const filtered = (fn) => (v) =>
    guard(() => {
      fn(v);
      setOpenId(null);
    });

  return (
    <div className={styles.screen}>
      <GuideAccordion guide={skillsGuide} />
      <div className={styles.controls}>
        <div className={styles.intro}>
          <Link to={ROUTE_PATHS.legend_collections} className={styles.back}>
            ← 레전드 재료 보유 현황
          </Link>
          <h1 className={styles.title}>내 레전드 스킬 기록</h1>
        </div>
        <SkillFilters
          query={query}
          onQuery={filtered(setQuery)}
          teams={teams}
          team={team}
          onTeam={filtered(setTeam)}
          type={type}
          onType={filtered(setType)}
          reg={reg}
          onReg={filtered(setReg)}
          summary={summary}
        />
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
          message={c.rows.length === 0 ? "액자나 보유중으로 표시한 레전드가 없어요. 재료 보유 현황에서 먼저 표시해 주세요." : "조건에 맞는 레전드가 없습니다. 필터를 하나 풀어보세요."}
          compact
        />
      )}
      {!c.loading && !c.error && visible.length > 0 && (
        <div className={styles.table}>
          <div className={styles.head} role="row">
            <span className={styles.cRank}>#</span>
            <span className={styles.cName}>레전드</span>
            <span className={styles.cEnh}>강화</span>
            <span className={styles.cStatus}>상태</span>
            <span className={styles.cReg}>등록여부</span>
          </div>
          <ul className={styles.list}>
            {visible.map((r, i) => {
              const open = openId === r.legend.id;
              const enh = enhanceSummary(r.item.slots, c.skillById);
              return (
                <li key={r.legend.id}>
                  <button
                    type="button"
                    className={styles.row}
                    data-open={open || undefined}
                    aria-expanded={open}
                    onClick={() => guard(() => setOpenId(open ? null : r.legend.id))}
                  >
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
                  </button>
                  {open && (
                    <SkillEditor key={r.item.rev} row={r} c={c} dirtyRef={dirtyRef} />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <ConfirmModal
        open={!!discard}
        title="저장하지 않은 강화"
        message={`저장하지 않은 강화 ${discard?.n}건이 사라져요.`}
        confirmText="버리기"
        tone="danger"
        onCancel={() => setDiscard(null)}
        onConfirm={() => {
          const { run } = discard;
          setDiscard(null);
          run();
        }}
      />
    </div>
  );
};

export default LegendCollectionSkillsScreen;
