import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useSetTopBar } from "@/app/provider/TopBarProvider";
import {
  requestAdminGetNoticeList,
  requestAdminInsertNotice,
  requestAdminUpdateNotice,
  requestAdminUpdateNoticeVisible,
} from "@/domains/notices/store/admin/thunks.js";
import styles from "./AdminNoticeScreen.module.scss";

const SOURCES = ["SITE", "OFFICIAL"];

const EMPTY_FORM = {
  title: "",
  content: "",
  source: "SITE",
  isVisible: true,
  isPinned: false,
};

export default function AdminNoticeScreen() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { siteNotices, loading, error } = useSelector((s) => s.notices);

  useSetTopBar({ variant: "page", title: "공지 관리", onBack: () => navigate(-1) });

  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [visibleFilter, setVisibleFilter] = useState("all");
  const [pinnedFilter, setPinnedFilter] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

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

  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setSheetOpen(true);
  };

  const openEdit = (notice) => {
    setEditTarget(notice);
    setForm({
      title: notice.title ?? "",
      content: notice.content ?? "",
      source: notice.source ?? "SITE",
      isVisible: notice.isVisible ?? true,
      isPinned: notice.isPinned ?? false,
    });
    setSheetOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editTarget) {
      dispatch(requestAdminUpdateNotice({ id: editTarget.id, ...form }));
    } else {
      dispatch(requestAdminInsertNotice(form));
    }
    setSheetOpen(false);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleToggleVisible = (n) => {
    dispatch(requestAdminUpdateNoticeVisible({ id: n.id, visible: !n.isVisible }));
  };

  /* 상태 분기 */
  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>불러오는 중...</p>
        </div>
      );
    }
    if (error) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateError}>{error}</p>
          <button className={styles.retryBtn} onClick={() => dispatch(requestAdminGetNoticeList())}>
            다시 시도
          </button>
        </div>
      );
    }
    if (filtered.length === 0) {
      return (
        <div className={styles.stateBox}>
          <p className={styles.stateText}>공지가 없습니다.</p>
        </div>
      );
    }
    return (
      <ul className={styles.list}>
        {filtered.map((n) => (
          <li key={n.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div className={styles.cardMeta}>
                <span className={styles.sourceChip}>{n.source}</span>
                {n.isPinned && <span className={styles.pinnedChip}>고정</span>}
              </div>
              <span className={`${styles.chip} ${n.isVisible ? styles.chipOn : styles.chipOff}`}
                    onClick={() => handleToggleVisible(n)}
                    role="button"
                    tabIndex={0}
              >
                {n.isVisible ? "노출" : "숨김"}
              </span>
            </div>
            <p className={styles.cardTitle}>{n.title}</p>
            <p className={styles.cardDate}>{n.publishedAt?.slice(0, 10) ?? "-"}</p>
            <div className={styles.cardActions}>
              <button className={styles.editBtn} onClick={() => openEdit(n)}>수정</button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={styles.page}>
      {/* 검색 + 필터 */}
      <div className={styles.toolbar}>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="공지 제목 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className={styles.filterChips}>
          <button
            className={`${styles.chip} ${sourceFilter === "all" ? styles.chipActive : ""}`}
            onClick={() => setSourceFilter("all")}
          >전체</button>
          {SOURCES.map((s) => (
            <button
              key={s}
              className={`${styles.chip} ${sourceFilter === s ? styles.chipActive : ""}`}
              onClick={() => setSourceFilter(s)}
            >{s}</button>
          ))}
          <button
            className={`${styles.chip} ${visibleFilter === "visible" ? styles.chipActive : ""}`}
            onClick={() => setVisibleFilter(visibleFilter === "visible" ? "all" : "visible")}
          >노출만</button>
          <button
            className={`${styles.chip} ${pinnedFilter === "pinned" ? styles.chipActive : ""}`}
            onClick={() => setPinnedFilter(pinnedFilter === "pinned" ? "all" : "pinned")}
          >고정만</button>
        </div>
      </div>

      {/* 등록 버튼 */}
      <div className={styles.addRow}>
        <button className={styles.addBtn} onClick={openCreate}>+ 공지 등록</button>
      </div>

      {renderContent()}

      {/* Bottom Sheet */}
      {sheetOpen && (
        <div className={styles.overlay} onClick={() => setSheetOpen(false)}>
          <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.sheetTitle}>{editTarget ? "공지 수정" : "공지 등록"}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <label className={styles.label}>
                제목
                <input className={styles.input} name="title" value={form.title} onChange={handleFormChange} required />
              </label>
              <label className={styles.label}>
                내용
                <textarea
                  className={`${styles.input} ${styles.textarea}`}
                  name="content"
                  value={form.content}
                  onChange={handleFormChange}
                  rows={4}
                />
              </label>
              <label className={styles.label}>
                소스 구분
                <select className={styles.input} name="source" value={form.source} onChange={handleFormChange}>
                  {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <label className={styles.checkLabel}>
                <input type="checkbox" name="isVisible" checked={form.isVisible} onChange={handleFormChange} />
                노출 여부
              </label>
              <label className={styles.checkLabel}>
                <input type="checkbox" name="isPinned" checked={form.isPinned} onChange={handleFormChange} />
                고정 여부
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
