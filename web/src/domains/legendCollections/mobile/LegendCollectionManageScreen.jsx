import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBlocker, useNavigate } from "react-router-dom";
import { ROUTE_PATHS } from "@/app/router/config/routePath.js";
import { useAuthentication } from "@/domains/authentication/hooks/useAuthentication.js";
import { ALL, teamColor, teamOptions } from "@/domains/legendStats/config/legendStats.js";
import { useHistoryBadge } from "@/domains/legendStats/mobile/hooks/useHistoryBadge.js";
import { useMileageBadge } from "@/domains/legendStats/mobile/hooks/useMileageBadge.js";
import {
  DEFAULT_SORT,
  displayAcquiredDate,
  EMPTY_DRAFT,
  FRAME_FILTERS,
  insertChangeCount,
  legendStatus,
  matchFrameFilter,
  ownedCount,
  nextSort,
  sortLegends,
  sortText,
  summarize,
} from "@/domains/legendCollections/config/legendCollections.js";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import LegendTabs from "@/global/ui/mobile/legendTabs/LegendTabs.jsx";
import { collectionsGuide } from "@/domains/legendCollections/config/collectionsGuide.js";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import Skeleton from "@/global/ui/mobile/stateBox/Skeleton.jsx";
import ConfirmModal from "@/global/ui/confirmModal/ConfirmModal.jsx";
import CollectionFilters from "./components/collectionFilters/CollectionFilters.jsx";
import CollectionsLoginGuide from "./components/collectionsLoginGuide/CollectionsLoginGuide.jsx";
import LegendTable from "./components/legendTable/LegendTable.jsx";
import SaveErrorModal from "./components/modals/SaveErrorModal.jsx";
import { useLegendCollections } from "./hooks/useLegendCollections";
import "./legendCollections.tokens.scss";
import styles from "./LegendCollectionsScreen.module.scss";

/**
 * 내 기록 관리 — 보유·액자·재료 삽입·획득일을 고치는 편집 전용 화면. 저장하면 조회 화면으로 돌아간다.
 * 편집 값은 이 탭에만 잠시 보관한다(초안). 저장 안 한 변경이 있으면 이탈 시 확인창을 띄운다.
 */
const Manage = () => {
  const navigate = useNavigate();
  const c = useLegendCollections({ edit: true });
  const { legends, server, draft, dirty } = c;
  const historyCards = useHistoryBadge();
  const mileageBadge = useMileageBadge();

  const [team, setTeam] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [frameFilter, setFrameFilter] = useState(FRAME_FILTERS[0]);
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState(null);
  const [modal, setModal] = useState(null); // insert | reset | error | prefs
  const [resetTarget, setResetTarget] = useState(null);
  const [leaveAfterSave, setLeaveAfterSave] = useState(false);
  const [sortState, setSortState] = useState(null);
  const leavingRef = useRef(false); // 저장 직후 이동은 이탈 확인을 거치지 않는다

  const teams = useMemo(
    () => teamOptions(legends).map((t) => ({ value: t, dot: t === ALL ? undefined : teamColor(t) })),
    [legends],
  );
  const summary = useMemo(() => summarize(legends, server, draft), [legends, server, draft]);
  const statusOf = useCallback((l) => legendStatus(l.id, server, draft), [server, draft]);
  const sort = sortState ?? DEFAULT_SORT;

  const rows = useMemo(() => {
    const q = query.trim();
    const filtered = legends.filter(
      (l) =>
        (!q || l.name.includes(q)) &&
        (team === ALL || l.team === team) &&
        (type === ALL || l.type === type) &&
        matchFrameFilter(statusOf(l), frameFilter),
    );
    // 편집 중에는 저장된 값으로 정렬한다 — 칸을 누를 때마다 펼친 행이 자리를 옮기지 않도록
    return sortLegends(
      filtered,
      sort,
      (l) => ownedCount(l.id, server, EMPTY_DRAFT),
      (l) => legendStatus(l.id, server, EMPTY_DRAFT),
      (l) => displayAcquiredDate(l.id, server),
      (l) => server.preferences.indexOf(l.id) + 1,
    );
  }, [legends, query, team, type, frameFilter, statusOf, sort, server]);

  // 새로고침·탭 닫기 — 브라우저 기본 확인창 (문구 변경 불가, REQ-LCOL-13)
  useEffect(() => {
    if (dirty === 0) return undefined;
    const handler = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // 사이트 안 이동 — 자체 팝업 (REQ-LCOL-13)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !leavingRef.current && dirty > 0 && currentLocation.pathname !== nextLocation.pathname,
  );

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

  const goTo = (path) => {
    leavingRef.current = true;
    navigate(path);
  };

  const doSave = async (leave = false) => {
    setModal(null);
    const wasEmptyPrefs = server.preferences.length === 0;
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
    if (wasEmptyPrefs) setModal("prefs");
    else goTo(ROUTE_PATHS.legend_collections);
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

  const listLoading = !c.stats.loaded && c.stats.loading;
  const listError = !c.stats.loaded && !c.stats.loading && c.stats.error;
  const leaveOpen = blocker.state === "blocked" && modal !== "insert" && modal !== "error";

  return (
    <div className={styles.screen}>
      <LegendTabs guide={collectionsGuide} />
      <div className={styles.controls}>
        {c.meError && !c.me.loaded && (
          <StateBox status="error" message="내 기록을 불러오지 못했습니다." onRetry={c.retryMe} compact />
        )}

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
          sortLabel={sortText(sort)}
          actions={
            <>
              <button type="button" className={styles.action} disabled={c.saving} onClick={() => navigate(ROUTE_PATHS.legend_collections)}>
                취소
              </button>
              <button type="button" className={`${styles.action} ${styles.actionPrimary}`} disabled={c.saving || dirty === 0} onClick={() => requestSave()}>
                {c.saving ? "저장 중…" : `저장 (${dirty})`}
              </button>
            </>
          }
        />
      </div>

      {listLoading && (
        <div className={styles.skeleton}>
          <Skeleton count={8} height={48} />
        </div>
      )}
      {listError && <StateBox status="error" onRetry={c.stats.retry} />}
      {c.stats.loaded && rows.length > 0 && (
        <LegendTable
          rows={rows}
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
        <StateBox status="empty" message="조건에 맞는 레전드가 없습니다. 필터를 하나 풀어보세요." compact />
      )}

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
        error={c.saveError}
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
      <ConfirmModal
        open={modal === "prefs"}
        title="선호 레전드를 골라 볼까요?"
        message="선호 레전드를 고르면 보유 현황에서 '내 선호'로 모아 볼 수 있어요."
        cancelText="나중에"
        confirmText="고르러 가기"
        onConfirm={() => goTo(`${ROUTE_PATHS.legend_collections}?prefs=1`)}
        onCancel={() => goTo(ROUTE_PATHS.legend_collections)}
      />
    </div>
  );
};

// 로그인 확인 전(initialized=false)에는 아무것도 그리지 않는다 — 로그인 사용자에게 안내 화면이 깜빡이지 않게
const LegendCollectionManageScreen = () => {
  useDomainTopBar("레전드 재료");
  const { initialized, isAuthenticated } = useAuthentication();
  if (!initialized) return null;
  return isAuthenticated ? (
    <Manage />
  ) : (
    <CollectionsLoginGuide
      title="내 기록 관리는 로그인하면 쓸 수 있어요"
      text="내가 가진 레전드·액자와 모은 재료를 기록하는 화면이에요. 기록은 로그인한 계정에 저장돼요."
    />
  );
};

export default LegendCollectionManageScreen;
