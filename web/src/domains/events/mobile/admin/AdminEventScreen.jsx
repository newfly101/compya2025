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
  requestAdminGetAllEventList,
  requestAdminInsertNewExEvent,
  requestAdminUpdateExEvent,
  requestAdminDeleteEvent,
  requestAdminUploadEventImage,
  EVENTS_ADMIN_PAGE_SIZE,
} from "@/domains/events/store/admin/thunks.js";
import styles from "./AdminEventScreen.module.scss";

// DB site_events.event_type enum('OFFICIAL','INTERNAL') — 실데이터 기준. 다른 값 추가 금지.
const EVENT_TYPES = [
  { value: "OFFICIAL", label: "공식 이벤트" },
  { value: "INTERNAL", label: "자체 이벤트" },
];
const EVENT_TYPE_LABELS = Object.fromEntries(EVENT_TYPES.map((t) => [t.value, t.label]));

const TYPE_FILTER_OPTIONS = [{ value: "all", label: "전체" }, ...EVENT_TYPES];
const VISIBLE_FILTER_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "visible", label: "노출" },
  { value: "hidden", label: "숨김" },
];

const EMPTY_FORM = {
  title: "",
  eventType: "OFFICIAL",
  startAt: "",
  expireAt: "",
  imageUrl: "",
  externalLink: "",
  visible: true,
};

const formOf = (event) => ({
  title: event.title ?? "",
  eventType: event.eventType ?? "OFFICIAL",
  startAt: event.startAt?.slice(0, 10) ?? "",
  expireAt: event.expireAt?.slice(0, 10) ?? "",
  imageUrl: event.imageUrl ?? "",
  externalLink: event.externalLink ?? "",
  visible: event.visible ?? true,
});

// 업로드 응답 형태가 raw string / { url, fileName } / 래핑된 { data: {...} } 중 무엇이 오든 URL 을 뽑아낸다.
const extractUploadedUrl = (result) => {
  if (typeof result === "string") return result;
  if (result && typeof result === "object") {
    if (typeof result.url === "string") return result.url;
    if (result.data) return extractUploadedUrl(result.data);
  }
  return null;
};

