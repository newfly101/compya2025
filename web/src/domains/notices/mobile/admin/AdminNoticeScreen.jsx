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
  requestAdminGetNoticeList,
  requestAdminInsertNotice,
  requestAdminUpdateNotice,
  requestAdminUpdateNoticeVisible,
  requestAdminUpdateNoticePinned,
  requestAdminDeleteNotice,
} from "@/domains/notices/store/admin/thunks.js";
import styles from "./AdminNoticeScreen.module.scss";

// DB enum(site_notices.source) 실측: INTERNAL(사이트 자체 작성) / EXTERNAL(게임사 공식 공지 링크)
const SOURCES = ["INTERNAL", "EXTERNAL"];
const SOURCE_LABELS = {
  INTERNAL: "사이트 공지",
  EXTERNAL: "공식 공지 링크",
};

const SOURCE_FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  ...SOURCES.map((s) => ({ value: s, label: SOURCE_LABELS[s] })),
];

const VISIBLE_FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "visible", label: "노출" },
  { value: "hidden", label: "숨김" },
];

const PINNED_FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "pinned", label: "고정" },
  { value: "normal", label: "일반" },
];

const EMPTY_FORM = {
  title: "",
  content: "",
  externalUrl: "",
  source: "INTERNAL",
  isVisible: true,
  isPinned: false,
};

const formOf = (notice) => ({
  title: notice.title ?? "",
  content: notice.content ?? "",
  externalUrl: notice.externalUrl ?? "",
  source: notice.source ?? "INTERNAL",
  isVisible: notice.isVisible ?? true,
  isPinned: notice.isPinned ?? false,
});

