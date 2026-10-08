import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import StateBox from "@/global/ui/mobile/stateBox/StateBox.jsx";
import AdminTag from "@/global/ui/admin/tag/AdminTag.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import {
  requestAdminGetUserTitles,
  requestAdminGrantTitle,
  requestAdminRevokeTitle,
} from "@/domains/gamification/store/admin/thunks.js";
import styles from "./AdminGamification.module.scss";

// 관리자 유저 상세 모달의 "칭호" 섹션. 보유 칭호 칩 + 운영자 지급(MANUAL) 칭호의 지급/회수.
export default function AdminUserTitles({ publicId, nickname }) {
  const dispatch = useDispatch();
  const { adminUserTitles: titles, detailLoading, detailError, mutateLoading } = useSelector((s) => s.gamification);
  const [pending, setPending] = useState(null); // { kind: "grant" | "revoke", title }
  const [result, setResult] = useState(null); // { ok, text }

  useEffect(() => {
    setResult(null);
    dispatch(requestAdminGetUserTitles(publicId));
  }, [dispatch, publicId]);

  const owned = titles.filter((t) => t.owned);
  const manual = titles.filter((t) => t.category === "MANUAL");

  const confirm = async () => {
    const { kind, title } = pending;
    const thunk = kind === "grant" ? requestAdminGrantTitle : requestAdminRevokeTitle;
    try {
      await dispatch(thunk({ publicId, code: title.code })).unwrap();
      setResult({ ok: true, text: `'${title.name}' ${kind === "grant" ? "지급" : "회수"}을 완료했습니다.` });
      dispatch(requestAdminGetUserTitles(publicId));
    } catch (e) {
      setResult({ ok: false, text: typeof e === "string" ? e : "처리에 실패했습니다." });
    }
    setPending(null);
  };

  const confirmMessage = pending
    ? pending.kind === "grant"
      ? `${nickname}에게 '${pending.title.name}' 지급 — 보너스 ${pending.title.bonusPoint}P 가 적립됩니다`
      : `${nickname}에게서 '${pending.title.name}' 회수 — 보너스 ${pending.title.bonusPoint}P 를 되돌립니다`
    : "";

  return (
    <section className={styles.section}>
      <span className={styles.label}>칭호</span>

      {detailLoading && <StateBox status="loading" message="불러오는 중..." />}
      {!detailLoading && detailError && (
        <StateBox status="error" message={detailError} onRetry={() => dispatch(requestAdminGetUserTitles(publicId))} />
      )}
      {!detailLoading && !detailError && owned.length === 0 && manual.length === 0 && (
        <StateBox status="empty" message="보유한 칭호가 없습니다." />
      )}
      {!detailLoading && !detailError && (owned.length > 0 || manual.length > 0) && (
        <>
          <div className={styles.chips}>
            {owned.length === 0 && <span className={styles.muted}>보유한 칭호가 없습니다.</span>}
            {owned.map((t) => (
              <AdminTag key={t.code} variant={t.equipped ? "purple" : "neutral"}>
                {t.name}{t.equipped ? " · 대표" : ""}
              </AdminTag>
            ))}
          </div>
          {manual.map((t) => (
            <div key={t.code} className={styles.manualRow}>
              <span className={styles.manualName}>
                {t.name} <span className={styles.muted}>(+{t.bonusPoint}P)</span>
              </span>
              <button
                type="button"
                className={`${styles.btn} ${t.owned ? styles.btnDanger : ""}`}
                disabled={mutateLoading}
                onClick={() => { setResult(null); setPending({ kind: t.owned ? "revoke" : "grant", title: t }); }}
              >
                {t.owned ? "회수" : "지급"}
              </button>
            </div>
          ))}
        </>
      )}

      {result && <p className={result.ok ? styles.okText : styles.errorText}>{result.text}</p>}

      <AdminConfirmDialog
        open={pending != null}
        title={pending?.kind === "revoke" ? "칭호 회수" : "칭호 지급"}
        message={confirmMessage}
        dangerous={pending?.kind === "revoke"}
        confirmLabel={mutateLoading ? "처리 중..." : "확인"}
        onConfirm={confirm}
        onCancel={() => !mutateLoading && setPending(null)}
      />
    </section>
  );
}
