import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminStateBox from "@/global/ui/admin/stateBox/AdminStateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import "@/global/ui/admin/admin.tokens.scss";
import {
  requestCacheSyncTargets,
  requestCacheSyncOne,
  requestCacheSyncAll,
} from "@/domains/admin/store/admin/thunks.js";
import styles from "./AdminCacheSyncTab.module.scss";

// 1초 이상이면 초 단위로 — "걸린 시간"이 눈에 보여야 뭔가 일어났다는 확신을 준다.
const formatElapsed = (ms) => {
  if (ms == null) return null;
  return ms >= 1000 ? `${(ms / 1000).toFixed(1)}초` : `${ms}ms`;
};

// 어드민 셸의 "동기화" 탭 패널. 목록은 AdminShellScreen 이 useAdminCounts() 로 이미 불러온
// 것을 그대로 쓴다(다른 탭과 동일 원칙 — 탭을 옮겨 다녀도 재요청 없음).
//
// 대상 순서는 서버가 준 그대로 쓴다 — BE 계약(GET /targets) 나열 순서가 이미 자주 쓰는
// 순서(마일리지 저격 → 선수 백과사전 → …)와 같아 클라이언트에서 다시 정렬하지 않는다.
export default function AdminCacheSyncTab() {
  const dispatch = useDispatch();
  const { targets, loading, error, syncingIds, syncingAll, results, allSyncError } = useSelector(
    (s) => s.cacheSync
  );
  const [confirmAllOpen, setConfirmAllOpen] = useState(false);

  const handleRetry = () => dispatch(requestCacheSyncTargets());
  const handleSyncOne = (id) => dispatch(requestCacheSyncOne(id));
  const handleSyncAll = () => {
    setConfirmAllOpen(false);
    dispatch(requestCacheSyncAll());
  };

  const heavyCount = targets.filter((t) => t.heavy).length;

  return (
    <div className={styles.tab}>
      <div className={styles.headRow}>
        <div className={styles.headText}>
          <b className={styles.title}>컨텐츠 동기화</b>
          <p className={styles.subtitle}>
            DB 를 직접 고쳐도 화면엔 이전 값이 남을 수 있어요. 대상을 골라 다시 읽어옵니다.
          </p>
        </div>
        <button
          type="button"
          className={styles.syncAllBtn}
          disabled={syncingAll || loading || targets.length === 0}
          onClick={() => setConfirmAllOpen(true)}
        >
          {syncingAll && <span className={styles.spinner} aria-hidden />}
          전체 동기화
        </button>
      </div>

      {allSyncError && <p className={styles.allError}>{allSyncError}</p>}

      {loading && <AdminStateBox status="loading" message="동기화 대상을 불러오는 중..." />}
      {!loading && error && <AdminStateBox status="error" message={error} onRetry={handleRetry} />}
      {!loading && !error && targets.length === 0 && (
        <AdminStateBox status="empty" message="동기화할 대상이 없습니다." />
      )}

      {!loading && !error && targets.length > 0 && (
        <ul className={styles.list}>
          {targets.map((t) => {
            // 전체 동기화 중엔 모든 줄을 동기화 중으로 취급 — 서버가 한 번의 요청으로
            // 처리해 개별 진행률을 알 수 없기 때문.
            const busy = syncingAll || syncingIds.includes(t.id);
            const result = results[t.id];

            return (
              <li key={t.id} className={styles.row}>
                <div className={styles.rowMain}>
                  <div className={styles.rowLabelLine}>
                    <span className={styles.label}>{t.label}</span>
                    {t.heavy && <span className={styles.heavyBadge}>느림 · 시간 걸림</span>}
                  </div>
                  {t.description && <p className={styles.description}>{t.description}</p>}
                  <p className={styles.lastSynced}>
                    {t.lastSyncedAt ? `마지막 동기화 ${t.lastSyncedAt}` : "아직 동기화한 적 없음"}
                  </p>
                  {!busy && result && !result.success && (
                    <p className={styles.rowError}>{result.errorMessage ?? "동기화에 실패했습니다."}</p>
                  )}
                  {!busy && result?.success && (
                    <p className={styles.rowDone}>{formatElapsed(result.elapsedMs)} 만에 끝났어요</p>
                  )}
                </div>
                <button
                  type="button"
                  className={styles.syncBtn}
                  disabled={busy}
                  onClick={() => handleSyncOne(t.id)}
                >
                  {busy && <span className={styles.spinner} aria-hidden />}
                  {busy ? "동기화 중" : "동기화"}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <AdminConfirmDialog
        open={confirmAllOpen}
        title="전체 동기화"
        message={
          heavyCount > 0
            ? `대상 ${targets.length}개를 모두 다시 읽어옵니다. ${heavyCount}개는 데이터가 많아 시간이 걸릴 수 있어요.`
            : `대상 ${targets.length}개를 모두 다시 읽어옵니다.`
        }
        confirmLabel="동기화"
        onConfirm={handleSyncAll}
        onCancel={() => setConfirmAllOpen(false)}
      />
    </div>
  );
}
