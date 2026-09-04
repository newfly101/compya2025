import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminModal from "@/global/ui/admin/modal/AdminModal.jsx";
import AdminStateBox from "@/global/ui/admin/stateBox/AdminStateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import useTableModal from "@/global/ui/admin/hooks/useTableModal.js";
import {
  requestAdminQuizAll,
  requestAdminQuizCreate,
  requestAdminQuizUpdate,
  requestAdminQuizDelete,
  requestAdminUploadQuizImage,
} from "@/domains/quiz/store/admin/thunks.js";
import styles from "./AdminQuizScreen.module.scss";

// title 은 서버가 round 로 자동 합성한다(DB 저장값 아님) — 폼에 입력칸을 두지 않는다.
const EMPTY_FORM = {
  round: "",
  imageUrl: "",
};

// 업로드 응답 형태가 raw string / { url, fileName } / 래핑된 { data: {...} } 중 무엇이 오든 URL 을 뽑아낸다.
const extractUploadedUrl = (result) => {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    if (typeof result.url === "string") return result.url;
    if (result.data) return extractUploadedUrl(result.data);
  }
  return null;
};

const formOf = (quiz) => ({
  round: quiz.round ?? "",
  imageUrl: quiz.imageUrl ?? "",
});

export default function AdminQuizScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { quizAnswers, loading, error } = useSelector((s) => s.quiz);

  useSetTopBar({ variant: "page", title: "퀴즈 관리", onBack: () => navigate(-1) });

  const [search, setSearch] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const { editTarget, isOpen, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  useEffect(() => {
    dispatch(requestAdminQuizAll());
  }, [dispatch]);

  const filtered = quizAnswers.filter((q) => String(q.round ?? "").includes(search.trim()));

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setUploadError(null);
    openCreate();
  };

  const handleOpenEdit = (quiz) => {
    setForm(formOf(quiz));
    setUploadError(null);
    openEdit(quiz);
  };

  const closeModal = () => {
    closeCreate();
    closeEdit();
  };

  const handleDelete = (quiz) => setDeleteTarget(quiz);

  const confirmDelete = () => {
    if (deleteTarget) dispatch(requestAdminQuizDelete(deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 가능하게 초기화
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const result = await dispatch(requestAdminUploadQuizImage(file)).unwrap();
      const url = extractUploadedUrl(result);
      if (!url) throw new Error("업로드 응답에서 URL 을 찾을 수 없습니다.");
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (err) {
      setUploadError(typeof err === "string" ? err : err?.message ?? "이미지 업로드에 실패했습니다.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, round: Number(form.round) };
    if (editTarget) {
      dispatch(requestAdminQuizUpdate({ id: editTarget.id, ...payload }));
    } else {
      dispatch(requestAdminQuizCreate(payload));
    }
    closeModal();
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const columns = [
    { key: "round", label: "회차", width: 56 },
    { key: "title", label: "제목", align: "left", width: 180 },
    {
      key: "imageUrl",
      label: "정답 이미지",
      width: 90,
      render: (q) =>
        q.imageUrl ? (
          <img className={styles.thumbnail} src={q.imageUrl} alt={`${q.round}회 정답 이미지`} />
        ) : (
          "-"
        ),
    },
    {
      key: "updatedAt",
      label: "수정일",
      width: 100,
      render: (q) => q.updatedAt?.slice(0, 16) ?? q.createdAt?.slice(0, 16) ?? "-",
    },
    {
      key: "actions",
      label: "관리",
      width: 96,
      render: (q) => (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(q);
            }}
          >
            수정
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(q);
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="회차 검색"
        onCreate={handleOpenCreate}
        createLabel="퀴즈 등록"
      />

      {loading && <AdminStateBox status="loading" />}
      {!loading && error && (
        <AdminStateBox
          status="error"
          message={error}
          onRetry={() => dispatch(requestAdminQuizAll())}
        />
      )}
      {!loading && !error && filtered.length === 0 && (
        <AdminStateBox status="empty" message="등록된 퀴즈가 없습니다." />
      )}
      {!loading && !error && filtered.length > 0 && (
        <AdminTable columns={columns} rows={filtered} rowKey={(q) => q.id} />
      )}

      <AdminModal open={isOpen} title={editTarget ? "퀴즈 수정" : "퀴즈 등록"} onClose={closeModal}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            회차
            <input
              className={styles.input}
              type="number"
              name="round"
              value={form.round}
              onChange={handleFormChange}
              required
            />
          </label>
          <label className={styles.label}>
            정답 이미지
            <div className={styles.uploadRow}>
              <label className={styles.uploadBtn}>
                {uploading ? "업로드 중..." : "이미지 선택"}
                <input
                  className={styles.uploadInput}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  disabled={uploading}
                />
              </label>
              {form.imageUrl && (
                <img className={styles.uploadPreview} src={form.imageUrl} alt="정답 이미지 미리보기" />
              )}
            </div>
            {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
            <input
              className={styles.input}
              name="imageUrl"
              value={form.imageUrl}
              onChange={handleFormChange}
              placeholder="업로드하거나 이미지 URL 을 직접 입력하세요"
            />
          </label>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>취소</button>
            <button type="submit" className={styles.submitBtn}>{editTarget ? "수정" : "등록"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="퀴즈 삭제"
        message={`${deleteTarget?.round ?? ""}회 퀴즈를 삭제하시겠습니까?`}
        dangerous
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
