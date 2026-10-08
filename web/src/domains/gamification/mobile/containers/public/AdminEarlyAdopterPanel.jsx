import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import { requestAdminGrantEarlyAdopters } from "@/domains/gamification/store/admin/thunks.js";
import styles from "./AdminGamification.module.scss";

// 얼리어답터 일괄 지급 — 반드시 [대상 확인](dryRun) 결과를 본 뒤에만 [지급] 이 열린다.
export default function AdminEarlyAdopterPanel() {
  const dispatch = useDispatch();
  const loading = useSelector((s) => s.gamification.mutateLoading);
  const [preview, setPreview] = useState(null); // dryRun 응답
  const [done, setDone] = useState(null); // 실제 지급 응답
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const run = async (dryRun) => {
    setError(null);
    try {
      const data = await dispatch(requestAdminGrantEarlyAdopters({ dryRun })).unwrap();
      if (dryRun) { setPreview(data); setDone(null); } else { setDone(data); setPreview(null); }
    } catch (e) {
      setError(typeof e === "string" ? e : "처리에 실패했습니다.");
    }
    setConfirming(false);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.panelHead}>
        <span className={styles.panelTitle}>얼리어답터 일괄 지급</span>
        <button type="button" className={styles.btn} disabled={loading} onClick={() => run(true)}>
          {loading && !confirming ? "확인 중..." : "대상 확인"}
        </button>
      </div>

      {preview && (
        <div className={styles.resultBox}>
          <p className={styles.resultLine}>지급 대상 <strong>{preview.founderCount}명</strong></p>
          {preview.samplePublicIds?.length > 0 && (
            <p className={styles.muted}>예시: {preview.samplePublicIds.join(", ")}</p>
          )}
          <button
            type="button"
            className={styles.btnPrimary}
            disabled={loading || preview.founderCount === 0}
            onClick={() => setConfirming(true)}
          >
            {preview.founderCount === 0 ? "지급할 대상이 없습니다" : "지급"}
          </button>
        </div>
      )}

      {done && <p className={styles.okText}>{done.founderCount}명에게 얼리어답터 칭호를 지급했습니다.</p>}
      {error && <p className={styles.errorText}>{error}</p>}

      <AdminConfirmDialog
        open={confirming}
        title="얼리어답터 일괄 지급"
        message={`${preview?.founderCount ?? 0}명에게 얼리어답터 칭호와 보너스를 지급합니다. 이 작업은 되돌리기 어렵습니다.`}
        dangerous
        confirmLabel={loading ? "처리 중..." : "지급"}
        onConfirm={() => run(false)}
        onCancel={() => !loading && setConfirming(false)}
      />
    </section>
  );
}
