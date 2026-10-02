import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useBlocker, useSearchParams } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { ALL, teamColor, teamOptions } from "@/domains/legendStats/config/legendStats.js";
import { useHistoryBadge } from "@/domains/legendStats/mobile/hooks/useHistoryBadge.js";
import { useMileageBadge } from "@/domains/legendStats/mobile/hooks/useMileageBadge.js";
import {
  DEFAULT_SORT,
  displayAcquiredDate,
  EMPTY_DRAFT,
  FRAME_FILTERS,
  LEGEND,
  insertChangeCount,
  legendStatus,
  matchFrameFilter,
  ownedCount,
  nextSort,
  sortLegends,
  summarize,
} from "@/domains/legendCollections/config/legendCollections.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import GoalPanel from "./components/goalPanel/GoalPanel.jsx";
import CollectionFilters from "./components/collectionFilters/CollectionFilters.jsx";
import LegendTable from "./components/legendTable/LegendTable.jsx";
import ConfirmModal from "@/global/ui/confirmModal/ConfirmModal.jsx";
import PreferenceModal from "./components/modals/PreferenceModal.jsx";
import SaveErrorModal from "./components/modals/SaveErrorModal.jsx";
import { useLegendCollections } from "./hooks/useLegendCollections";
import "./legendCollections.tokens.scss";
import styles from "./LegendCollectionsScreen.module.scss";

/**
 * 레전드 재료 보유 현황 — "내 목표" · "전체" 두 탭 (Figma 01·02·04).
 * 편집 상태(초안·저장 흐름)는 훅 하나가 두 탭에 공통으로 갖는다. 탭을 바꿔도 초안이 유지되고,
 * 내 목표 탭의 편집은 전체 탭과 같은 목록·펼침 UI 를 쓰되 대상만 선호 레전드로 좁힌다.
 */
