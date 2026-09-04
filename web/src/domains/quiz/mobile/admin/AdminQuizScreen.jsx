import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminToolbar from "@/global/ui/admin/toolbar/AdminToolbar.jsx";
import AdminTable from "@/global/ui/admin/table/AdminTable.jsx";
import AdminPagination from "@/global/ui/admin/pagination/AdminPagination.jsx";
import useAdminPagination from "@/global/ui/admin/pagination/useAdminPagination.js";
import AdminModal from "@/global/ui/admin/modal/AdminModal.jsx";
import AdminStateBox from "@/global/ui/admin/stateBox/AdminStateBox.jsx";
import AdminConfirmDialog from "@/global/ui/admin/confirmDialog/AdminConfirmDialog.jsx";
import AdminSegmented from "@/global/ui/admin/fields/AdminSegmented.jsx";
import AdminFilePicker from "@/global/ui/admin/fields/AdminFilePicker.jsx";
import useTableModal from "@/global/ui/admin/hooks/useTableModal.js";
import "@/global/ui/admin/admin.tokens.scss";
import {
  requestAdminQuizAll,
  requestAdminQuizCreate,
  requestAdminQuizUpdate,
  requestAdminQuizBulkDelete,
  requestAdminUploadQuizImage,
} from "@/domains/quiz/store/admin/thunks.js";
import styles from "./AdminQuizScreen.module.scss";

// title 은 서버가 round 로 자동 합성한다(DB 저장값 아님) — 폼에 입력칸을 두지 않는다.
// 회차 자동 부여 기능은 서버(QuizRequest)에 없다 — 항상 직접 입력만 받는다.
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

// 표시용 — 이미지 URL 마지막 경로 세그먼트를 파일명처럼 보여준다.
const fileNameOf = (url) => {
  if (!url) return null;
  try {
    const clean = url.split("?")[0];
    const seg = clean.substring(clean.lastIndexOf("/") + 1);
    return decodeURIComponent(seg) || null;
  } catch {
    return null;
  }
};

const IMAGE_MODE_OPTIONS = [
  { value: "url", label: "URL 입력" },
  { value: "file", label: "파일 업로드" },
];

