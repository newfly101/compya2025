// AdminWikiStatInfluenceScreen.jsx — ENC-A3 스탯 영향(wiki_stat_influence) 관리
// /admin/wiki/stat-influences — CRUD
import { useState } from "react";
import { createPortal } from "react-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import {
  useAdminWikiGameInfo,
  useCreateStatInfluence,
  useUpdateStatInfluence,
  useDeleteStatInfluence,
} from "@/domains/wiki/hooks/useAdminWiki.js";
import styles from "./AdminWikiPitchScreen.module.scss";

const INFLUENCE_TYPES = ["PITCH", "SKILL", "GENERAL"];
const TARGETS = ["PITCHER", "HITTER"];
const EMPTY_FORM = { target: "PITCHER", statCode: "", influenceType: "GENERAL", influenceTarget: "", weight: 1, description: "", displayOrder: 0, isActive: true };

export default function AdminWikiStatInfluenceScreen() {
  useDomainTopBar("스탯 영향 관리");

  const [activeTarget, setActiveTarget] = useState("PITCHER");

  const { data: pitcherData, isLoading: lP, isError: eP, refetch: rP } = useAdminWikiGameInfo("pitcher");
  const { data: hitterData, isLoading: lH, isError: eH, refetch: rH } = useAdminWikiGameInfo("hitter");

  const currentRefetch = activeTarget === "PITCHER" ? rP : rH;

  const createMut = useCreateStatInfluence(currentRefetch);
  const updateMut = useUpdateStatInfluence(currentRefetch);
  const deleteMut = useDeleteStatInfluence(currentRefetch);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2500); };

  const currentData = activeTarget === "PITCHER" ? pitcherData : hitterData;
  const statInfluences = currentData?.statInfluences ?? [];

  const openCreate = () => { setEditTarget(null); setForm({ ...EMPTY_FORM, target: activeTarget }); setFormOpen(true); };

  const openEdit = (si) => { setEditTarget(si); setForm({ ...si }); setFormOpen(true); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.statCode.trim() || !form.influenceTarget.trim()) {
      showToast("스탯 코드와 영향 대상은 필수입니다.");
      return;
    }
    const payload = { ...form, weight: Number(form.weight), displayOrder: Number(form.displayOrder) };
    if (editTarget) {
      updateMut.mutate({ id: editTarget.id, ...payload }, { onSuccess: () => { showToast("수정 완료"); setFormOpen(false); }, onError: (err) => showToast(err?.response?.data?.message ?? "수정 실패") });
    } else {
      createMut.mutate(payload, { onSuccess: () => { showToast("등록 완료"); setFormOpen(false); }, onError: (err) => showToast(err?.response?.data?.message ?? "등록 실패") });
    }
  };

  const handleDelete = (id) => {
    deleteMut.mutate(id, { onSuccess: () => { showToast("삭제(비활성화) 완료"); setDeleteConfirmId(null); }, onError: (err) => { showToast(err?.response?.data?.message ?? "삭제 실패"); setDeleteConfirmId(null); } });
  };

  const isLoading = lP || lH;
  const isError = eP || eH;

  // ── 상태 분기: loading ────────────────────────────────────────
  if (isLoading) return <main className={styles.page}><div className={styles.statusWrap}><p className={styles.statusText}>불러오는 중...</p></div></main>;
  // ── 상태 분기: error ──────────────────────────────────────────
  if (isError) return <main className={styles.page}><div className={styles.statusWrap}><p className={styles.statusText}>데이터를 불러올 수 없습니다.</p></div></main>;

  return (
    <main className={styles.page}>
      {/* 타겟 탭 */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {TARGETS.map((t) => (
          <button key={t} type="button"
            style={{ flex: 1, padding: "10px", background: activeTarget === t ? "var(--color-brand-tint)" : "var(--color-bg-card)", border: "1px solid", borderColor: activeTarget === t ? "var(--color-brand)" : "var(--color-border)", borderRadius: "8px", color: activeTarget === t ? "var(--color-brand)" : "var(--color-text-secondary)", cursor: "pointer", fontSize: "0.85rem", minHeight: "44px" }}
            onClick={() => setActiveTarget(t)}
          >{t}</button>
        ))}
      </div>

      <button type="button" className={styles.addBtn} onClick={openCreate}>+ 스탯 영향 추가</button>

      {/* ── 상태 분기: empty ─────────────────────────── */}
      {statInfluences.length === 0 ? (
        <div className={styles.empty}><p>등록된 스탯 영향이 없습니다.</p></div>
      ) : (
        // ── 상태 분기: normal ────────────────────────────────────
        <ul className={styles.list}>
          {statInfluences.map((si) => (
            <li key={si.id} className={styles.item}>
              <div className={styles.itemBody}>
                <div className={styles.itemTop}>
                  <span className={styles.itemName}>{si.statCode}</span>
                  <span className={styles.itemCode}>{si.influenceType}</span>
                </div>
                <span className={styles.itemType}>{si.influenceTarget} · 가중치 {si.weight}</span>
                {si.isActive === false && <span className={styles.inactiveBadge}>비활성</span>}
              </div>
              <div className={styles.itemActions}>
                <button type="button" className={styles.editBtn} onClick={() => openEdit(si)}>수정</button>
                <button type="button" className={styles.deleteBtn} onClick={() => setDeleteConfirmId(si.id)}>삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formOpen && (
        <FormModal title={editTarget ? "스탯 영향 수정" : "스탯 영향 추가"} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending}>
          <label className={styles.formLabel}>타겟
            <select className={styles.formInput} value={form.target} onChange={(e) => setForm({ ...form, target: e.target.value })}>
              {TARGETS.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className={styles.formLabel}>스탯 코드 *
            <input className={styles.formInput} value={form.statCode} onChange={(e) => setForm({ ...form, statCode: e.target.value })} placeholder="CONTROL, VELOCITY, POWER..." />
          </label>
          <label className={styles.formLabel}>영향 타입
            <select className={styles.formInput} value={form.influenceType} onChange={(e) => setForm({ ...form, influenceType: e.target.value })}>
              {INFLUENCE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className={styles.formLabel}>영향 대상 *
            <input className={styles.formInput} value={form.influenceTarget} onChange={(e) => setForm({ ...form, influenceTarget: e.target.value })} placeholder="pitch_code / skill_code / 텍스트" />
          </label>
          <label className={styles.formLabel}>가중치 (1~5)
            <input className={styles.formInput} type="number" min={1} max={5} value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </label>
          <label className={styles.formLabel}>설명
            <textarea className={styles.formTextarea} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </label>
          {editTarget && (
            <label className={styles.formCheckLabel}>
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              활성
            </label>
          )}
        </FormModal>
      )}

      {deleteConfirmId != null && (
        <ConfirmModal message="이 스탯 영향을 삭제(비활성화)하시겠습니까?" onConfirm={() => handleDelete(deleteConfirmId)} onCancel={() => setDeleteConfirmId(null)} isPending={deleteMut.isPending} />
      )}

      {toast && <div className={styles.toast}>{toast}</div>}
    </main>
  );
}

function FormModal({ title, children, onClose, onSubmit, isPending }) {
  const modalRoot = document.getElementById("modal") ?? document.body;
  return createPortal(
    <div className={styles.overlay} onClick={onClose} role="dialog" aria-modal="true">
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>{title}</h3>
          <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="닫기">✕</button>
        </div>
        <form onSubmit={onSubmit} className={styles.form}>
          {children}
          <button type="submit" className={styles.submitBtn} disabled={isPending}>{isPending ? "저장 중..." : "저장"}</button>
        </form>
      </div>
    </div>,
    modalRoot
  );
}

function ConfirmModal({ message, onConfirm, onCancel, isPending }) {
  const modalRoot = document.getElementById("modal") ?? document.body;
  return createPortal(
    <div className={styles.overlay} onClick={onCancel} role="dialog" aria-modal="true">
      <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.confirmMsg}>{message}</p>
        <div className={styles.confirmBtns}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>취소</button>
          <button type="button" className={styles.deleteBtn} onClick={onConfirm} disabled={isPending}>{isPending ? "처리 중..." : "삭제"}</button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}
