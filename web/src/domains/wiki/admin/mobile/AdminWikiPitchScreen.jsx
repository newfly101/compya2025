// AdminWikiPitchScreen.jsx — ENC-A1 마구(wiki_pitch) 관리
// /admin/wiki/pitches — CRUD
import { useState } from "react";
import { createPortal } from "react-dom";
import { useDomainTopBar } from "@/app/wrapper/mobile/hooks/useDomainTopBar";
import {
  useAdminWikiGameInfo,
  useCreatePitch,
  useUpdatePitch,
  useDeletePitch,
} from "@/domains/wiki/hooks/useAdminWiki.js";
import styles from "./AdminWikiPitchScreen.module.scss";

const PITCH_TYPES = ["FASTBALL", "BREAKING", "OFFSPEED"];
const EMPTY_FORM = { code: "", name: "", pitchType: "FASTBALL", description: "", displayOrder: 0, isActive: true };

export default function AdminWikiPitchScreen() {
  useDomainTopBar("마구 관리");

  const { data, isLoading, isError, refetch } = useAdminWikiGameInfo("pitcher");
  const pitches = data?.pitches ?? [];

  const createMut = useCreatePitch(refetch);
  const updateMut = useUpdatePitch(refetch);
  const deleteMut = useDeletePitch(refetch);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (pitch) => {
    setEditTarget(pitch);
    setForm({ code: pitch.code, name: pitch.name, pitchType: pitch.pitchType, description: pitch.description ?? "", displayOrder: pitch.displayOrder ?? 0, isActive: pitch.isActive ?? true });
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      showToast("코드와 이름은 필수입니다.");
      return;
    }
    if (editTarget) {
      updateMut.mutate(
        { id: editTarget.id, ...form },
        { onSuccess: () => { showToast("수정 완료"); setFormOpen(false); },
          onError: (err) => showToast(err?.response?.data?.message ?? "수정 실패") }
      );
    } else {
      createMut.mutate(form, {
        onSuccess: () => { showToast("등록 완료"); setFormOpen(false); },
        onError: (err) => showToast(err?.response?.data?.message ?? "등록 실패"),
      });
    }
  };

  const handleDelete = (id) => {
    deleteMut.mutate(id, {
      onSuccess: () => { showToast("삭제(비활성화) 완료"); setDeleteConfirmId(null); },
      onError: (err) => { showToast(err?.response?.data?.message ?? "삭제 실패"); setDeleteConfirmId(null); },
    });
  };

  // ── 상태 분기: loading ────────────────────────────────────────
  if (isLoading) {
    return (
      <main className={styles.page}>
        <div className={styles.statusWrap}><p className={styles.statusText}>불러오는 중...</p></div>
      </main>
    );
  }
  // ── 상태 분기: error ──────────────────────────────────────────
  if (isError) {
    return (
      <main className={styles.page}>
        <div className={styles.statusWrap}><p className={styles.statusText}>데이터를 불러올 수 없습니다.</p></div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <button type="button" className={styles.addBtn} onClick={openCreate}>+ 마구 추가</button>

      {/* ── 상태 분기: empty ─────────────────────────── */}
      {pitches.length === 0 ? (
        <div className={styles.empty}><p>등록된 마구가 없습니다.</p></div>
      ) : (
        // ── 상태 분기: normal ────────────────────────────────────
        <ul className={styles.list}>
          {pitches.map((pitch) => (
            <li key={pitch.id ?? pitch.code} className={styles.item}>
              <div className={styles.itemBody}>
                <div className={styles.itemTop}>
                  <span className={styles.itemName}>{pitch.name}</span>
                  <span className={styles.itemCode}>{pitch.code}</span>
                </div>
                <span className={styles.itemType}>{pitch.pitchType}</span>
                {!pitch.isActive && <span className={styles.inactiveBadge}>비활성</span>}
              </div>
              <div className={styles.itemActions}>
                <button type="button" className={styles.editBtn} onClick={() => openEdit(pitch)}>수정</button>
                <button type="button" className={styles.deleteBtn} onClick={() => setDeleteConfirmId(pitch.id ?? pitch.code)}>삭제</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {formOpen && (
        <FormModal
          title={editTarget ? "마구 수정" : "마구 추가"}
          onClose={() => setFormOpen(false)}
          onSubmit={handleSubmit}
          isPending={createMut.isPending || updateMut.isPending}
        >
          <label className={styles.formLabel}>코드 *
            <input className={styles.formInput} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} disabled={!!editTarget} placeholder="FASTBALL_4SEAM" />
          </label>
          <label className={styles.formLabel}>이름 *
            <input className={styles.formInput} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="포심패스트볼" />
          </label>
          <label className={styles.formLabel}>구종 타입
            <select className={styles.formInput} value={form.pitchType} onChange={(e) => setForm({ ...form, pitchType: e.target.value })}>
              {PITCH_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className={styles.formLabel}>설명
            <textarea className={styles.formTextarea} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
          </label>
          <label className={styles.formLabel}>표시 순서
            <input className={styles.formInput} type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: Number(e.target.value) })} />
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
        <ConfirmModal
          message="이 마구를 삭제(비활성화)하시겠습니까?"
          onConfirm={() => handleDelete(deleteConfirmId)}
          onCancel={() => setDeleteConfirmId(null)}
          isPending={deleteMut.isPending}
        />
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
          <button type="submit" className={styles.submitBtn} disabled={isPending}>
            {isPending ? "저장 중..." : "저장"}
          </button>
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
          <button type="button" className={styles.deleteBtn} onClick={onConfirm} disabled={isPending}>
            {isPending ? "처리 중..." : "삭제"}
          </button>
        </div>
      </div>
    </div>,
    modalRoot
  );
}