export default function AdminNoticeScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { siteNotices, loading, error } = useSelector((s) => s.notices);

  useSetTopBar({ variant: "page", title: "공지 관리", onBack: () => navigate(-1) });

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [visibleFilter, setVisibleFilter] = useState("all");
  const [pinnedFilter, setPinnedFilter] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { editTarget, isOpen, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  useEffect(() => {
    dispatch(requestAdminGetNoticeList());
  }, [dispatch]);

  const filtered = siteNotices.filter((n) => {
    const matchSearch = n.title?.toLowerCase().includes(search.toLowerCase());
    const matchSource = sourceFilter === "all" || n.source === sourceFilter;
    const matchVisible =
      visibleFilter === "all" ||
      (visibleFilter === "visible" && n.isVisible) ||
      (visibleFilter === "hidden" && !n.isVisible);
    const matchPinned =
      pinnedFilter === "all" ||
      (pinnedFilter === "pinned" && n.isPinned) ||
      (pinnedFilter === "normal" && !n.isPinned);
    return matchSearch && matchSource && matchVisible && matchPinned;
  });

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    openCreate();
  };

  const handleOpenEdit = (notice) => {
    setForm(formOf(notice));
    openEdit(notice);
  };

  const closeModal = () => {
    closeCreate();
    closeEdit();
  };

  const handleDelete = (notice) => setDeleteTarget(notice);

  const confirmDelete = () => {
    if (deleteTarget) dispatch(requestAdminDeleteNotice(deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // DB CHECK 제약(chk_site_notices_source_payload) 미러링: source 별 content/externalUrl 배타
    const payload =
      form.source === "EXTERNAL"
        ? { ...form, content: null }
        : { ...form, externalUrl: null };
    if (editTarget) {
      dispatch(requestAdminUpdateNotice({ id: editTarget.id, ...payload }));
    } else {
      dispatch(requestAdminInsertNotice(payload));
    }
    closeModal();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleToggleVisible = (n) => {
    dispatch(requestAdminUpdateNoticeVisible({ id: n.id, visible: !n.isVisible }));
  };

  const handleTogglePinned = (n) => {
    dispatch(requestAdminUpdateNoticePinned({ id: n.id, pinned: !n.isPinned }));
  };

  const columns = [
    { key: "title", label: "제목", align: "left" },
    {
      key: "source",
      label: "구분",
      render: (n) => SOURCE_LABELS[n.source] ?? n.source,
    },
    {
      key: "isVisible",
      label: "노출",
      render: (n) => (
        <span
          className={`${styles.chip} ${n.isVisible ? styles.chipOn : styles.chipOff}`}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            handleToggleVisible(n);
          }}
        >
          {n.isVisible ? "노출" : "숨김"}
        </span>
      ),
    },
    {
      key: "isPinned",
      label: "고정",
      render: (n) => (
        <span
          className={`${styles.chip} ${n.isPinned ? styles.chipOn : styles.chipOff}`}
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            handleTogglePinned(n);
          }}
        >
          {n.isPinned ? "고정" : "일반"}
        </span>
      ),
    },
    {
      key: "publishedAt",
      label: "게시일",
      render: (n) => n.publishedAt?.slice(0, 10) ?? "-",
    },
    {
      key: "actions",
      label: "관리",
      render: (n) => (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(n);
            }}
          >
            수정
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(n);
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
        searchPlaceholder="공지 제목 검색"
        filters={[
          {
            key: "source",
            label: "구분",
            options: SOURCE_FILTER_OPTIONS,
            value: sourceFilter,
            onChange: setSourceFilter,
          },
          {
            key: "visible",
            label: "노출",
            options: VISIBLE_FILTER_OPTIONS,
            value: visibleFilter,
            onChange: setVisibleFilter,
          },
          {
            key: "pinned",
            label: "고정",
            options: PINNED_FILTER_OPTIONS,
            value: pinnedFilter,
            onChange: setPinnedFilter,
          },
        ]}
        onCreate={handleOpenCreate}
        createLabel="공지 등록"
      />

      {loading && <AdminStateBox status="loading" />}
      {!loading && error && (
        <AdminStateBox
          status="error"
          message={error}
          onRetry={() => dispatch(requestAdminGetNoticeList())}
        />
      )}
      {!loading && !error && filtered.length === 0 && (
        <AdminStateBox status="empty" message="공지가 없습니다." />
      )}
      {!loading && !error && filtered.length > 0 && (
        <AdminTable columns={columns} rows={filtered} rowKey={(n) => n.id} />
      )}

      <AdminModal open={isOpen} title={editTarget ? "공지 수정" : "공지 등록"} onClose={closeModal}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            제목
            <input className={styles.input} name="title" value={form.title} onChange={handleFormChange} required />
          </label>
          <label className={styles.label}>
            소스 구분
            <select className={styles.input} name="source" value={form.source} onChange={handleFormChange}>
              {SOURCES.map((s) => <option key={s} value={s}>{SOURCE_LABELS[s]}</option>)}
            </select>
          </label>
          {form.source === "EXTERNAL" ? (
            <label className={styles.label}>
              외부 링크
              <input
                className={styles.input}
                name="externalUrl"
                type="url"
                placeholder="https://..."
                value={form.externalUrl}
                onChange={handleFormChange}
                required
              />
            </label>
          ) : (
            <label className={styles.label}>
              내용
              <textarea
                className={`${styles.input} ${styles.textarea}`}
                name="content"
                value={form.content}
                onChange={handleFormChange}
                rows={4}
                required
              />
            </label>
          )}
          <label className={styles.checkLabel}>
            <input type="checkbox" name="isVisible" checked={form.isVisible} onChange={handleFormChange} />
            노출 여부
          </label>
          <label className={styles.checkLabel}>
            <input type="checkbox" name="isPinned" checked={form.isPinned} onChange={handleFormChange} />
            고정 여부
          </label>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>취소</button>
            <button type="submit" className={styles.submitBtn}>{editTarget ? "수정" : "등록"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="공지 삭제"
        message={`"${deleteTarget?.title ?? ""}" 공지를 삭제하시겠습니까?`}
        dangerous
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