// 셸(AdminShellScreen)의 퀴즈 탭 패널로 렌더된다 — 자체 TopBar 를 세팅하지 않는다.
// 셸이 상단바(제목/로그아웃)를 한 번만 소유하고, 탭 전환은 뒤로가기가 아니라 탭 클릭으로 처리된다.
export default function AdminQuizScreen() {
  const dispatch = useDispatch();
  const { quizAnswers, loading, error } = useSelector((s) => s.quiz);

  const [search, setSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(false); // 기본: 회차 내림차순
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageMode, setImageMode] = useState("url");
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const { editTarget, isOpen, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  useEffect(() => {
    dispatch(requestAdminQuizAll());
  }, [dispatch]);

  const searched = quizAnswers.filter((q) => String(q.round ?? "").includes(search.trim()));

  const filtered = [...searched].sort((a, b) =>
    sortAsc ? (a.round ?? 0) - (b.round ?? 0) : (b.round ?? 0) - (a.round ?? 0),
  );

  // 번호식 페이지네이션(8개/페이지, 클라이언트 슬라이스) — 검색/정렬이 바뀌면 1페이지로.
  const { page, pageCount, pageItems, setPage, resetPage } = useAdminPagination(filtered, 8);
  useEffect(() => {
    resetPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, sortAsc]);

  // 현재 페이지에 없는 행의 선택은 자동으로 떨어져 나간다(다음 페이지 이동 시 실수 방지).
  const pageIds = useMemo(() => new Set(pageItems.map((q) => q.id)), [pageItems]);
  const selectedOnPageCount = pageItems.filter((q) => selectedIds.has(q.id)).length;
  const allSelectedOnPage = pageItems.length > 0 && selectedOnPageCount === pageItems.length;

  const toggleRow = (quiz) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(quiz.id)) next.delete(quiz.id);
      else next.add(quiz.id);
      return next;
    });
  };

  const toggleAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      pageIds.forEach((id) => (allSelectedOnPage ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  // 행 삭제 버튼 없음 — 삭제는 체크박스 일괄로만. 서버가 200 이어도 일부만 지울 수 있어
  // (data.failedIds) 실제 지워진 successIds 만 slice 에서 반영한다 — 실패한 항목은
  // 선택 해제된 채 목록에 그대로 남아 "지워지지 않았음"을 알려준다(별도 팝업 없음, 쿠폰 화면과 동일 방식).
  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = () => {
    dispatch(requestAdminQuizBulkDelete([...selectedIds]));
    setSelectedIds(new Set());
    setBulkDeleteConfirmOpen(false);
  };

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setImageMode("url");
    setUploadError(null);
    openCreate();
  };

  const handleOpenEdit = (quiz) => {
    setForm(formOf(quiz));
    setImageMode("url");
    setUploadError(null);
    openEdit(quiz);
  };

  const closeModal = () => {
    closeCreate();
    closeEdit();
  };

  const handleImageFileSelect = async (file) => {
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
    {
      key: "idx",
      label: "#",
      width: 28,
      render: (_q, index) => <span className={styles.idx}>{page * 8 + index + 1}</span>,
    },
    {
      key: "round",
      label: "회차",
      align: "left",
      render: (q) => (
        <div className={styles.mainCell}>
          <span className={styles.round}>{q.round}회차</span>
          <span className={styles.fileName}>{fileNameOf(q.imageUrl) ?? "이미지 없음"}</span>
        </div>
      ),
    },
    {
      key: "imageUrl",
      label: "이미지",
      width: 60,
      render: (q) =>
        q.imageUrl ? (
          <img className={styles.thumbnail} src={q.imageUrl} alt={`${q.round}회 정답 이미지`} />
        ) : (
          <div className={styles.thumbnailEmpty}>없음</div>
        ),
    },
    {
      key: "actions",
      label: "관리",
      width: 56,
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
        totalCount={filtered.length}
        totalLabel="개"
        sortLabel={sortAsc ? "회차 오름차순" : "회차 내림차순"}
        onToggleSort={() => setSortAsc((prev) => !prev)}
        onCreate={handleOpenCreate}
        createLabel="등록"
        selectedCount={selectedOnPageCount}
        onBulkDelete={handleBulkDelete}
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
        <>
          <AdminTable
            columns={columns}
            rows={pageItems}
            rowKey={(q) => q.id}
            selectable
            selectedKeys={selectedIds}
            allSelected={allSelectedOnPage}
            onToggleRow={toggleRow}
            onToggleAll={toggleAllOnPage}
          />
          <AdminPagination page={page} pageCount={pageCount} onChange={setPage} />
        </>
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

          <div className={styles.label}>
            퀴즈 이미지
            <AdminSegmented
              name="imageMode"
              options={IMAGE_MODE_OPTIONS}
              value={imageMode}
              onChange={setImageMode}
            />
            {imageMode === "url" ? (
              <input
                className={styles.input}
                name="imageUrl"
                value={form.imageUrl}
                onChange={handleFormChange}
                placeholder="이미지 URL 을 입력하세요"
              />
            ) : (
              <AdminFilePicker
                fileName={fileNameOf(form.imageUrl)}
                onFileSelect={handleImageFileSelect}
                disabled={uploading}
                placeholder={uploading ? "업로드 중..." : "선택된 파일 없음"}
              />
            )}
            {form.imageUrl && (
              <img className={styles.uploadPreview} src={form.imageUrl} alt="정답 이미지 미리보기" />
            )}
            {uploadError && <p className={styles.uploadError}>{uploadError}</p>}
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>취소</button>
            <button type="submit" className={styles.submitBtn}>{editTarget ? "수정" : "등록"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={bulkDeleteConfirmOpen}
        title="퀴즈 일괄 삭제"
        message={`선택한 퀴즈 ${selectedIds.size}개를 삭제하시겠습니까?`}
        dangerous
        confirmLabel="삭제"
        onConfirm={confirmBulkDelete}
        onCancel={() => setBulkDeleteConfirmOpen(false)}
      />
    </div>
  );
}
