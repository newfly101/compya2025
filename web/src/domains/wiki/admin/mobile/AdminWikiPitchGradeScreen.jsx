// AdminWikiPitchGradeScreen.jsx — ENC-A2 구종 등급(wiki_pitch_grade) 관리
// /admin/wiki/pitch-grades — CRUD
import { useState } from "react";
import { createPortal } from "react-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import {
  useAdminWikiGameInfo,
  useCreatePitchGrade,
  useUpdatePitchGrade,
  useDeletePitchGrade,
} from "@/domains/wiki/hooks/useAdminWiki.js";
import styles from "./AdminWikiPitchScreen.module.scss";

const GRADES = ["S", "A", "B", "C", "D", "E"];
const EMPTY_FORM = { pitchCode: "", grade: "S", velocityMin: "", velocityMax: "", breakAmount: "", description: "" };

export default function AdminWikiPitchGradeScreen() {
  useDomainTopBar("구종 등급 관리");

  const { data, isLoading, isError, refetch } = useAdminWikiGameInfo("pitcher");
  const pitchGrades = data?.pitchGrades ?? [];

  const createMut = useCreatePitchGrade(refetch);
  const updateMut = useUpdatePitchGrade(refetch);
  const deleteMut = useDeletePitchGrade(refetch);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const openCreate = () => { setEditTarget(null); setForm(EMPTY_FORM); setFormOpen(true); };

  const openEdit = (pg) => {
    setEditTarget(pg);
    setForm({ pitchCode: pg.pitchCode, grade: pg.grade, velocityMin: pg.velocityMin ?? "", velocityMax: pg.velocityMax ?? "", breakAmount: pg.breakAmount ?? "", description: pg.description ?? "" });
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.pitchCode.trim() || !form.grade) {
      showToast("구종 코드와 등급은 필수입니다.");
      return;
    }
    const payload = { ...form, velocityMin: form.velocityMin !== "" ? Number(form.velocityMin) : null, velocityMax: form.velocityMax !== "" ? Number(form.velocityMax) : null, breakAmount: form.breakAmount !== "" ? Number(form.breakAmount) : null };
    if (editTarget) {
      updateMut.mutate({ id: editTarget.id, ...payload }, { onSuccess: () => { showToast("수정 완료"); setFormOpen(false); }, onError: (err) => showToast(err?.response?.data?.message ?? "수정 실패") });
    } else {
      createMut.mutate(payload, { onSuccess: () => { showToast("등록 완료"); setFormOpen(false); }, onError: (err) => showToast(err?.response?.data?.message ?? "등록 실패") });
    }
  };

  const handleDelete = (id) => {
    deleteMut.mutate(id, { onSuccess: () => { showToast("삭제 완료"); setDeleteConfirmId(null); }, onError: (err) => { showToast(err?.response?.data?.message ?? "삭제 실패"); setDeleteConfirmId(null); } });
  };

  // ── 상태 분기: loading ────────────────────────────────────────
  if (isLoading) return <main className={styles.page}><div className={styles.statusWrap}><p className={styles.statusText}>불러오는 중...</p></div></main>;
  // ── 상태 분기: error ──────────────────────────────────────────
  if (isError) return <main className={styles.page}><div className={styles.statusWrap}><p className={styles.statusText}>데이터를 불러올 수 없습니다.</p></div></main>;

  return (
    <main className={styles.page}>
      <button type="button" className={styles.addBtn} onClick={openCreate}>+ 등급 추가</button>

      {/* ── 상태 분기: empty ─────────────────────────── */}
      {pitchGrades.length === 0 ? (
        <div className={styles.empty}><p>등록된 구종 등급이 없습니다.</p></div>
      ) : (
        // ── 상태 분기: normal ────────────────────────────────────
        <ul className={styles.list}>
          {pitchGrades.map((pg) => (
            <li key={pg.id} className={styles.item}>
              <div className={styles.itemBody}>
                <div className={styles.itemTop}>
                  <span className={styles.itemName}>{pg.pitchCode}</span>
                  <span className={styles.itemCode}>등급 {pg.grade}</span>
                </div>
                <span className={styles.itemType}>{pg.velocityMin}~{pg.velocityMax}km / break {pg.breakAmount}</span>
              </div>
              <div className={styles.itemActions}>
                <button type="button" className={styles.editBtn} onClick={() => openEdit(pg)}>수정</button>
                <button type="button" className={styles.deleteBtn} onClick={() => setDeleteConfirmId(pg.id)}>삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formOpen && (
        <FormModal title={editTarget ? "등급 수정" : "등급 추가"} onClose={() => setFormOpen(false)} onSubmit={handleSubmit} isPending={createMut.isPending || updateMut.isPending}>
          <label className={styles.formLabel}>구종 코드 *
            <input className={styles.formInput} value={form.pitchCode} onChange={(e) => setForm({ ...form, pitchCode: e.target.value })} disabled={!!editTarget} placeholder="FASTBALL_4SEAM" />
          </label>
          <label className={styles.formLabel}>등급 *
            <select className={styles.formInput} value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
              {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </label>
          <label className={styles.formLabel}>최소 구속 (km)
            <input className={styles.formInput} type="number" value={form.velocityMin} onChange={(e) => setForm({ ...form, velocityMin: e.target.value })} />
          </label>
          <label className={styles.formLabel}>최대 구속 (km)
            <input className={styles.formInput} type="number" value={form.velocityMax} onChange={(e) => setForm({ ...form, velocityMax: e.target.value })} />
          </label>
          <label className={styles.formLabel}>구질 변화량
            <input className={styles.formInput} type="number" value={form.breakAmount} onChange={(e) => setForm({ ...form, breakAmount: e.target.value })} />
          </label>
          <label className={styles.formLabel}>설명
            <textarea className={styles.formTextarea} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
          </label>
        </FormModal>
      )}

      {deleteConfirmId != null && (
        <ConfirmModal message="이 구종 등급을 삭제하시겠습니까?" onConfirm={() => handleDelete(deleteConfirmId)} onCancel={() => setDeleteConfirmId(null)} isPending={deleteMut.isPending} />
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
