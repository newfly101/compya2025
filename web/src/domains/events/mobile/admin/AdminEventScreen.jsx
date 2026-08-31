import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
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

const EMPTY_FORM = {
  title: "",
  eventType: "OFFICIAL",
  startAt: "",
  expireAt: "",
  imageUrl: "",
  externalLink: "",
  visible: true,
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

export default function AdminEventScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { events, loading, error, page, hasMore } = useSelector((s) => s.events);

  useSetTopBar({ variant: "page", title: "이벤트 관리", onBack: () => navigate(-1) });

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [visibleFilter, setVisibleFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loadingMore, setLoadingMore] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

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

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setUploadError(null);
    setSheetOpen(true);
  };

  const openEdit = (event) => {
    setEditTarget(event);
    setForm({
      title: event.title ?? "",
      eventType: event.eventType ?? "OFFICIAL",
      startAt: event.startAt?.slice(0, 10) ?? "",
      expireAt: event.expireAt?.slice(0, 10) ?? "",
      imageUrl: event.imageUrl ?? "",
      externalLink: event.externalLink ?? "",
      visible: event.visible ?? true,
    });
    setUploadError(null);
    setSheetOpen(true);
  };

  const handleDelete = (id) => {
    if (!window.confirm("이벤트를 삭제하시겠습니까?")) return;
    dispatch(requestAdminDeleteEvent(id));
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
    setSheetOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  /* 상태 분기 — loading 은 "최초 로딩" 만 전체 화면으로 가린다. "더 보기" 는 하단 버튼 상태로 표시. */
  const renderContent = () => {
    if (loading && events.length === 0) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>불러오는 중...</p>
        </div>
      );
    }
    if (error && events.length === 0) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateError}>{error}</p>
          <button
            className={styles.retryBtn}
            onClick={() => dispatch(requestAdminGetAllEventList({ page: 0, size: EVENTS_ADMIN_PAGE_SIZE }))}
          >
            다시 시도
          </button>
        </div>
      );
    }
    if (filtered.length === 0) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>이벤트가 없습니다.</p>
        </div>
      );
    }
    return (
      <>
        <ul className={styles.list}>
          {filtered.map((ev) => (
            <li key={ev.id} className={styles.card}>
              {ev.imageUrl && (
                <img className={styles.thumbnail} src={ev.imageUrl} alt={ev.title} />
              )}
              <div className={styles.cardBody}>
                <div className={styles.cardHeader}>
                  <span className={styles.cardTitle}>{ev.title}</span>
                  <span className={`${styles.chip} ${ev.visible ? styles.chipOn : styles.chipOff}`}>
                    {ev.visible ? "노출" : "숨김"}
                  </span>
                </div>
                <div className={styles.cardMeta}>
                  <span className={styles.typeChip}>{EVENT_TYPE_LABELS[ev.eventType] ?? ev.eventType}</span>
                  <span className={styles.cardDate}>
                    {ev.startAt?.slice(0, 10)} ~ {ev.expireAt?.slice(0, 10)}
                  </span>
                </div>
                <div className={styles.cardActions}>
                  <button className={styles.editBtn} onClick={() => openEdit(ev)}>수정</button>
                  <button className={styles.deleteBtn} onClick={() => handleDelete(ev.id)}>삭제</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
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
      {/* 검색 + 필터 */}
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="이벤트 제목 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filterChips}>
          <button
            className={`${styles.chip} ${typeFilter === "all" ? styles.chipActive : ""}`}
            onClick={() => setTypeFilter("all")}
          >전체</button>
          {EVENT_TYPES.map((t) => (
            <button
              key={t.value}
              className={`${styles.chip} ${typeFilter === t.value ? styles.chipActive : ""}`}
              onClick={() => setTypeFilter(t.value)}
            >{t.label}</button>
          ))}
          <button
            className={`${styles.chip} ${visibleFilter === "visible" ? styles.chipActive : ""}`}
            onClick={() => setVisibleFilter(visibleFilter === "visible" ? "all" : "visible")}
          >노출만</button>
        </div>
      </div>

      {/* 등록 버튼 */}
      <div className={styles.addRow}>
        <button className={styles.addBtn} onClick={openCreate}>+ 이벤트 등록</button>
      </div>

      {renderContent()}

      {/* Bottom Sheet */}
      {sheetOpen && (
        <div className={styles.overlay} onClick={() => setSheetOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.sheetTitle}>{editTarget ? "이벤트 수정" : "이벤트 등록"}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>
                제목
                <input className={styles.input} name="title" value={form.title} onChange={handleFormChange} required />
              </label>
              <label className={styles.label}>
                이벤트 타입
                <select className={styles.input} name="eventType" value={form.eventType} onChange={handleFormChange}>
                  {EVENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
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
                <button type="button" className={styles.cancelBtn} onClick={() => setSheetOpen(false)}>취소</button>
                <button type="submit" className={styles.submitBtn}>{editTarget ? "수정" : "등록"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