const LegendCollectionsScreen = () => {
  useDomainTopBar("레전드 재료 보유 현황");

  const c = useLegendCollections();
  const { legends, server, draft, editing, dirty, isAuthenticated } = c;
  const historyCards = useHistoryBadge();
  const mileageBadge = useMileageBadge();

  const [params, setParams] = useSearchParams();
  const prefs = server.preferences;
  const tab = params.get("tab") ?? (isAuthenticated && prefs.length > 0 ? "mine" : "all");

  const [team, setTeam] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [frameFilter, setFrameFilter] = useState(FRAME_FILTERS[0]);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [modal, setModal] = useState(null); // login | insert | reset | prefs | error
  const [resetTarget, setResetTarget] = useState(null);
  const [leaveAfterSave, setLeaveAfterSave] = useState(false);
  const [prefsPrompted, setPrefsPrompted] = useState(false);
  const [sortState, setSortState] = useState(null); // null = 사용자가 머리를 아직 안 눌렀다 → 기본 (전체 탭: 보유 많은 순 · 내 목표: 선호 순위). 탭을 옮겨도 유지, 새로 진입하면 초기화

  const byId = useMemo(() => new Map(legends.map((l) => [l.id, l])), [legends]);
  const prefLegends = useMemo(() => prefs.map((id) => byId.get(id)).filter(Boolean), [prefs, byId]);
  const mineEditing = tab === "mine" && editing;
  // 편집 목록의 대상 — 전체 탭은 74명, 내 목표 탭은 선호 레전드만
  const pool = mineEditing ? prefLegends : legends;

  const teams = useMemo(
    () => teamOptions(pool).map((t) => ({ value: t, dot: t === ALL ? undefined : teamColor(t) })),
    [pool],
  );
  const summary = useMemo(() => summarize(pool, server, draft), [pool, server, draft]);
  const statusOf = useCallback((l) => legendStatus(l.id, server, draft), [server, draft]);

  // 기본값 — 전체 탭은 모은 칸 많은 순, 내 목표 편집은 선호 순위 그대로(표시 없음)
  const sort = sortState ?? (mineEditing ? null : DEFAULT_SORT);

  const rows = useMemo(() => {
    const q = query.trim();
    const filtered = pool.filter(
      (l) =>
        (!q || l.name.includes(q)) &&
        (team === ALL || l.team === team) &&
        (type === ALL || l.type === type) &&
        matchFrameFilter(statusOf(l), frameFilter),
    );
    // 편집 중에는 저장된 값으로 정렬한다 — 칸을 누를 때마다 펼친 행이 자리를 옮기지 않도록
    if (!sort) return filtered;
    const basis = editing ? EMPTY_DRAFT : draft;
    return sortLegends(
      filtered,
      sort,
      (l) => ownedCount(l.id, server, basis),
      (l) => legendStatus(l.id, server, basis),
      (l) => displayAcquiredDate(l.id, server),
    );
  }, [pool, query, team, type, frameFilter, statusOf, sort, editing, server, draft]);


  // 진행률에 재료 id 가 필요해 선호 레전드(최대 10)의 재료를 미리 받는다 — 한 번 받으면 재요청 없음
  const { loadSlots } = c;
  useEffect(() => {
    prefs.forEach((id) => loadSlots(id));
  }, [prefs, loadSlots]);

  // 새로고침·탭 닫기 — 브라우저 기본 확인창 (문구 변경 불가, REQ-LCOL-13)
  useEffect(() => {
    if (!editing || dirty === 0) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [editing, dirty]);

  // 사이트 안 이동 — 자체 팝업. 같은 화면 안 탭 전환(쿼리만 바뀜)은 막지 않는다
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      editing && dirty > 0 && currentLocation.pathname !== nextLocation.pathname,
  );

  const selectTab = (next) => {
    setParams({ tab: next }, { replace: true });
    setOpenId(null);
  };

  const toggleSort = (key) => {
    setSortState(nextSort(sort, key));
    setOpenId(null);
  };

  const toggleRow = (id) => {
    const next = openId === id ? null : id;
    if (next) c.loadSlots(next);
    setOpenId(next);
  };

  const resetFilter = (fn) => (v) => {
    fn(v);
    setOpenId(null);
  };

  const requestEdit = () => {
    if (!isAuthenticated) return setModal("login");
    setOpenId(null);
    return c.startEdit();
  };

  const requestPrefs = () => setModal(isAuthenticated ? "prefs" : "login");

  const doSave = async (leave = false) => {
    setModal(null);
    const wasEmptyPrefs = prefs.length === 0;
    const error = await c.save();
    setLeaveAfterSave(false);
    if (error) {
      if (leave && blocker.state === "blocked") blocker.reset();
      setModal("error");
      return;
    }
    if (leave && blocker.state === "blocked") {
      blocker.proceed();
      return;
    }
    // 첫 저장 직후 1회 선호 고르기 권유 (REQ-LCOL-16)
    if (wasEmptyPrefs && !prefsPrompted) {
      setPrefsPrompted(true);
      setModal("prefs");
    }
  };

  const requestSave = (leave = false) => {
    setLeaveAfterSave(leave);
    if (insertChangeCount(draft) > 0) setModal("insert");
    else doSave(leave);
  };

  const cancelInsert = () => {
    setModal(null);
    if (leaveAfterSave && blocker.state === "blocked") blocker.reset();
    setLeaveAfterSave(false);
  };

  const askReset = (legend) => {
    setResetTarget(legend);
    setModal("reset");
  };

  const closePrefs = (saved) => {
    setModal(null);
    if (saved) selectTab("mine");
  };

  const listLoading = !c.stats.loaded && c.stats.loading;
  const listError = !c.stats.loaded && !c.stats.loading && c.stats.error;
  const err = c.saveError;
  const leaveOpen = blocker.state === "blocked" && modal !== "insert" && modal !== "error";

  const title = editing ? "재료 편집 중" : tab === "mine" ? "내 레전드 목표" : "내 재료 보유 현황";

  return (
    <div className={styles.screen}>
      <div className={styles.controls}>
        <div className={styles.intro}>
          <div className={styles.introText}>
            <Link to={ROUTE_PATHS.legend_stats} className={styles.back}>
              ← 레전드 재료 검색
            </Link>
            <h1 className={styles.title}>{title}</h1>
            {isAuthenticated && !editing && (
              <Link to={ROUTE_PATHS.legend_collection_skills} className={styles.back}>
                내 레전드 스킬 기록 →
              </Link>
            )}
          </div>
          <div className={styles.introActions}>
            {editing ? (
              <>
                <span className={styles.dirty}>{`저장 안 한 변경 ${dirty}`}</span>
                <button type="button" className={styles.ghost} disabled={c.saving} onClick={c.cancelEdit}>
                  취소
                </button>
                <button type="button" className={styles.primary} disabled={c.saving || dirty === 0} onClick={() => requestSave()}>
                  {c.saving ? "저장 중…" : `저장 (${dirty})`}
                </button>
              </>
            ) : (
              <>
                {tab === "mine" && (
                  <button type="button" className={styles.ghost} onClick={requestPrefs}>
                    선호 편집
                  </button>
                )}
                <button type="button" className={styles.primary} onClick={requestEdit}>
                  편집
                </button>
              </>
            )}
          </div>
        </div>

        {editing && <p className={styles.tempNote}>편집 중인 값은 이 탭에만 잠시 보관돼요. 탭을 닫으면 사라져요.</p>}
        {!isAuthenticated && <p className={styles.tempNote}>로그인하면 내 재료를 저장할 수 있어요.</p>}

        <div className={styles.tabs} role="tablist" aria-label="보기">
          <button type="button" role="tab" aria-selected={tab === "all"} onClick={() => selectTab("all")}>
            {`전체 ${legends.length}`}
          </button>
          <button type="button" role="tab" aria-selected={tab === "mine"} onClick={() => selectTab("mine")}>
            {`내 목표 ${prefs.length}`}
          </button>
        </div>

        {isAuthenticated && c.meError && !c.me.loaded && (
          <StateBox status="error" message="내 기록을 불러오지 못했습니다." onRetry={c.retryMe} compact />
        )}

        {(tab === "all" || editing) && (
          <>
            <CollectionFilters
              query={query}
              onQuery={resetFilter(setQuery)}
              teams={teams}
              team={team}
              onTeam={resetFilter(setTeam)}
              type={type}
              onType={resetFilter(setType)}
              frame={frameFilter}
              onFrame={resetFilter(setFrameFilter)}
              summary={summary}
            />
          </>
        )}
      </div>

      {tab === "mine" && !editing && (
        <GoalPanel
          c={c}
          prefLegends={prefLegends}
          legendsById={byId}
          historyCards={historyCards}
          mileageBadge={mileageBadge}
          onPickPrefs={requestPrefs}
        />
      )}

      {(tab === "all" || editing) && (
        <>
          {listLoading && (
            <div className={styles.skeleton}>
              <Skeleton count={8} height={48} />
            </div>
          )}
          {listError && <StateBox status="error" onRetry={c.stats.retry} />}
          {c.stats.loaded && rows.length > 0 && (
            <LegendTable
              rows={rows}
              rankOf={mineEditing && !sort ? (l) => prefs.indexOf(l.id) + 1 : undefined}
              sort={sort}
              onSort={toggleSort}
              openId={openId}
              onToggle={toggleRow}
              c={c}
              historyCards={historyCards}
              mileageBadge={mileageBadge}
              onReset={askReset}
            />
          )}
          {c.stats.loaded && rows.length === 0 && (
            <StateBox
              status="empty"
              message={
                mineEditing && prefs.length === 0
                  ? "선호 레전드가 없어요. 전체 탭에서 편집하거나 선호 레전드를 먼저 골라 주세요."
                  : "조건에 맞는 레전드가 없습니다. 필터를 하나 풀어보세요."
              }
              compact
            />
          )}
        </>
      )}

      <ConfirmModal
        open={modal === "login"}
        title="로그인하면 편집할 수 있어요"
        message="보유·삽입 기록은 로그인한 계정에 저장돼요."
        cancelText="닫기"
        confirmText="로그인"
        onConfirm={() => {
          setModal(null);
          c.login();
        }}
        onCancel={() => setModal(null)}
      />
      <ConfirmModal
        open={modal === "insert"}
        title={`삽입 ${insertChangeCount(draft)}건을 저장할까요?`}
        message="삽입은 저장 후 되돌릴 수 없어요. 실수했다면 그 레전드의 재료 전체 초기화만 가능해요."
        confirmText="저장"
        tone="danger"
        onConfirm={() => doSave(leaveAfterSave)}
        onCancel={cancelInsert}
      />
      <ConfirmModal
        open={modal === "reset"}
        title={`${resetTarget?.name ?? ""} 재료를 모두 초기화할까요?`}
        message="재료 8칸이 모두 미보유로 바뀌어요. 액자·레전드 보유 표시는 그대로예요. 저장해야 반영돼요."
        confirmText="초기화"
        tone="danger"
        onConfirm={() => {
          c.resetLegend(resetTarget.id);
          setModal(null);
        }}
        onCancel={() => setModal(null)}
      />
      <SaveErrorModal
        open={modal === "error"}
        error={err}
        onResolve={(adopt) => {
          c.resolveConflict(adopt);
          setModal(null);
        }}
        onLogin={() => {
          setModal(null);
          c.login();
        }}
        onClose={() => setModal(null)}
      />
      <ConfirmModal
        open={leaveOpen}
        title={`저장하지 않은 변경 ${dirty}건이 있어요`}
        message="지금 나가면 변경 내용이 사라져요."
        cancelText="나가기"
        confirmText="저장하고 나가기"
        onConfirm={() => requestSave(true)}
        onCancel={() => {
          c.cancelEdit();
          blocker.proceed();
        }}
        onDismiss={() => blocker.reset()}
      />
      {modal === "prefs" && (
        <PreferenceModal
          legends={legends}
          server={server}
          countOf={(id) => ownedCount(id, server, draft)}
          onSave={c.savePreferences}
          onClose={closePrefs}
        />
      )}
    </div>
  );
};

export default LegendCollectionsScreen;