export default function AdminEventScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { events, loading, error, page, hasMore } = useSelector((s) => s.events);

  useSetTopBar({ variant: "page", title: "이벤트 관리", onBack: () => navigate(-1) });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibleFilter, setVisibleFilter] = useState("all");
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const { editTarget, isOpen, openCreate, closeCreate, openEdit, closeEdit } = useTableModal();

  useEffect(() => {
    dispatch(requestAdminGetAllEventList({ page: 0, size: EVENTS_ADMIN_PAGE_SIZE }));
  }, [dispatch]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    try {
      await dispatch(
        requestAdminGetAllEventList({ page: page + 1, size: EVENTS_ADMIN_PAGE_SIZE })
      ).unwrap();
    } catch {
      // 실패 시 상단 error 상태로 이미 반영됨 — 별도 처리 없음
    } finally {
      setLoadingMore(false);
    }
  };

  const filtered = events.filter((e) => {
    const matchSearch = e.title?.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || e.eventType === typeFilter;
    const matchVisible =
      visibleFilter === "all" ||
      (visibleFilter === "visible" && e.visible) ||
      (visibleFilter === "hidden" && !e.visible);
    return matchSearch && matchType && matchVisible;
  });

  const handleOpenCreate = () => {
    setForm(EMPTY_FORM);
    setUploadError(null);
    openCreate();
  };

  const handleOpenEdit = (event) => {
    setForm(formOf(event));
    setUploadError(null);
    openEdit(event);
  };

  const closeModal = () => {
    closeCreate();
    closeEdit();
  };

  const handleDelete = (event) => setDeleteTarget(event);

  const confirmDelete = () => {
    if (deleteTarget) dispatch(requestAdminDeleteEvent(deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 같은 파일 재선택 가능하게 초기화
    if (!file) return;

    setUploading(true);
    setUploadError(null);
    try {
      const result = await dispatch(requestAdminUploadEventImage(file)).unwrap();
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
    if (editTarget) {
      dispatch(requestAdminUpdateExEvent({ id: editTarget.id, ...form }));
    } else {
      dispatch(requestAdminInsertNewExEvent(form));
    }
    closeModal();
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const columns = [
    { key: "title", label: "제목", align: "left" },
    {
      key: "eventType",
      label: "타입",
      render: (e) => EVENT_TYPE_LABELS[e.eventType] ?? e.eventType,
    },
    {
      key: "period",
      label: "기간",
      render: (e) => `${e.startAt?.slice(0, 10) ?? "-"} ~ ${e.expireAt?.slice(0, 10) ?? "-"}`,
    },
    {
      key: "visible",
      label: "노출여부",
      render: (e) => (e.visible ? "노출" : "숨김"),
    },
    {
      key: "actions",
      label: "관리",
      render: (e) => (
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={(ev) => {
              ev.stopPropagation();
              handleOpenEdit(e);
            }}
          >
            수정
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={(ev) => {
              ev.stopPropagation();
              handleDelete(e);
            }}
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  const renderBody = () => {
    if (loading && events.length === 0) return <AdminStateBox status="loading" />;
    if (error && events.length === 0) {
      return (
        <AdminStateBox
          status="error"
          message={error}
          onRetry={() => dispatch(requestAdminGetAllEventList({ page: 0, size: EVENTS_ADMIN_PAGE_SIZE }))}
        />
      );
    }
    if (filtered.length === 0) return <AdminStateBox status="empty" message="이벤트가 없습니다." />;

    return (
      <>
        <AdminTable
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          onRowClick={(e) => setExpandedId((prev) => (prev === e.id ? null : e.id))}
          expandedKey={expandedId}
          renderDetail={(e) => (
            <div className={styles.detail}>
              {e.imageUrl && <img className={styles.detailImage} src={e.imageUrl} alt={e.title} />}
              <div className={styles.detailField}>
                <span className={styles.detailLabel}>외부 링크</span>
                <span className={styles.detailValue}>{e.externalLink || "-"}</span>
              </div>
            </div>
          )}
        />
        {hasMore && (
          <div className={styles.loadMoreRow}>
            <button className={styles.loadMoreBtn} onClick={handleLoadMore} disabled={loadingMore}>
              {loadingMore ? "불러오는 중..." : "더 보기"}
            </button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className={styles.page}>
      <AdminToolbar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="이벤트 제목 검색"
        filters={[
          { key: "eventType", options: TYPE_FILTER_OPTIONS, value: typeFilter, onChange: setTypeFilter },
          { key: "visible", options: VISIBLE_FILTER_OPTIONS, value: visibleFilter, onChange: setVisibleFilter },
        ]}
        onCreate={handleOpenCreate}
        createLabel="이벤트 등록"
      />

      {renderBody()}

      <AdminModal open={isOpen} title={editTarget ? "이벤트 수정" : "이벤트 등록"} onClose={closeModal}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            제목
            <input className={styles.input} name="title" value={form.title} onChange={handleFormChange} required />
          </label>
          <label className={styles.label}>
            이벤트 타입
            <select className={styles.input} name="eventType" value={form.eventType} onChange={handleFormChange}>
              {EVENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </label>
          <label className={styles.label}>
            시작일
            <input className={styles.input} type="date" name="startAt" value={form.startAt} onChange={handleFormChange} required />
          </label>
          <label className={styles.label}>
            종료일
            <input className={styles.input} type="date" name="expireAt" value={form.expireAt} onChange={handleFormChange} required />
          </label>
          <label className={styles.label}>
            이벤트 이미지
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
                <img className={styles.uploadPreview} src={form.imageUrl} alt="이벤트 이미지 미리보기" />
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
          <label className={styles.label}>
            외부 링크
            <input className={styles.input} name="externalLink" value={form.externalLink} onChange={handleFormChange} placeholder="https://..." />
          </label>
          <label className={styles.checkLabel}>
            <input type="checkbox" name="visible" checked={form.visible} onChange={handleFormChange} />
            노출 여부
          </label>
          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={closeModal}>취소</button>
            <button type="submit" className={styles.submitBtn}>{editTarget ? "수정" : "등록"}</button>
          </div>
        </form>
      </AdminModal>

      <AdminConfirmDialog
        open={!!deleteTarget}
        title="이벤트 삭제"
        message={`"${deleteTarget?.title ?? ""}" 이벤트를 삭제하시겠습니까?`}
        dangerous
        confirmLabel="삭제"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
